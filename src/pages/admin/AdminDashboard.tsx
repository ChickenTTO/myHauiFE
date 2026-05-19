import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userRole, isAdmin1, isAdmin2 } = useAuth();

  if (!isAdmin1 && !isAdmin2) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
         <h2 style={{ color: 'var(--haui-red)' }}>Truy cập bị từ chối</h2>
         <p>Bạn không có quyền truy cập vào trang Quản trị Hệ thống.</p>
      </div>
    );
  }

  const handleDeleteData = () => {
    if (isAdmin2) {
      alert("Quyền ADMIN2 không được phép xóa dữ liệu hệ thống!");
      return;
    }
    const confirm = window.confirm("CẢNH BÁO: Bạn sắp xóa dữ liệu hệ thống. Bạn có chắc chắn?");
    if (confirm) {
      alert("Đang gọi API xóa dữ liệu... (Chưa implement)");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'var(--haui-blue, #0d3b66)', marginBottom: '30px', textAlign: 'center' }}>
        Quản trị Hệ thống ({userRole})
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={cardStyle} onClick={() => navigate('/admin/users')}>
          <div style={iconStyle}>👥</div>
          <h3 style={titleStyle}>Quản lý Người dùng</h3>
          <p style={descStyle}>Duyệt và phân quyền tài khoản.</p>
        </div>

        <div style={cardStyle} onClick={() => navigate('/admin/timetable')}>
          <div style={iconStyle}>📅</div>
          <h3 style={titleStyle}>Quản lý Thời khóa biểu</h3>
          <p style={descStyle}>Nhập xuất file TKB toàn trường.</p>
        </div>

        {isAdmin1 && (
          <div style={cardStyle} onClick={() => navigate('/admin/audit-logs')}>
            <div style={iconStyle}>🛡️</div>
            <h3 style={titleStyle}>Nhật ký Hệ thống</h3>
            <p style={descStyle}>Theo dõi lịch sử hoạt động (Chỉ ADMIN1).</p>
          </div>
        )}

      </div>

      {/* Database Operations */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h3 style={{ color: '#0d3b66', marginTop: 0 }}>Thao tác Cơ sở dữ liệu</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Chỉ ADMIN1 được phép Xóa Data. ADMIN2 có thể Upload Data mới.</p>
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button style={{ padding: '10px 20px', background: 'var(--haui-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            📥 Upload Database Mới
          </button>
          
          <button 
            onClick={handleDeleteData}
            disabled={isAdmin2}
            style={{ 
              padding: '10px 20px', 
              background: isAdmin2 ? '#ccc' : 'var(--haui-red)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isAdmin2 ? 'not-allowed' : 'pointer' 
            }}
          >
            🗑️ Xóa Database
          </button>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  border: '1px solid #eee'
};

const iconStyle: React.CSSProperties = {
  fontSize: '3rem',
  marginBottom: '15px'
};

const titleStyle: React.CSSProperties = {
  color: 'var(--haui-blue, #0d3b66)',
  marginBottom: '10px'
};

const descStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '0.9rem',
  margin: 0
};
