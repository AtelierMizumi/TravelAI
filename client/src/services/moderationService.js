const POSTS_STORAGE_KEY = 'travelai_social_posts';
const CONFIG_STORAGE_KEY = 'travelai_system_config';

const DEFAULT_SYSTEM_CONFIG = {
  siteName: 'TravelAI - Smart Tourism Platform',
  adminEmail: 'admin@travelai.vn',
  supportPhone: '1900 6868',
  emailNotifications: true,
  systemNotifications: true,
  autoApproveVerifiedUsers: false,
  maintenanceMode: false,
};

const getStoredPosts = () => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(POSTS_STORAGE_KEY) : null;
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
};

const saveStoredPosts = (posts) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  }
};

const getStoredConfig = () => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(CONFIG_STORAGE_KEY) : null;
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SYSTEM_CONFIG));
  }
  return DEFAULT_SYSTEM_CONFIG;
};

const saveStoredConfig = (config) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
};

export const moderationService = {
  /**
   * Lấy danh sách bài viết kiểm duyệt (đồng bộ trực tiếp từ feed travelai_social_posts)
   */
  async getPosts({ status = 'all', search = '' } = {}) {
    let list = getStoredPosts();

    // Map each post to ensure compatibility with moderation UI and probes
    let mapped = list.map((p) => {
      const postStatus = (p.status || 'APPROVED').toLowerCase();
      const authorName =
        typeof p.author === 'string'
          ? p.author
          : p.author?.fullName || p.author?.username || 'Du khách';

      return {
        ...p,
        title: p.title || p.locationTag || p.content?.slice(0, 60) || 'Bài viết du lịch',
        author: authorName,
        category: p.category || (p.locationTag ? 'Địa điểm' : 'Trải nghiệm'),
        status: postStatus,
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Mới đây',
        rejectReason: p.rejectReason || null,
      };
    });

    if (status && status !== 'all') {
      const target = status.toLowerCase();
      mapped = mapped.filter((p) => p.status === target);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      mapped = mapped.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q) ||
          p.content?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return mapped;
  },

  /**
   * Duyệt bài viết -> Cập nhật trạng thái APPROVED trong travelai_social_posts
   * Sau khi duyệt, bài viết sẽ lập tức xuất hiện trên bảng tin cộng đồng (feedService.getFeedPosts).
   */
  async approvePost(id) {
    const list = getStoredPosts();
    const idx = list.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'APPROVED',
        rejectReason: null,
      };
      saveStoredPosts(list);
      return list[idx];
    }
    throw new Error('Bài viết không tồn tại');
  },

  /**
   * Từ chối bài viết kèm lý do vi phạm
   */
  async rejectPost(id, reason) {
    const list = getStoredPosts();
    const idx = list.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'REJECTED',
        rejectReason: reason || 'Nội dung không phù hợp tiêu chuẩn cộng đồng.',
      };
      saveStoredPosts(list);
      return list[idx];
    }
    throw new Error('Bài viết không tồn tại');
  },

  /**
   * Lấy cấu hình hệ thống
   */
  async getSystemConfig() {
    return getStoredConfig();
  },

  /**
   * Lưu cấu hình hệ thống
   * Lưu ý kỹ thuật: Lưu trữ cấu hình cục bộ dành cho ban quản trị phía client,
   * sẵn sàng đồng bộ khi Core Backend cung cấp API /api/v1/admin/config.
   */
  async saveSystemConfig(newConfig) {
    const updated = {
      ...getStoredConfig(),
      ...newConfig,
    };
    saveStoredConfig(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('travelai_config_updated', { detail: updated }));
    }
    return updated;
  },

  /**
   * Kiểm tra xem chế độ bảo trì có đang bật hay không
   */
  isMaintenanceMode() {
    return Boolean(getStoredConfig().maintenanceMode);
  },
};

export default moderationService;
