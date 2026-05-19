import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { logAudit } from '../../utils/auditLog';

export default function ResearchApprovals() {
  const { currentUser, userRole, isManagement } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delegation State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedDelegate, setSelectedDelegate] = useState('');
  const [delegateUntil, setDelegateUntil] = useState('');
  const [activeDelegation, setActiveDelegation] = useState<any>(null);
  const [isDelegatedToMe, setIsDelegatedToMe] = useState(false);

  const fetchRequests = async () => {
    try {
      // In a real application, delegation would be handled by backend. We'll skip complex delegation logic for now, or assume backend returns all if we have manager roles.
      let hasDelegatedPower = false;
      // if (userRole === 'TEACHER') { ... check backend for delegation ... }

      const response = await axios.get('http://localhost:8080/api/borrow-requests');
      let allReqs = response.data;
      
      if (userRole === 'TEACHER' && !hasDelegatedPower) {
         allReqs = allReqs.filter((r: any) => r.advisorId === String(currentUser?.id));
      }

      setRequests(allReqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDelegationInfo = async () => {
    if (isManagement) {
       try {
           const uSnap = await axios.get('http://localhost:8080/api/users');
           setTeachers(uSnap.data.filter((u: any) => u.role === 'TEACHER'));
       } catch (e) {}
       
       // Just fetch all delegations for demo (backend not implemented, skipping)
    }
  };

  useEffect(() => {
    if (currentUser && ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER'].includes(userRole)) {
       fetchRequests();
       fetchDelegationInfo();
    }
  }, [currentUser, userRole]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:8080/api/borrow-requests/${id}`, {
        status: newStatus
      });
      await logAudit('CHANGE_STATUS', `Duyệt phiếu mượn ${id} -> ${newStatus}`, currentUser.id, isDelegatedToMe ? 'DELEGATED_MANAGER' : userRole);
      alert(`Đã chuyển trạng thái thành ${newStatus}`);
      fetchRequests();
    } catch (err: any) {
      alert('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelegate = async () => {
    if (!selectedDelegate || !delegateUntil) return alert('Vui lòng chọn người và ngày');
    alert('Tính năng ủy quyền đang được cập nhật qua API Node.js!');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
         <h2 style={{ color: '#0d3b66', margin: 0 }}>Trung tâm Phê duyệt NCKH & Mượn Thiết bị</h2>
         <button onClick={() => window.location.href='/research'} style={{ padding: '5px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>Quay lại</button>
      </div>

      {isDelegatedToMe && (
        <div style={{ background: '#e3f2fd', borderLeft: '5px solid #2196f3', padding: '15px', marginBottom: '20px' }}>
          <strong>Quyền Tạm thời:</strong> Bạn đang được Ủy quyền đóng vai trò Quản lý Trung tâm. Bạn có thể duyệt các phiếu cấp TT.
        </div>
      )}

      {isManagement && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#f57c00' }}>👑 Cấp Quyền Ủy Nhiệm (Delegation)</h3>
          {activeDelegation ? (
            <div style={{ color: 'green' }}>Đang ủy quyền cho: <strong>{activeDelegation.id}</strong> đến hết <strong>{activeDelegation.until}</strong></div>
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Chọn Giảng viên:</label>
                <select value={selectedDelegate} onChange={e => setSelectedDelegate(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
                   <option value="">-- Chọn GV --</option>
                   {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Hiệu lực đến:</label>
                <input type="date" value={delegateUntil} onChange={e => setDelegateUntil(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }} />
              </div>
              <button onClick={handleDelegate} style={{ padding: '8px 15px', background: '#f57c00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Giao Quyền</button>
            </div>
          )}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '30px', textAlign: 'center' }}>Đang tải danh sách yêu cầu...</p>
        ) : requests.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Chưa có yêu cầu mượn máy nào.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ backgroundColor: '#f4f7f6' }}>
                <tr>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd' }}>Người Yêu Cầu</th>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd' }}>Vai trò / GVHD</th>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd' }}>Mã Máy</th>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd' }}>Mục đích</th>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd' }}>Thời gian</th>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd' }}>Trạng thái</th>
                  <th style={{ padding: '15px 10px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <strong>{req.User?.fullName}</strong><br/>
                      <small style={{ color: '#666' }}>{req.User?.email}</small>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ padding: '3px 6px', background: '#e0e0e0', borderRadius: '4px', fontSize: '0.8rem' }}>{req.User?.role || 'N/A'}</span>
                      {req.advisorName && <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#666' }}>GVHD: {req.advisorName}</div>}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--haui-blue)' }}>{req.Asset?.assetCode || req.assetId}</td>
                    <td style={{ padding: '12px 10px', maxWidth: '200px' }}>{req.purpose}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {req.startTime ? new Date(req.startTime).toLocaleDateString('vi-VN') : 'N/A'} - {req.endTime ? new Date(req.endTime).toLocaleDateString('vi-VN') : '?'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                        backgroundColor: req.status.includes('PENDING') ? '#fff3e0' : (req.status === 'APPROVED' ? '#e8f5e9' : '#ffebee'),
                        color: req.status.includes('PENDING') ? '#e65100' : (req.status === 'APPROVED' ? '#2e7d32' : '#c62828')
                      }}>
                        {req.status === 'PENDING_TEACHER' ? 'Chờ GV Duyệt' : (req.status === 'PENDING_TT' ? 'Chờ TT Duyệt' : req.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      {userRole === 'TEACHER' && !isDelegatedToMe && req.status === 'PENDING_TEACHER' && (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button onClick={() => handleStatusChange(req.id, 'PENDING_TT')} style={{ background: '#2196f3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>GV Duyệt</button>
                          <button onClick={() => handleStatusChange(req.id, 'REJECTED')} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Từ chối</button>
                        </div>
                      )}
                      
                      {(isManagement || isDelegatedToMe) && req.status === 'PENDING_TT' && (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button onClick={() => handleStatusChange(req.id, 'APPROVED')} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>TT Cấp Máy</button>
                          <button onClick={() => handleStatusChange(req.id, 'REJECTED')} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Từ chối</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
