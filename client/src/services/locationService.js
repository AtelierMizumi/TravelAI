import api from './api';

export const locationService = {
  /**
   * Search locations by keyword to match recognized AI landmark
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getLocations({
    keyword = '',
    province = '',
    category = '',
    page = 0,
    size = 10,
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
      if (import.meta.env.DEV) {
        // Fallback for offline testing
        const sampleLocations = [
          {
            id: 1,
            name: 'Vịnh Hạ Long',
            province: 'Quảng Ninh',
            description: 'Di sản thiên nhiên thế giới UNESCO với hàng nghìn đảo đá vôi kỳ vĩ.',
            imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
            latitude: 20.9101,
            longitude: 107.1839,
            category: 'Danh lam thắng cảnh',
            rating: 4.9,
            reviewCount: 1420,
          },
          {
            id: 2,
            name: 'Phố Cổ Hội An',
            province: 'Quảng Nam',
            description: 'Đô thị cổ được bảo tồn tại miền Trung với kiến trúc đèn lồng rực rỡ bên sông Hoài.',
            imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
            latitude: 15.8801,
            longitude: 108.338,
            category: 'Di tích lịch sử',
            rating: 4.8,
            reviewCount: 1250,
          },
          {
            id: 3,
            name: 'Quần Thể Danh Thắng Tràng An',
            province: 'Ninh Bình',
            description: 'Di sản văn hóa và thiên nhiên thế giới với cảnh quan karst thung lũng đá vôi ngập nước.',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            latitude: 20.2506,
            longitude: 105.9042,
            category: 'Danh lam thắng cảnh',
            rating: 4.9,
            reviewCount: 980,
          },
        ];

        let matched = sampleLocations;
        if (keyword) {
          const lower = keyword.toLowerCase();
          matched = sampleLocations.filter((l) => l.name.toLowerCase().includes(lower));
        }

        return {
          content: matched,
          totalElements: matched.length,
          totalPages: 1,
          number: 0,
          size,
        };
      }
      throw err;
    }
  },

  async getLocationById(id) {
    const response = await api.get(`/v1/locations/${id}`);
    return response.data;
  },
};
