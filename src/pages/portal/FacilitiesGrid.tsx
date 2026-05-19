import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Monitor, PlusCircle, MinusCircle, RefreshCw, Car, BarChart } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function FacilitiesGrid() {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const cards = [
    { title: 'DANH MỤC', desc: 'Danh mục tài sản, công cụ, csvc', icon: Monitor, path: '/facilities/inventory', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'MẶT BẰNG', desc: 'Danh mục mặt bằng, phòng ốc', icon: LayoutDashboard, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'BÁO HỎNG', desc: 'Báo hỏng hóc, sự cố', icon: AlertTriangle, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'GHI TĂNG TÀI SẢN', desc: 'Ghi tăng tài sản, thêm mới tài sản', icon: PlusCircle, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'GHI GIẢM TÀI SẢN', desc: 'Thanh lý tài sản', icon: MinusCircle, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'ĐIỀU CHUYỂN', desc: 'Điều chuyển tài sản giữa các Đơn vị', icon: RefreshCw, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'ÔTÔ', desc: 'Danh mục Oto của trường', icon: Car, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
    { title: 'BÁO CÁO', desc: 'Báo cáo thống kê tài sản', icon: BarChart, path: '#', roles: ['SYSTEM_ADMIN', 'TESTER_ADMIN', 'FACULTY_MANAGER'] },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', borderBottom: '2px solid #ccc', display: 'inline-block', paddingBottom: '10px' }}>
        TRUNG TÂM SẢN XUẤT THÔNG MINH (TT SXTM)
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '2px', // Minimal gap like screenshot
        backgroundColor: '#0a2342', // Dark background behind
        padding: '2px'
      }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isAllowed = card.roles.includes(userRole);
          return (
            <div 
              key={idx} 
              onClick={() => {
                  if(isAllowed && card.path !== '#') navigate(card.path);
              }}
              style={{ 
                backgroundColor: '#113254', 
                padding: '40px 20px',
                textAlign: 'center',
                cursor: isAllowed && card.path !== '#' ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'background-color 0.2s',
                opacity: isAllowed ? 1 : 0.4
              }}
              onMouseOver={(e) => {
                if(isAllowed && card.path !== '#') e.currentTarget.style.backgroundColor = '#1a4b7c';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#113254';
              }}
            >
              <Icon size={40} style={{ marginBottom: '15px' }} />
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 'bold' }}>{card.title}</h4>
              <p style={{ margin: '0', color: '#a0c4e8', fontSize: '0.85rem' }}>{card.desc}</p>
              {!isAllowed && <span style={{ fontSize: '0.7rem', color: '#ffb3b3', marginTop: '10px' }}>(Khóa)</span>}
            </div>
          )
        })}
      </div>
    </div>
  );
}
