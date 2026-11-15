import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { PlacesPage } from './pages/PlacesPage';
import { RecognizePage } from './pages/RecognizePage';
import { FeedPage } from './pages/FeedPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContentModerationPage } from './pages/ContentModerationPage';
import { SystemConfigPage } from './pages/SystemConfigPage';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'ROLE_ADMIN') return <p role="alert">Bạn không có quyền truy cập trang quản trị.</p>;
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/places" element={<PlacesPage />} />
              <Route path="/recognize" element={<RecognizePage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/moderation" element={<AdminRoute><ContentModerationPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><SystemConfigPage /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
