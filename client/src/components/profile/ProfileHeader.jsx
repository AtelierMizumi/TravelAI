import React, { useRef } from 'react';
import { Camera, Calendar, MapPin, Award, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ProfileHeader = ({ user, onAvatarChange, isUploadingAvatar }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with upload button */}
        <div className="relative group">
          <img
            src={
              user.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt={user.fullName || user.username}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-md shadow-brand-500/10"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            title="Đổi ảnh đại diện"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.fullName || 'Người dùng TravelAI'}
            </h1>
            <Badge variant="brand" className="self-center sm:self-auto">
              {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên du khách'}
            </Badge>
          </div>

          <p className="text-sm text-gray-500 mb-3">@{user.username || 'nguoidung'}</p>

          <p className="text-sm text-gray-600 max-w-xl mb-4 leading-relaxed">
            {user.bio || 'Chưa có thông tin giới thiệu bản thân.'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Gia nhập từ {user.joinedDate || '09/2026'}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Tài khoản đã xác minh
            </span>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="flex sm:flex-col justify-around w-full sm:w-auto bg-gray-50 rounded-xl p-4 gap-4 text-center border border-gray-100">
          <div>
            <div className="text-lg font-bold text-brand-600">
              {user.savedPlacesCount ?? 14}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Đã lưu</div>
          </div>
          <div className="sm:border-t sm:border-gray-200 sm:pt-3">
            <div className="text-lg font-bold text-brand-600">
              {user.reviewsCount ?? 8}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Đánh giá</div>
          </div>
          <div className="sm:border-t sm:border-gray-200 sm:pt-3">
            <div className="text-lg font-bold text-brand-600">
              {user.tripsCount ?? 5}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Chuyến đi</div>
          </div>
        </div>
      </div>
    </div>
  );
};
