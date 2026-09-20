import React, { useState } from 'react';
import { User, Shield, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileInfoForm } from '../components/profile/ProfileInfoForm';
import { SecuritySettings } from '../components/profile/SecuritySettings';
import { ActivityHistory } from '../components/profile/ActivityHistory';
import { Skeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/common/Toast';

export const ProfilePage = () => {
  const { user, loading, error, updateUser, uploadAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState(null);

  const handleAvatarChange = async (file) => {
    try {
      setIsUploadingAvatar(true);
      setAvatarToast(null);
      await uploadAvatar(file);
      setAvatarToast({
        type: 'success',
        title: 'Thành công',
        message: 'Ảnh đại diện đã được cập nhật.',
      });
    } catch (err) {
      setAvatarToast({
        type: 'error',
        title: err.title || 'Lỗi tải ảnh',
        message: err.detail || 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (formData) => {
    setIsUpdating(true);
    try {
      await updateUser(formData);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-red-50 text-red-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {error.title || 'Không thể tải hồ sơ cá nhân'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.detail || 'Đã có lỗi xảy ra trong quá trình truy xuất dữ liệu từ máy chủ.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: Shield },
    { id: 'activity', label: 'Lịch sử hoạt động', icon: Clock },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {avatarToast && (
        <Toast
          type={avatarToast.type}
          title={avatarToast.title}
          message={avatarToast.message}
          onClose={() => setAvatarToast(null)}
        />
      )}

      {/* Profile Header */}
      <ProfileHeader
        user={user}
        onAvatarChange={handleAvatarChange}
        isUploadingAvatar={isUploadingAvatar}
      />

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 space-x-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all focus:outline-none ${
                isActive
                  ? 'border-brand-600 text-brand-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="transition-opacity duration-200">
        {activeTab === 'profile' && (
          <ProfileInfoForm
            user={user}
            onUpdate={handleProfileUpdate}
            isUpdating={isUpdating}
          />
        )}

        {activeTab === 'security' && <SecuritySettings />}

        {activeTab === 'activity' && <ActivityHistory />}
      </div>
    </div>
  );
};
