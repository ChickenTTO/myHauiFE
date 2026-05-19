import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Briefcase, Building, Globe, GraduationCap, BarChart2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TeacherServices() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  if (userRole === 'GUEST' || userRole === 'PENDING') {
      return (
         <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2 style={{ color: 'var(--haui-red)' }}>Bạn không có quyền truy cập</h2>
            <p>Tài khoản của bạn chưa được phê duyệt hoặc không phải là Giảng viên.</p>
         </div>
      )
  }

  const allCards = [
    { title: 'Thời Khoá Biểu', desc: 'Xem lịch giảng dạy, điểm danh', path: '/teacher/teaching/timetable', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY_MANAGER', 'TEACHER'] },
    { title: 'Dashboard', desc: 'Bảng chỉ số thống kê, tổng hợp', path: '/teacher/dashboard', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY_MANAGER', 'TEACHER'] }
  ];

  // Chỉ lấy những card mà user có quyền truy cập
  const allowedCards = allCards.filter(card => card.roles.includes(userRole));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#0d3b66', marginBottom: '30px', fontSize: '2rem' }}>Dịch Vụ Giảng Viên</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '25px' 
      }}>
        {allowedCards.map((card, idx) => {
          return (
            <div 
              key={idx} 
              onClick={() => {
                  if(card.path !== '#') navigate(card.path);
              }}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                cursor: card.path !== '#' ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => {
                if(card.path !== '#') {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ height: '140px', overflow: 'hidden' }}>
                <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#0d3b66', fontSize: '1.1rem' }}>{card.title}</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem', flex: 1 }}>{card.desc}</p>
                
                <div style={{ alignSelf: 'flex-end' }}>
                  <button style={{ 
                    background: card.path !== '#' ? 'var(--haui-blue, #0d3b66)' : '#ccc', 
                    color: 'white',
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: card.path !== '#' ? 'pointer' : 'default',
                  }}>
                    {card.path !== '#' ? 'Truy cập' : 'Đang cập nhật'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
