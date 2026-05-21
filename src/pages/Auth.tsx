import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', {
          email,
          password
        });
        login(response.data.token, response.data.user);
        navigate('/');
      } else {
        // Tài khoản đăng ký mới mặc định là STUDENT, nếu muốn admin thì chỉnh sửa backend/role
        const assignedRole = email.toLowerCase().includes('admin') ? 'ADMIN1' : 'STUDENT';
        
        await axios.post('/api/auth/register', {
          email,
          password,
          fullName,
          role: assignedRole
        });
        
        alert('Tạo tài khoản thành công! Hệ thống đang chờ Quản trị viên phê duyệt quyền truy cập của bạn.');
        setIsLogin(true); // Chuyển về màn hình đăng nhập
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Có lỗi xảy ra từ máy chủ.');
      } else {
        setError('Lỗi kết nối máy chủ.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--haui-blue)', marginBottom: '20px' }}>
          {isLogin ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản'}
        </h2>
        
        {error && <div style={{ background: '#ffebee', color: 'var(--haui-red)', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ và Tên</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '12px', 
              backgroundColor: 'var(--haui-blue)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--haui-red)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
}
