import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Mail,
  Phone,
  Bell,
  Lock,
  Save,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { moderationService } from '../services/moderationService';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';

export const SystemConfigPage = () => {
  const [config, setConfig] = useState({
    siteName: 'TravelAI - Smart Tourism Platform',
    adminEmail: 'admin@travelai.vn',
    supportPhone: '1900 6868',
    emailNotifications: true,
    systemNotifications: true,
    autoApproveVerifiedUsers: false,
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      const res = await moderationService.getSystemConfig();
      setConfig(res);
    };
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      await moderationService.saveSystemConfig(config);
      setToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã lưu cấu hình hệ thống thành công.',
      });
    } catch {
      setToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu cấu hình hệ thống.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast */}
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-2">
            <Settings className="w-3.5 h-3.5 text-brand-600" />
            <span>Cấu Hình Tham Số Vận Hành Nền Tảng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Cài Đặt Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Thiết lập các tham số cốt lõi, bảo mật và cơ chế thông báo cho TravelAI.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Config Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
            <form onSubmit={handleSave} className="space-y-8 text-xs sm:text-sm">
              {/* Site Info */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" />
                  Thông tin nền tảng
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">
                      Tên trang web / Nền tảng:
                    </label>
                    <input
                      type="text"
                      value={config.siteName}
                      onChange={(e) =>
                        setConfig({ ...config, siteName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1.5">
                        Email quản trị viên:
                      </label>
                      <input
                        type="email"
                        value={config.adminEmail}
                        onChange={(e) =>
                          setConfig({ ...config, adminEmail: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs sm:text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1.5">
                        Hotline hỗ trợ khách hàng:
                      </label>
                      <input
                        type="text"
                        value={config.supportPhone}
                        onChange={(e) =>
                          setConfig({ ...config, supportPhone: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-600" />
                  Cấu hình thông báo
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">Thông báo Email tự động</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Gửi email xác nhận đơn đặt và biên lai thanh toán cho khách hàng
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.emailNotifications}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">Thông báo quản trị thời gian thực</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Hiển thị chuông cảnh báo khi có bài viết hoặc booking mới cần kiểm duyệt
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.systemNotifications}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          systemNotifications: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                    />
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Lưu cấu hình hệ thống
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Danger Zone & Info */}
          <div className="space-y-6">
            {/* System Info Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 text-sm">Trạng thái phiên bản</h4>
              <div className="space-y-2 text-gray-500">
                <div className="flex justify-between">
                  <span>Môi trường:</span>
                  <span className="font-bold text-emerald-600">Production Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Phiên bản Client:</span>
                  <span className="font-mono text-gray-800">v1.2.0-MVP</span>
                </div>
                <div className="flex justify-between">
                  <span>Backend Core:</span>
                  <span className="font-mono text-gray-800">Spring Boot 3.3.4</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Subsystem:</span>
                  <span className="font-mono text-gray-800">FastAPI / Cloud Vision</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Vùng Nguy Hiểm (Danger Zone)</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Khi kích hoạt chế độ bảo trì, người dùng thông thường sẽ không thể truy cập các tính năng đặt tour và phòng.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      maintenanceMode: !config.maintenanceMode,
                    })
                  }
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                    config.maintenanceMode
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {config.maintenanceMode
                    ? 'Đang bật bảo trì (Nhấn để tắt)'
                    : 'Bật chế độ bảo trì hệ thống'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;
