import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReportGrid() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'var(--haui-blue, #0d3b66)', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Trung tâm Báo cáo
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        
        <div style={cardStyle} onClick={() => navigate('/research/submit-report')}>
          <div style={iconStyle}>📄</div>
          <div style={contentStyle}>
            <h3 style={titleStyle}>Báo cáo NCKH</h3>
            <p style={descStyle}>Nộp báo cáo tiến độ và kết quả nghiên cứu khoa học.</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>📊</div>
          <div style={contentStyle}>
            <h3 style={titleStyle}>Báo cáo Cơ sở vật chất</h3>
            <p style={descStyle}>Báo cáo tình trạng phòng học và tài sản thiết bị.</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>📈</div>
          <div style={contentStyle}>
            <h3 style={titleStyle}>Thống kê Học tập</h3>
            <p style={descStyle}>Xem báo cáo thống kê tình hình học tập và điểm số.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  border: '1px solid #eaeaea',
  alignItems: 'center',
  gap: '15px'
};

const iconStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  backgroundColor: '#f8f9fa',
  padding: '10px',
  borderRadius: '8px'
};

const contentStyle: React.CSSProperties = {
  flex: 1
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 5px 0',
  color: 'var(--haui-red, #a41c2c)'
};

const descStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#666'
};
