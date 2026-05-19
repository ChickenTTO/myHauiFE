import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import FloatingSupport from '../components/FloatingSupport';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export default function PortalLayout() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordMessage('Mật khẩu phải dài ít nhất 6 ký tự.');
      return;
    }
    // Cần API đổi mật khẩu ở Node.js - Tạm thời giả lập
    setPasswordMessage('Chức năng đang được cập nhật qua API mới.');
  };

  // Áp dụng RBAC cho thanh Navigation
  const allNavLinks = [
    { name: 'GIỚI THIỆU', path: '/', roles: ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT', 'GUEST', 'PENDING'] },
    { name: 'TT SXTM', path: '/facilities', roles: ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP'] },
    { name: 'GIẢNG VIÊN', path: '/teacher', roles: ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER'] },
    { name: 'NGHIÊN CỨU KHOA HỌC', path: '/research', roles: ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT'] },
    { name: 'BÁO CÁO', path: '/report', roles: ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP'] },
    { name: 'QUẢN TRỊ HỆ THỐNG', path: '/admin', roles: ['ADMIN1', 'ADMIN2'] }
  ];

  const navLinks = allNavLinks.filter(link => link.roles.includes(userRole));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f4f8', position: 'relative' }}>
      
      {/* Floating Utilities */}
      <PWAInstallPrompt />
      <FloatingSupport />

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0d3b66' }}>Đổi Mật Khẩu</h3>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu mới (Ít nhất 6 ký tự)..." 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            {passwordMessage && <p style={{ color: passwordMessage.includes('✅') ? 'green' : 'red', fontSize: '0.9rem', marginBottom: '15px' }}>{passwordMessage}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowPasswordModal(false); setPasswordMessage(''); }} style={{ padding: '8px 15px', border: '1px solid #ccc', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleChangePassword} style={{ padding: '8px 15px', border: 'none', background: 'var(--haui-blue)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar (Trắng, chữ đỏ/xám) */}
      <header className="portal-header" style={{ 
        backgroundColor: 'white', 
        padding: '0 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '2px solid #a41c2c',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 500
      }}>
        <nav className="portal-nav" style={{ display: 'flex', height: '100%' }}>
          <div className="portal-nav-links" style={{ display: 'flex', gap: '30px', height: '100%', alignItems: 'center' }}>
            {navLinks.map((link) => {
               const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
               return (
                <Link 
                  key={link.name}
                  to={link.path} 
                  style={{ 
                    textDecoration: 'none', 
                    color: isActive ? '#a41c2c' : '#555', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    borderBottom: isActive ? '3px solid #a41c2c' : '3px solid transparent'
                  }}
                >
                  {link.name}
                </Link>
               )
            })}
          </div>
        </nav>

        <div className="portal-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontSize: '0.9rem', color: '#333' }}>
                 <strong>{currentUser.fullName || currentUser.email}</strong> 
                 <span style={{ color: '#888', marginLeft: '5px' }}>({userRole})</span>
               </span>
               <button 
                 onClick={() => setShowPasswordModal(true)}
                 style={{ 
                   background: 'transparent', border: '1px solid #0d3b66', color: '#0d3b66', 
                   padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' 
                 }}
               >
                 ĐỔI MK
               </button>
               <button 
                 onClick={handleLogout} 
                 style={{ 
                   background: 'transparent', border: '1px solid #a41c2c', color: '#a41c2c', 
                   padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' 
                 }}
               >
                 THOÁT
               </button>
            </div>
          ) : (
             <Link 
               to="/login" 
               style={{ 
                 textDecoration: 'none', background: 'transparent', border: '1px solid #a41c2c', 
                 color: '#a41c2c', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold' 
               }}
             >
               ĐĂNG NHẬP
             </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="portal-main-content" style={{ flex: 1, padding: '30px 40px' }}>
        <Outlet />
      </main>
    </div>
  );
}
