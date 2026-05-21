import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function ReportSubmission() {
  const { currentUser } = useAuth();
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    requestId: '',
    title: '',
    driveLink: ''
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/borrow-requests/my-requests');
        const myRequests = response.data;
        setActiveRequests(myRequests.filter((r: any) => ['APPROVED', 'ACTIVE', 'COMPLETED'].includes(r.status)));
      } catch (err) {
        console.error(err);
      }
    };
    if (currentUser) fetchRequests();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requestId || !formData.title) {
      alert("Vui lòng điền đủ Yêu cầu mượn và Tên báo cáo!");
      return;
    }
    if (!formData.driveLink) {
      alert("Vui lòng điền Link Google Drive chứa báo cáo!");
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/research-reports', {
        requestId: formData.requestId,
        content: formData.title,
        fileUrl: formData.driveLink
      });

      alert('✅ Nộp báo cáo NCKH thành công!');
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
        Nộp Báo cáo Nghiên cứu Khoa học
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Chọn Đề tài / Mã Mượn máy (*)</label>
          <select 
            value={formData.requestId}
            onChange={e => setFormData({...formData, requestId: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">-- Chọn máy đã mượn --</option>
            {activeRequests.map(req => (
              <option key={req.id} value={req.id}>{req.Asset?.assetCode || req.assetId} - {req.purpose}</option>
            ))}
          </select>
          <small style={{ color: '#666' }}>Hệ thống chỉ hiển thị các thiết bị bạn đã được phê duyệt mượn.</small>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Tên Báo cáo / Đề tài (*)</label>
          <input 
            type="text" 
            placeholder="VD: Báo cáo Thiết kế Mô phỏng Robot bằng phần mềm MATLAB"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '8px', background: '#f9f9f9' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>🔗 Link Google Drive chứa Báo Cáo (*)</label>
          <input 
            type="url" 
            placeholder="https://drive.google.com/..."
            value={formData.driveLink}
            onChange={e => setFormData({...formData, driveLink: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <small style={{ color: '#666' }}>Tải file báo cáo (.pdf, .docx) lên Google Drive và dán link vào đây. Nhớ cấp quyền truy cập "Bất kỳ ai có liên kết".</small>
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
          {loading ? 'Đang tải lên...' : 'Nộp Báo Cáo'}
        </button>
      </form>
    </div>
  );
}
