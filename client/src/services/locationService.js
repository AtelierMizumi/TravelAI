import api from './api';

// Comprehensive seed dataset for offline development / standalone client testing
const DEFAULT_LOCATIONS = [
  {
    id: 1,
    name: 'Vịnh Hạ Long',
    province: 'Quảng Ninh',
    category: 'Danh lam thắng cảnh',
    rating: 4.9,
    reviewCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    latitude: 20.9101,
    longitude: 107.1839,
    description: 'Kỳ quan thiên nhiên thế giới UNESCO nổi tiếng với hàng ngàn đảo đá vôi kỳ vĩ nổi bật trên làn nước màu ngọc bích, các hang động thạch nhũ huyền ảo và làng chài truyền thống.',
  },
  {
    id: 2,
    name: 'Phố Cổ Hội An',
    province: 'Quảng Nam',
    category: 'Di tích lịch sử',
    rating: 4.8,
    reviewCount: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    latitude: 15.8801,
    longitude: 108.338,
    description: 'Đô thị cổ được bảo tồn nguyên vẹn từ thế kỷ 16-17 với những dãy nhà tường vàng mái ngói rêu phong, đèn lồng rực rỡ bên dòng sông Hoài thơ mộng và ẩm thực phong phú.',
  },
  {
    id: 3,
    name: 'Quần Thể Danh Thắng Tràng An',
    province: 'Ninh Bình',
    category: 'Danh lam thắng cảnh',
    rating: 4.9,
    reviewCount: 980,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    latitude: 20.2506,
    longitude: 105.9042,
    description: 'Di sản hỗn hợp văn hóa và thiên nhiên thế giới với hệ thống núi đá vôi karst hùng vĩ, thung lũng ngập nước và những hang động xuyên thủy kỳ thú gắn liền cố đô Hoa Lư.',
  },
  {
    id: 4,
    name: 'Bà Nà Hills & Cầu Vàng',
    province: 'Đà Nẵng',
    category: 'Danh lam thắng cảnh',
    rating: 4.7,
    reviewCount: 1100,
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    latitude: 15.9984,
    longitude: 107.9959,
    description: 'Khu du lịch trên đỉnh núi Chúa với kiến trúc làng Pháp cổ kính, hệ thống cáp treo đạt nhiều kỷ lục thế giới và tuyệt tác Cầu Vàng được nâng đỡ bởi đôi bàn tay khổng lồ.',
  },
  {
    id: 5,
    name: 'Vườn Quốc Gia Phong Nha - Kẻ Bàng',
    province: 'Quảng Bình',
    category: 'Sinh thái',
    rating: 4.9,
    reviewCount: 840,
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    latitude: 17.5899,
    longitude: 106.2842,
    description: 'Vương quốc hang động thế giới sở hữu hang Sơn Đoòng lớn nhất hành tinh cùng hệ sinh thái rừng nhiệt đới nguyên sinh trên núi đá vôi độc đáo.',
  },
  {
    id: 6,
    name: 'Đảo Ngọc Phú Quốc',
    province: 'Kiên Giang',
    category: 'Biển đảo',
    rating: 4.8,
    reviewCount: 1350,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    latitude: 10.2899,
    longitude: 103.984,
    description: 'Hòn đảo thiên đường nhiệt đới với những bãi cát trắng mịn màng như Bãi Sao, làn nước biển trong vắt như pha lê cùng hệ thống resort nghỉ dưỡng đẳng cấp quốc tế.',
  },
  {
    id: 7,
    name: 'Đỉnh Fansipan - Nóc Nhà Đông Dương',
    province: 'Lào Cai',
    category: 'Danh lam thắng cảnh',
    rating: 4.8,
    reviewCount: 920,
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    latitude: 22.3033,
    longitude: 103.7753,
    description: 'Đỉnh núi cao nhất bán đảo Đông Dương (3.143m) sừng sững giữa biển mây bồng bềnh của dãy Hoàng Liên Sơn, với quần thể kiến trúc tâm linh kỳ vĩ trên đỉnh núi.',
  },
  {
    id: 8,
    name: 'Hồ Tuyền Lâm & Thành Phố Ngàn Hoa',
    province: 'Lâm Đồng',
    category: 'Sinh thái',
    rating: 4.7,
    reviewCount: 760,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    latitude: 11.8906,
    longitude: 108.4358,
    description: 'Hồ nước ngọt thơ mộng được bao bọc bởi những cánh rừng thông xanh ngắt, mang không khí se lạnh lãng mạn đặc trưng của cao nguyên Đà Lạt.',
  },
  {
    id: 9,
    name: 'Chợ Nổi Cái Răng',
    province: 'Cần Thơ',
    category: 'Văn hóa',
    rating: 4.6,
    reviewCount: 650,
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    latitude: 10.0055,
    longitude: 105.7482,
    description: 'Nét văn hóa giao thương sông nước độc đáo của đồng bằng sông Cửu Long, tấp nập thuyền bè chở đầy nông sản tươi ngon lúc bình minh.',
  },
];

export const locationService = {
  /**
   * Search locations by keyword, province, category with pagination
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getLocations({
    keyword = '',
    province = '',
    category = '',
    page = 0,
    size = 9,
    sort = 'id,desc',
  } = {}) {
    try {
      const params = {};
      if (keyword) params.keyword = keyword.trim();
      if (province) params.province = province;
      if (category) params.category = category;
      params.page = page;
      params.size = size;
      params.sort = sort;

      const response = await api.get('/v1/locations', { params });
      return response.data;
    } catch (err) {
      // In offline / standalone dev mode, provide local filtering and pagination
      if (import.meta.env.DEV) {
        let filtered = [...DEFAULT_LOCATIONS];

        if (keyword) {
          const lower = keyword.toLowerCase().trim();
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(lower) ||
              item.description.toLowerCase().includes(lower) ||
              item.province.toLowerCase().includes(lower)
          );
        }

        if (province && province !== 'Tất cả') {
          filtered = filtered.filter((item) => item.province === province);
        }

        if (category && category !== 'Tất cả') {
          filtered = filtered.filter((item) => item.category === category);
        }

        if (sort === 'rating,desc') {
          filtered.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'name,asc') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          filtered.sort((a, b) => b.id - a.id);
        }

        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = page * size;
        const paginatedContent = filtered.slice(startIndex, startIndex + size);

        return {
          content: paginatedContent,
          totalPages: Math.max(1, totalPages),
          totalElements,
          number: page,
          size,
          first: page === 0,
          last: page >= totalPages - 1,
        };
      }
      throw err;
    }
  },

  /**
   * Get single location by ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getLocationById(id) {
    try {
      const response = await api.get(`/v1/locations/${id}`);
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        const found = DEFAULT_LOCATIONS.find((loc) => loc.id === Number(id));
        if (found) return found;
      }
      throw err;
    }
  },

  getProvinces() {
    return [
      'Tất cả',
      'Quảng Ninh',
      'Quảng Nam',
      'Ninh Bình',
      'Đà Nẵng',
      'Quảng Bình',
      'Kiên Giang',
      'Lào Cai',
      'Lâm Đồng',
      'Cần Thơ',
      'Hà Nội',
      'Thừa Thiên Huế',
    ];
  },

  getCategories() {
    return [
      'Tất cả',
      'Danh lam thắng cảnh',
      'Di tích lịch sử',
      'Biển đảo',
      'Sinh thái',
      'Văn hóa',
    ];
  },
};
