import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function TeachingGrid() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  const cards = [
    { title: 'GIẢNG DẠY', desc: 'Thời khoá biểu, phân công giảng dạy, điểm danh', path: '/teacher/teaching/timetable', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY_MANAGER', 'TEACHER', 'STUDENT'] },
    { title: 'ĐỒ ÁN MÔN HỌC', desc: 'Phân công, danh sách ĐA/ĐATN, Luận văn, Luận án', path: '#', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY_MANAGER', 'TEACHER'] },
    { title: 'ĐỒ ÁN TỐT NGHIỆP', desc: 'Sinh viên, học viên, đề tài, hướng dẫn ĐATN', path: '#', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY_MANAGER', 'TEACHER'] },
    { title: 'ĐỀ TÀI', desc: 'Tra cứu thông tin học viên', path: '#', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY_MANAGER', 'TEACHER'] }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', borderBottom: '2px solid #ccc', display: 'inline-block', paddingBottom: '10px' }}>
        GIẢNG DẠY
      </h2>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button onClick={() => navigate('/teacher')} style={{ padding: '5px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>Quay lại</button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '20px' 
      }}>
        {cards.map((card, idx) => {
          const isAllowed = card.roles.includes(userRole);
          return (
            <div 
              key={idx} 
              onClick={() => {
                  if(isAllowed && card.path !== '#') navigate(card.path);
              }}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: isAllowed && card.path !== '#' ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                opacity: isAllowed ? 1 : 0.5,
                filter: isAllowed ? 'none' : 'grayscale(100%)'
              }}
            >
              <div style={{ height: '130px' }}>
                <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0d3b66', fontSize: '1rem' }}>{card.title}</h4>
                <p style={{ margin: '0 0 15px 0', color: '#777', fontSize: '0.85rem', flex: 1 }}>{card.desc}</p>
                <div style={{ alignSelf: 'flex-end' }}>
                  <button style={{ 
                    background: '#f8f9fa', 
                    border: '1px solid #ddd', 
                    padding: '4px 12px', 
                    borderRadius: '15px',
                    fontSize: '0.75rem',
                    cursor: isAllowed && card.path !== '#' ? 'pointer' : 'not-allowed'
                  }}>
                    {isAllowed ? 'Chi tiết >' : 'Khóa'}
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
