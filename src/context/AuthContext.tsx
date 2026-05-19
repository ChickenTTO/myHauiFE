import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('GUEST');
  const [loading, setLoading] = useState(true);

  // Khởi tạo axios interceptor để tự động gắn token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8080/api/auth/me');
          setCurrentUser(response.data.user);
          setUserRole(response.data.user.role);
        } catch (error) {
          console.error("Lỗi xác thực:", error);
          localStorage.removeItem('token');
          setCurrentUser(null);
          setUserRole('GUEST');
        }
      } else {
        setCurrentUser(null);
        setUserRole('GUEST');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = (token: string, user: any) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setUserRole(user.role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserRole('GUEST');
  };

  // RBAC helpers
  const isAdmin1 = userRole === 'ADMIN1';
  const isAdmin2 = userRole === 'ADMIN2';
  const isManagement = ['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP'].includes(userRole);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    isAdmin1,
    isAdmin2,
    isManagement
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
