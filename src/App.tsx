import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortalLayout from './layouts/PortalLayout';
import Auth from './pages/Auth';
import TeacherServices from './pages/portal/TeacherServices';
import TeachingGrid from './pages/portal/TeachingGrid';
import FacilitiesGrid from './pages/portal/FacilitiesGrid';
import ResearchGrid from './pages/portal/ResearchGrid';
import ResearchBooking from './pages/research/ResearchBooking';
import RoomLayout from './pages/research/RoomLayout';
import QRScanner from './pages/research/QRScanner';
import ResearchApprovals from './pages/research/ResearchApprovals';
import ReportSubmission from './pages/research/ReportSubmission';
import ResearchDashboard from './pages/research/ResearchDashboard';
import AuditLogs from './pages/admin/AuditLogs';

// New Pages
import Home from './pages/portal/Home';
import ReportGrid from './pages/portal/ReportGrid';
import AdminDashboard from './pages/admin/AdminDashboard';

// Existing Pages
import AdminTimetable from './pages/AdminTimetable';
import StudentTimetable from './pages/StudentTimetable';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AssetManagement from './pages/admin/AssetManagement';

import { useAuth } from './context/AuthContext';

// Hàm helper để bảo vệ route theo quyền
const RequireRole = ({ roles, children }: { roles: string[], children: JSX.Element }) => {
  const { userRole, currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Auth />;
  }

  // Khách (GUEST) hoặc Chờ Duyệt (PENDING) chỉ được thấy trang chủ hoặc thông báo
  const isApproved = userRole !== 'GUEST' && userRole !== 'PENDING';

  return (
    <Routes>
      <Route path="/login" element={<Auth />} />

      <Route path="/" element={<PortalLayout />}>
        {/* Trang chủ - Ai cũng vào được (Kể cả GUEST, PENDING) */}
        <Route index element={
           isApproved || userRole === 'GUEST' 
             ? <Home /> 
             : <div style={{ textAlign: 'center', marginTop: '100px' }}>
                 <h2 style={{ color: 'var(--haui-red)' }}>Tài khoản đang chờ phê duyệt</h2>
                 <p>Vui lòng chờ Admin xác nhận để sử dụng hệ thống.</p>
               </div>
        } />
        
        {/* Module Giảng Viên: Dành cho ADMIN1, ADMIN2, TT_SXTM, LEADERSHIP, TEACHER */}
        <Route path="teacher" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER']}>
            <TeacherServices />
          </RequireRole>
        } />
        <Route path="teacher/teaching" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER']}>
            <TeachingGrid />
          </RequireRole>
        } />
        <Route path="teacher/teaching/timetable" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER']}>
            <StudentTimetable />
          </RequireRole>
        } />
        <Route path="teacher/dashboard" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER']}>
            <Dashboard />
          </RequireRole>
        } />
        
        {/* Module Báo Cáo: Dành cho ADMIN1, ADMIN2, TT_SXTM, LEADERSHIP */}
        <Route path="report" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP']}>
            <ReportGrid />
          </RequireRole>
        } />
        
        {/* Module Cơ Sở Vật Chất: Dành cho ADMIN1, ADMIN2, TT_SXTM, LEADERSHIP */}
        <Route path="facilities" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP']}>
            <FacilitiesGrid />
          </RequireRole>
        } />
        <Route path="facilities/inventory" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP']}>
            <AssetManagement />
          </RequireRole>
        } />
        
        {/* Module Nghiên Cứu Khoa Học: Thêm Sinh viên (STUDENT) */}
        <Route path="research" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT']}>
            <ResearchGrid />
          </RequireRole>
        } />
        <Route path="research/booking" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT']}>
            <ResearchBooking />
          </RequireRole>
        } />
        <Route path="research/room-layout" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT']}>
            <RoomLayout />
          </RequireRole>
        } />
        <Route path="research/scanner" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT']}>
            <QRScanner />
          </RequireRole>
        } />
        <Route path="research/approvals" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER']}>
            <ResearchApprovals />
          </RequireRole>
        } />
        <Route path="research/submit-report" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT']}>
            <ReportSubmission />
          </RequireRole>
        } />
        <Route path="research/dashboard" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2', 'TT_SXTM', 'LEADERSHIP', 'TEACHER', 'STUDENT']}>
            <ResearchDashboard />
          </RequireRole>
        } />
        
        {/* Admin Routes: Chỉ dành cho ADMIN1, ADMIN2 */}
        <Route path="admin" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2']}>
            <AdminDashboard />
          </RequireRole>
        } />
        <Route path="admin/timetable" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2']}>
            <AdminTimetable />
          </RequireRole>
        } />
        <Route path="admin/users" element={
          <RequireRole roles={['ADMIN1', 'ADMIN2']}>
            <UserManagement />
          </RequireRole>
        } />
        <Route path="admin/audit-logs" element={
          <RequireRole roles={['ADMIN1']}>
            <AuditLogs />
          </RequireRole>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
