import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TestTube, Map, CheckSquare, QrCode } from 'lucide-react';


export default function ResearchGrid() {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  // Đã loại bỏ logic tạo tài khoản gv_tudo qua Firebase. Quản lý tài khoản hiện được thực hiện thông qua Node.js API (Trang Quản lý Người dùng).

  const cards = [
    {
      title: 'Đăng ký Mượn máy NCKH',
      description: 'Quy trình đặt lịch sử dụng thiết bị phòng TH/TN trước 1 ngày.',
      icon: <TestTube size={40} color="#a41c2c" />,
      path: '/research/booking',
      color: '#fff5f5'
    },
    {
      title: 'Sơ đồ & Layout Phòng máy',
      description: 'Trực quan hóa vị trí tài sản máy tính trong phòng thực hành.',
      icon: <Map size={40} color="#0d3b66" />,
      path: '/research/room-layout',
      color: '#e6f2ff'
    },
    {
      title: 'Nộp Báo cáo Khoa học',
      description: 'Gửi kết quả NCKH bằng File hoặc Google Drive.',
      icon: <CheckSquare size={40} color="#673ab7" />,
      path: '/research/submit-report',
      color: '#ede7f6'
    },
    {
      title: 'Quét mã QR (Nhận/Trả & 5S)',
      description: 'Check-in, Check-out và báo cáo vi phạm 5S trực tiếp bằng Camera.',
      icon: <QrCode size={40} color="#2e7d32" />,
      path: '/research/scanner',
      color: '#e8f5e9'
    }
  ];

  // Chỉ GV, Quản lý TT, Admin mới thấy mục phê duyệt và Dashboard
  if (['TEACHER', 'FACULTY_MANAGER', 'SYSTEM_ADMIN', 'TESTER_ADMIN'].includes(userRole)) {
    cards.push({
      title: 'Quản lý & Phê duyệt NCKH',
      description: 'Duyệt yêu cầu mượn máy, quản lý các cấp độ phê duyệt.',
      icon: <CheckSquare size={40} color="#f57c00" />,
      path: '/research/approvals',
      color: '#fff3e0'
    });
  }
  
  if (['FACULTY_MANAGER', 'SYSTEM_ADMIN', 'TESTER_ADMIN'].includes(userRole)) {
    cards.push({
      title: 'Báo cáo & Giám sát NCKH',
      description: 'Dashboard theo dõi tiến độ, số lượng máy, và thư viện báo cáo.',
      icon: <Map size={40} color="#c2185b" />,
      path: '/research/dashboard',
      color: '#fce4ec'
    });
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#0d3b66', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        Quản lý Nghiên cứu Khoa học & Phòng TH/TN
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
      }}>
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            style={{
              backgroundColor: card.color,
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '25px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ marginBottom: '15px' }}>{card.icon}</div>
            <h3 style={{ color: '#0d3b66', marginBottom: '10px' }}>{card.title}</h3>
            <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: '1.5' }}>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
