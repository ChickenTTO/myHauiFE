import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { logAudit } from '../../utils/auditLog';

export default function ResearchBooking() {
  const { currentUser, userRole, isAdmin1 } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [roomAssets, setRoomAssets] = useState<any[]>([]);
  
  const [teachers, setTeachers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    assetId: '',
    assetCode: '',
    startDate: '',
    endDate: '',
    purpose: '',
    projectDetails: '',
    advisorId: '',
    advisorName: ''
  });

  const [activeBorrow, setActiveBorrow] = useState<any>(null);

  useEffect(() => {
    const checkActiveBorrows = async () => {
      try {
        const response = await axios.get('/api/borrow-requests/my-requests');
        const myRequests = response.data;
        const active = myRequests.find((r: any) => ['PENDING_TEACHER', 'PENDING_TT', 'APPROVED', 'ACTIVE'].includes(r.status));
        if (active) {
           setActiveBorrow(active);
        }
      } catch (e) { console.error(e); }
    };

    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/assets');
        const assets = response.data;
        const regex = /(pc|laptop|máy tính|vi tính|máy chủ)/i;
        const computers = assets.filter((item: any) => regex.test(item.assetName));
        setAllAssets(computers);
        const uniqueRooms = [...new Set(computers.map((a: any) => a.location?.split('-')[0].trim()))].filter(Boolean) as string[];
        setRooms(uniqueRooms);
      } catch (e) { console.error(e); }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get('/api/users');
        const allUsers = response.data;
        setTeachers(allUsers.filter((u: any) => u.role === 'TEACHER'));
      } catch (e) { console.error(e); }
    };

    if (currentUser) {
       checkActiveBorrows();
       fetchAssets();
       fetchTeachers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedRoom) {
      const filtered = allAssets.filter(a => a.location?.split('-')[0].trim() === selectedRoom);
      setRoomAssets(filtered);
      setFormData(prev => ({ ...prev, assetId: '', assetCode: '' }));
    } else {
      setRoomAssets([]);
    }
  }, [selectedRoom, allAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.startDate || !formData.purpose) {
      alert("Vui lòng điền đủ Mã tài sản, Ngày bắt đầu và Mục đích!");
      return;
    }

    if ((userRole === 'STUDENT' || userRole === 'GUEST') && !formData.advisorId) {
       alert("Vui lòng chọn Giảng viên Hướng dẫn!");
       return;
    }

    const start = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = (start.getTime() - today.getTime()) / (1000 * 3600 * 24);
    
    if (diffDays < 1) {
      alert("⚠️ Quy định: Bạn phải đăng ký trước ít nhất 1 ngày để Trung tâm sắp xếp.");
      return;
    }

    if (activeBorrow && !isAdmin1) {
      alert("❌ Bạn đang có 1 thiết bị đang mượn hoặc chờ duyệt. Quy định không cho phép mượn nhiều máy.");
      return;
    }

    setLoading(true);
    try {
      // Logic kiểm tra Xung đột tài nguyên (Conflict Resolution)
      const res = await axios.get('/api/borrow-requests'); // In a real app we'd fetch all requests if we have permission, or have a specific API. We'll simplify this check for now or assume backend handles it. But we don't have a specific API for checking conflicts across all users if we are STUDENT (since STUDENT can't fetch all). So we'll skip the frontend check and let it pass or implement an endpoint.
      // For now, let's just create it directly. The backend should ideally check this.
      
      let initialStatus = 'PENDING_TT';
      if (userRole === 'STUDENT' || userRole === 'GUEST') {
         initialStatus = 'PENDING_TEACHER';
      }

      await axios.post('/api/borrow-requests', {
         assetId: formData.assetId,
         purpose: formData.purpose,
         projectDetails: formData.projectDetails,
         advisorId: formData.advisorId,
         advisorName: formData.advisorName,
         startTime: formData.startDate,
         endTime: formData.endDate || null,
         initialStatus
      });
      
      await logAudit('CREATE_BORROW_REQUEST', `Mượn máy ${formData.assetCode}`, currentUser.id, userRole);
      
      alert('✅ Đã gửi yêu cầu mượn máy thành công.');
      window.location.reload();
    } catch (error: any) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#0d3b66', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        Đăng ký mượn Thiết bị Phòng TH/TN (NCKH)
      </h2>
      
      {activeBorrow ? (
        <div style={{ padding: '20px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>⚠️ Bạn đang có yêu cầu mượn máy</h4>
          <p><strong>Mã máy:</strong> {activeBorrow.assetCode}</p>
          <p><strong>Trạng thái:</strong> <span style={{ fontWeight: 'bold', color: activeBorrow.status === 'APPROVED' ? 'green' : 'orange' }}>{activeBorrow.status}</span></p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>* Mỗi người dùng chỉ được mượn 1 thiết bị tại một thời điểm.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Chọn Phòng máy</label>
              <select 
                value={selectedRoom}
                onChange={e => setSelectedRoom(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map(r => <option key={r} value={r}>Phòng {r}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Chọn Mã Thiết bị (*)</label>
              <select 
                value={formData.assetId}
                onChange={e => {
                  const selectedAsset = roomAssets.find(a => a.id.toString() === e.target.value);
                  setFormData({...formData, assetId: e.target.value, assetCode: selectedAsset ? selectedAsset.assetCode : ''});
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                disabled={!selectedRoom}
              >
                <option value="">-- Chọn máy --</option>
                {roomAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.assetCode} ({a.status})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Từ ngày (*)</label>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Đến ngày</label>
              <input 
                type="date" 
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          {(userRole === 'STUDENT' || userRole === 'GUEST') && (
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Giảng viên Hướng dẫn (*) - Bắt buộc duyệt</label>
              <select 
                value={formData.advisorId}
                onChange={e => {
                  const tName = teachers.find(t => t.id === e.target.value)?.fullName || '';
                  setFormData({...formData, advisorId: e.target.value, advisorName: tName})
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">-- Kéo chọn Giảng viên --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                ))}
                {/* Tùy chọn Tự do dành cho trường hợp ngoại lệ */}
                <option value="gv_tudo">Giảng viên Tượng trưng / Tự do (Dành cho Ngoại lệ)</option>
              </select>
              <small style={{ color: '#666' }}>Phiếu của bạn sẽ được gửi tới Giảng viên này để xác nhận trước khi tới cấp Trung tâm.</small>
            </div>
          )}

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Mục đích sử dụng (*)</label>
            <select 
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">-- Chọn mục đích --</option>
              <option value="SV_MOPHON">Mô phỏng / Thiết kế đồ án</option>
              <option value="SV_NCKH">Nghiên cứu khoa học sinh viên</option>
              <option value="GV_GIANGDAY">Giảng dạy nhóm nhỏ</option>
              <option value="GV_NCKH">Nghiên cứu khoa học giảng viên</option>
              <option value="EXTERNAL">Khách ngoài / Khác</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Mô tả chi tiết đề tài / Dự án</label>
            <textarea 
              rows={4}
              placeholder="Giải trình lý do mượn..."
              value={formData.projectDetails}
              onChange={e => setFormData({...formData, projectDetails: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px', fontSize: '0.9rem', color: '#2e7d32' }}>
            <strong>Cam kết:</strong> Tôi cam kết tuân thủ đúng quy định 5S, dọn dẹp vệ sinh trước/sau khi sử dụng. Đồng ý bị khóa tài khoản nếu vi phạm!
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: 'var(--haui-blue)', color: 'white', padding: '15px', 
              borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px'
            }}
          >
            {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Duyệt'}
          </button>
        </form>
      )}
    </div>
  );
}
