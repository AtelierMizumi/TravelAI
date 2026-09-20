import React, { useState } from 'react';
import { Lock, Shield, KeyRound, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { userService } from '../../services/userService';

export const SecuritySettings = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (passwords.newPassword.length < 8) {
      setNotification({
        type: 'error',
        title: 'Mật khẩu không đạt chuẩn',
        message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.',
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setNotification({
        type: 'error',
        title: 'Xác nhận mật khẩu sai',
        message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
      });
      return;
    }

    try {
      setIsLoading(true);
      await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setNotification({
        type: 'success',
        title: 'Cập nhật thành công',
        message: 'Mật khẩu tài khoản đã được thay đổi an toàn.',
      });

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: err.title || 'Lỗi bảo mật',
        message: err.detail || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Bảo mật & Đổi mật khẩu</h2>
        <p className="text-sm text-gray-500">
          Thiết lập mật khẩu mạnh và kiểm soát các cơ chế bảo mật tài khoản.
        </p>
      </div>

      {notification && (
        <Toast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Shield className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password requirements */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-700 mb-1">Quy định bảo mật mật khẩu:</p>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" /> Tối thiểu 8 ký tự
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" /> Kết hợp chữ cái hoa, thường và số
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" /> Không trùng lặp với mật khẩu cũ
          </div>
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </div>
  );
};
