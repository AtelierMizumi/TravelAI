import api from './api';

// Fallback initial profile in local storage or mock state for standalone testing
const MOCK_STORAGE_KEY = 'travelai_mock_user';

const getDefaultMockProfile = () => ({
  id: 1,
  username: 'ngoctapcodee',
  email: 'ngoc492005@gmail.com',
  fullName: 'Lê Văn Ngọc',
  phone: '0987654321',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Kỹ sư Frontend & QA Lead đam mê du lịch trải nghiệm khám phá các danh lam thắng cảnh Việt Nam.',
  location: 'Đà Nẵng, Việt Nam',
  joinedDate: '2026-09-01',
  role: 'USER',
  savedPlacesCount: 14,
  reviewsCount: 8,
  tripsCount: 5,
});

export const userService = {
  async getProfile() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (err) {
      // In development mode or offline fallback, provide local persisted profile
      const localData = localStorage.getItem(MOCK_STORAGE_KEY);
      if (localData) {
        try {
          return JSON.parse(localData);
        } catch {
          // ignore corrupted data
        }
      }
      const initial = getDefaultMockProfile();
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/me', profileData);
      return response.data;
    } catch (err) {
      // Fallback update
      const current = await this.getProfile();
      const updated = { ...current, ...profileData };
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
      return updated;
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
      // Create local object URL for preview
      const avatarUrl = URL.createObjectURL(file);
      const current = await this.getProfile();
      const updated = { ...current, avatarUrl };
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
      return { avatarUrl };
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
      // Simulate validation in mock fallback
      if (currentPassword === 'wrong') {
        throw {
          status: 400,
          title: 'Mật khẩu không hợp lệ',
          detail: 'Mật khẩu hiện tại không chính xác.',
        };
      }
      return { success: true, message: 'Đổi mật khẩu thành công.' };
    }
  },

  async getRecentActivities() {
    try {
      const response = await api.get('/users/me/activities');
      return response.data;
    } catch (err) {
      return [
        {
          id: 1,
          type: 'AI_RECOGNITION',
          title: 'Nhận diện thành công Vịnh Hạ Long',
          timestamp: '2026-10-02 14:30',
          detail: 'Độ tin cậy 94.2% qua Google Cloud Vision',
        },
        {
          id: 2,
          type: 'BOOKING',
          title: 'Đặt chỗ Tour Du Thuyền 5 Sao',
          timestamp: '2026-09-29 09:15',
          detail: 'Mã đơn #BK-2026-0929 - Đã xác nhận',
        },
        {
          id: 3,
          type: 'REVIEW',
          title: 'Đánh giá 5 sao cho Phố Cổ Hội An',
          timestamp: '2026-09-25 18:40',
          detail: 'Không gian văn hóa tuyệt vời, ẩm thực đặc sắc.',
        },
        {
          id: 4,
          type: 'SAVED_PLACE',
          title: 'Lưu địa danh Tràng An vào danh sách yêu thích',
          timestamp: '2026-09-22 11:05',
          detail: 'Quần thể danh thắng Ninh Bình',
        },
      ];
    }
  },
};
