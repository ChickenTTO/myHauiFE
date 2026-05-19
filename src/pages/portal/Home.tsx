import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container" style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--haui-red)', marginBottom: '20px' }}>Chào mừng đến với Hệ thống Quản trị Đại học Số MyHaUI</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: '800px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
        MyHaUI ERP Portal là hệ thống quản trị tổng thể, kết nối mọi hoạt động từ Đào tạo, Nghiên cứu khoa học, 
        đến Quản lý cơ sở vật chất của trường Đại học Công nghiệp Hà Nội.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Card Giảng viên */}
        <div style={cardStyle} onClick={() => navigate('/teacher')}>
          <div style={iconStyle}>👨‍🏫</div>
          <h3 style={cardTitleStyle}>Giảng viên</h3>
          <p style={cardDescStyle}>Quản lý lịch trình, lịch giảng dạy và cơ sở vật chất.</p>
        </div>

        {/* Card NCKH */}
        <div style={cardStyle} onClick={() => navigate('/research')}>
          <div style={iconStyle}>🔬</div>
          <h3 style={cardTitleStyle}>Nghiên cứu khoa học</h3>
          <p style={cardDescStyle}>Quản lý đề tài, đăng ký sử dụng phòng Lab và gửi báo cáo.</p>
        </div>

      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #eee'
};

const iconStyle: React.CSSProperties = {
  fontSize: '3rem',
  marginBottom: '15px'
};

const cardTitleStyle: React.CSSProperties = {
  color: 'var(--haui-blue, #0d3b66)',
  marginBottom: '10px'
};

const cardDescStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '0.9rem',
  margin: 0
};
