import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin1 } = useAuth();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/audit-logs');
      setLogs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!isAdmin1) {
      alert("Chỉ ADMIN1 mới được xóa nhật ký.");
      return;
    }
    if (!window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ NHẬT KÝ HỆ THỐNG? (Hành động này không thể hoàn tác)")) return;

    try {
      await axios.delete('/api/audit-logs/clear');
      setLogs([]);
      alert("Đã xóa toàn bộ nhật ký.");
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
         <h2 style={{ color: '#0d3b66', margin: 0 }}>🛡️ Nhật ký Hệ thống (Audit Trails)</h2>
         <div>
           {isAdmin1 && (
             <button onClick={handleClearLogs} style={{ padding: '8px 15px', borderRadius: '5px', border: 'none', background: 'var(--haui-red)', color: 'white', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}>
                Xóa toàn bộ
             </button>
           )}
           <button onClick={() => window.history.back()} style={{ padding: '8px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>Quay lại</button>
         </div>
      </div>

      {loading ? (
        <p>Đang tải nhật ký kiểm toán...</p>
      ) : logs.length === 0 ? (
        <p>Chưa có dữ liệu nhật ký.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ backgroundColor: '#f4f7f6' }}>
            <tr>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Thời gian</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Người dùng</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Hành động</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', color: '#666' }}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>{log.User?.fullName || 'N/A'}</span><br />
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{log.User?.email || log.userId}</span>
                </td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: log.action.includes('DELETE') ? 'red' : 'green' }}>{log.action}</td>
                <td style={{ padding: '10px' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
