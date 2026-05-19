import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin1 } = useAuth();

  const roles = [
    { value: 'ADMIN1', label: 'Quản trị viên 1 (ADMIN1)' },
    { value: 'ADMIN2', label: 'Quản trị viên 2 (ADMIN2)' },
    { value: 'TT_SXTM', label: 'TT SXTM' },
    { value: 'LEADERSHIP', label: 'Ban Lãnh Đạo' },
    { value: 'TEACHER', label: 'Giảng viên' },
    { value: 'STUDENT', label: 'Sinh viên' },
    { value: 'GUEST', label: 'Khách' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users');
      const userList = response.data;
      
      // Sort PENDING to top
      userList.sort((a: any, b: any) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return 0;
      });
      setUsers(userList);
    } catch (err) {
      console.error('Lỗi khi tải DS người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(`http://localhost:8080/api/users/${userId}`, { role: newRole });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      alert('Đã cập nhật quyền thành công!');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật quyền:', err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (userId: number, roleToAssign: string) => {
    try {
      await axios.put(`http://localhost:8080/api/users/${userId}`, { status: 'APPROVED', role: roleToAssign });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'APPROVED', role: roleToAssign } : u));
      alert('Đã phê duyệt tài khoản!');
    } catch (err: any) {
      console.error('Lỗi khi phê duyệt:', err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (userId: number) => {
    if (!isAdmin1) {
      alert("Chỉ ADMIN1 mới có quyền xóa tài khoản.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('Đã xóa tài khoản!');
    } catch (err: any) {
       alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
     return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải danh sách tài khoản...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: 'var(--haui-blue)', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Quản trị Người dùng & Phân quyền</h2>
      <button onClick={() => window.location.href='/admin'} style={{ marginBottom: '20px', padding: '5px 15px' }}>Quay lại Bảng điều khiển Admin</button>
      
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f7f6', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px 10px' }}>Họ Tên</th>
              <th style={{ padding: '12px 10px' }}>Email</th>
              <th style={{ padding: '12px 10px' }}>Ngày tạo</th>
              <th style={{ padding: '12px 10px' }}>Trạng thái / Phân quyền</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee', backgroundColor: user.status === 'PENDING' ? '#fff3cd' : 'white' }}>
                <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{user.fullName}</td>
                <td style={{ padding: '12px 10px' }}>{user.email}</td>
                <td style={{ padding: '12px 10px', fontSize: '0.85rem', color: '#666' }}>
                   {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td style={{ padding: '12px 10px' }}>
                  {user.status === 'PENDING' ? (
                     <span style={{ color: '#856404', fontWeight: 'bold' }}>Chờ phê duyệt</span>
                  ) : (
                     <select 
                       value={user.role} 
                       onChange={(e) => handleRoleChange(user.id, e.target.value)}
                       style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                     >
                       {roles.map(r => (
                         <option key={r.value} value={r.value}>{r.label}</option>
                       ))}
                     </select>
                  )}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                  {user.status === 'PENDING' ? (
                     <button 
                       style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                       onClick={() => handleApprove(user.id, user.role || 'STUDENT')}
                     >
                       Phê duyệt
                     </button>
                  ) : (
                     <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ color: '#28a745', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>Đã duyệt</span>
                        {isAdmin1 && (
                          <button onClick={() => handleDelete(user.id)} style={{ background: 'var(--haui-red)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                             Xóa
                          </button>
                        )}
                     </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
