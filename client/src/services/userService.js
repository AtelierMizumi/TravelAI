import api from './api';

const MOCK_STORAGE_KEY = 'travelai_demo_user';

// Clean, generic demo profile without exposing personal developer details
const getGenericDemoProfile = () => ({
  id: 1,
  username: 'traveler',
  email: 'traveler@travelai.vn',
  fullName: 'Nguyễn Văn Du Khách',
  phone: '0901234567',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  bio: 'Đam mê khám phá các di sản văn hóa, danh lam thắng cảnh và ẩm thực truyền thống Việt Nam.',
  location: 'Việt Nam',
  joinedDate: '2026-09-01',
  role: 'USER',
  savedPlacesCount: 12,
  reviewsCount: 6,
  tripsCount: 4,
});

// Check whether offline demo fallback should be allowed
// Only allow fallback on confirmed backend-unavailable conditions (network error, status 0, 502/503)
// or when explicitly opted in via 'travelai_demo_mode' flag, preventing real 4xx/5xx errors from being masked.
const shouldFallbackToDemo = (err) => {
  if (localStorage.getItem('travelai_demo_mode') === 'true') {
    return true;
  }
  const isDevWithoutToken = import.meta.env.DEV && !localStorage.getItem('travelai_token');
  const isBackendUnavailable =
    err?.isNetworkError || err?.status === 0 || err?.status === 502 || err?.status === 503;

  return isDevWithoutToken && isBackendUnavailable;
};

export const userService = {
  async getProfile() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            // parse error ignored
          }
        }
        const demoUser = getGenericDemoProfile();
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(demoUser));
        return demoUser;
      }
      // Rethrow normalized RFC 7807 error so UI surfaces real server status
      throw err;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/me', profileData);
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        const current = await this.getProfile();
        const updated = { ...current, ...profileData };
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      throw err;
    }
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        // Use durable Base64 Data URL with quota-exceeded exception guard
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const avatarUrl = reader.result;
              const current = await this.getProfile();
              const updated = { ...current, avatarUrl };
              localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
              resolve({ avatarUrl });
            } catch (storageErr) {
              reject({
                status: 400,
                title: 'Lỗi lưu trữ ảnh',
                detail:
                  'Kích thước ảnh vượt quá dung lượng lưu trữ trình duyệt (QuotaExceeded). Vui lòng chọn ảnh nhỏ hơn.',
              });
            }
          };
          reader.onerror = () => {
            reject({
              status: 400,
              title: 'Lỗi đọc file',
              detail: 'Không thể chuyển đổi hình ảnh đại diện.',
            });
          };
          reader.readAsDataURL(file);
        });
      }
      throw err;
    }
  },

  async changePassword({ currentPassword, newPassword }) {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        if (currentPassword === 'wrong') {
          throw {
            status: 400,
            title: 'Mật khẩu không hợp lệ',
            detail: 'Mật khẩu hiện tại không chính xác.',
          };
        }
        return { success: true, message: 'Đổi mật khẩu thành công.' };
      }
      throw err;
    }
  },

  async getRecentActivities() {
    try {
      const response = await api.get('/users/me/activities');
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        return [
          {
            id: 1,
            type: 'AI_RECOGNITION',
            title: 'Nhận diện danh lam thắng cảnh',
            timestamp: '2026-10-02 14:30',
            detail: 'Độ tin cậy cao qua Google Cloud Vision',
          },
          {
            id: 2,
            type: 'BOOKING',
            title: 'Đặt chỗ dịch vụ du lịch',
            timestamp: '2026-09-29 09:15',
            detail: 'Đơn đặt chỗ đã được xác nhận',
          },
          {
            id: 3,
            type: 'REVIEW',
            title: 'Đánh giá điểm đến',
            timestamp: '2026-09-25 18:40',
            detail: 'Chia sẻ trải nghiệm du lịch thực tế',
          },
          {
            id: 4,
            type: 'SAVED_PLACE',
            title: 'Lưu địa danh vào danh sách yêu thích',
            timestamp: '2026-09-22 11:05',
            detail: 'Bộ sưu tập địa điểm mong muốn ghé thăm',
          },
        ];
      }
      throw err;
    }
  },
};
