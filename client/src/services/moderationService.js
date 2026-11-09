const POSTS_STORAGE_KEY = 'travelai_moderation_posts';
const CONFIG_STORAGE_KEY = 'travelai_system_config';

const DEFAULT_MODERATION_POSTS = [
  {
    id: 1,
    title: 'Top 10 địa điểm bí mật chụp ảnh sống ảo tại Hà Nội',
    author: 'Nguyễn Văn Minh',
    category: 'Cẩm nang du lịch',
    status: 'pending',
    date: '08/11/2026',
    content: 'Tổng hợp những con ngõ cổ kính, quán cafe tầng thượng view Hồ Gươm ít người biết...',
    rejectReason: null,
  },
  {
    id: 2,
    title: 'Hành trình khám phá ẩm thực đường phố Đà Nẵng 3N2Đ',
    author: 'Trần Thị Lan',
    category: 'Ẩm thực',
    status: 'approved',
    date: '06/11/2026',
    content: 'Review chi tiết mì Quảng bà Mua, bánh tráng cuốn thịt heo Đại Lộc và hải sản tươi sống...',
    rejectReason: null,
  },
  {
    id: 3,
    title: 'Top khách sạn view biển giá tốt nhất tại Nha Trang 2026',
    author: 'Lê Hoàng Nam',
    category: 'Khách sạn',
    status: 'approved',
    date: '05/11/2026',
    content: 'Danh sách resort và khách sạn 4-5 sao dọc đường Trần Phú có buffet sáng phong phú...',
    rejectReason: null,
  },
  {
    id: 4,
    title: 'Cẩm nang mua sắm quà lưu niệm Phố Cổ Hội An',
    author: 'Phạm Quốc Bảo',
    category: 'Mua sắm',
    status: 'pending',
    date: '08/11/2026',
    content: 'Kinh nghiệm chọn đèn lồng, lụa tơ tằm và gốm Thanh Hà chất lượng, không lo bị chém giá...',
    rejectReason: null,
  },
  {
    id: 5,
    title: 'Kinh nghiệm trekking săn mây đỉnh Fansipan mùa thu',
    author: 'Đỗ Thúy An',
    category: 'Cẩm nang du lịch',
    status: 'approved',
    date: '04/11/2026',
    content: 'Lịch trình chinh phục nóc nhà Đông Dương, chuẩn bị đồ leo núi và thời điểm biển mây đẹp nhất...',
    rejectReason: null,
  },
  {
    id: 6,
    title: 'Dịch vụ cho thuê xe tự lái giá rẻ - Cam kết rẻ nhất',
    author: 'Dịch Vụ Xe Khách',
    category: 'Quảng cáo',
    status: 'rejected',
    date: '07/11/2026',
    content: 'Chuyên cho thuê xe 4-7 chỗ không cần cọc tiền, liên hệ zalo...',
    rejectReason: 'Nội dung spam quảng cáo thương mại không phù hợp quy định cộng đồng.',
  },
];

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
  const stored = localStorage.getItem(POSTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(DEFAULT_MODERATION_POSTS));
  return DEFAULT_MODERATION_POSTS;
};

const saveStoredPosts = (posts) => {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

const getStoredConfig = () => {
  const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SYSTEM_CONFIG));
  return DEFAULT_SYSTEM_CONFIG;
};

const saveStoredConfig = (config) => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const moderationService = {
  /**
   * Lấy danh sách bài viết kiểm duyệt
   */
  async getPosts({ status = 'all', search = '' } = {}) {
    let list = getStoredPosts();

    if (status && status !== 'all') {
      list = list.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Duyệt bài viết
   */
  async approvePost(id) {
    const list = getStoredPosts();
    const idx = list.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'approved',
        rejectReason: null,
      };
      saveStoredPosts(list);
      return list[idx];
    }
    throw new Error('Bài viết không tồn tại');
  },

  /**
   * Từ chối bài viết kèm lý do
   */
  async rejectPost(id, reason) {
    const list = getStoredPosts();
    const idx = list.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'rejected',
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
   */
  async saveSystemConfig(newConfig) {
    const updated = {
      ...getStoredConfig(),
      ...newConfig,
    };
    saveStoredConfig(updated);
    return updated;
  },
};
