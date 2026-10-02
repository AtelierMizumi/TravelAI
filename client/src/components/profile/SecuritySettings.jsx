import React, { useState } from 'react';
import { Lock, Shield, KeyRound, Check, XCircle } from 'lucide-react';
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

  // Explicit validation rules
  const hasMinLength = passwords.newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwords.newPassword);
  const hasLowercase = /[a-z]/.test(passwords.newPassword);
  const hasNumber = /[0-9]/.test(passwords.newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!isPasswordValid) {
      setNotification({
        type: 'error',
        title: 'Mật khẩu chưa đạt tiêu chuẩn',
        message:
          'Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm cả chữ hoa, chữ thường và chữ số.',
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
        title: 'Đổi mật khẩu thành công',
        message: 'Mật khẩu tài khoản đã được cập nhật an toàn.',
      });

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: err?.title || 'Lỗi bảo mật',
        message:
          err?.detail ||
          'Không thể thay đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.',
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
          Thiết lập mật khẩu an toàn theo quy chuẩn bảo mật doanh nghiệp.
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
          <label
            htmlFor="security-currentPassword"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 cursor-pointer"
          >
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              id="security-currentPassword"
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
          <label
            htmlFor="security-newPassword"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 cursor-pointer"
          >
            Mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              id="security-newPassword"
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
          <label
            htmlFor="security-confirmPassword"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 cursor-pointer"
          >
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Shield className="w-4 h-4" />
            </div>
            <input
              type="password"
              id="security-confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Dynamic Password Requirements Checklist */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-600 space-y-2">
          <p className="font-semibold text-gray-700 mb-1">Tiêu chuẩn mật khẩu an toàn:</p>
          <div className="flex items-center gap-2">
            {hasMinLength ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>
              Tối thiểu 8 ký tự
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasUppercase ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={hasUppercase ? 'text-emerald-700 font-medium' : ''}>
              Ít nhất 1 chữ cái in hoa (A-Z)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasLowercase ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={hasLowercase ? 'text-emerald-700 font-medium' : ''}>
              Ít nhất 1 chữ cái in thường (a-z)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasNumber ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={hasNumber ? 'text-emerald-700 font-medium' : ''}>
              Ít nhất 1 chữ số (0-9)
            </span>
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
