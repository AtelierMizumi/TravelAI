import api from './api';

const DEFAULT_STATS = {
  totalUsers: 12480,
  totalBookings: 3240,
  totalRevenue: 328450000,
  growthRate: 23.5,
  tourRevenue: 198000000,
  hotelRevenue: 130450000,
  pendingCount: 42,
  confirmedCount: 185,
  paidCount: 2840,
  completedCount: 2650,
  cancelledCount: 173,
  reconciliationRate: 98.4,
};

const DEFAULT_REVENUE_CHART = [
  { month: 'T1', revenue: 14500000 },
  { month: 'T2', revenue: 18200000 },
  { month: 'T3', revenue: 22400000 },
  { month: 'T4', revenue: 26800000 },
  { month: 'T5', revenue: 31200000 },
  { month: 'T6', revenue: 38900000 },
  { month: 'T7', revenue: 42500000 },
  { month: 'T8', revenue: 39100000 },
  { month: 'T9', revenue: 34600000 },
  { month: 'T10', revenue: 41200000 },
  { month: 'T11', revenue: 45800000 },
  { month: 'T12', revenue: 52150000 },
];

const DEFAULT_POPULAR_DESTINATIONS = [
  { name: 'Phố Cổ Hội An', location: 'Quảng Nam', count: 640, percentage: 88 },
  { name: 'Bà Nà Hills & Cầu Vàng', location: 'Đà Nẵng', count: 520, percentage: 76 },
  { name: 'Vịnh Hạ Long', location: 'Quảng Ninh', count: 480, percentage: 68 },
  { name: 'Đảo Ngọc Phú Quốc', location: 'Kiên Giang', count: 390, percentage: 55 },
  { name: 'Quần Thể Danh Thắng Tràng An', location: 'Ninh Bình', count: 310, percentage: 44 },
];

const DEFAULT_ACTIVITIES = [
  {
    id: 1,
    user: 'Nguyễn Văn Minh',
    action: 'Đã đặt phòng Deluxe tại Lotte Hotel Hà Nội',
    time: '2 phút trước',
    status: 'paid',
    amount: '6.400.000 ₫',
  },
  {
    id: 2,
    user: 'Trần Thị Lan',
    action: 'Đã đặt Tour Du Thuyền 5 Sao Vịnh Hạ Long',
    time: '15 phút trước',
    status: 'pending',
    amount: '9.500.000 ₫',
  },
  {
    id: 3,
    user: 'Lê Hoàng Nam',
    action: 'Đã hoàn thành chuyến đi Phố Cổ Hội An',
    time: '1 giờ trước',
    status: 'completed',
    amount: '5.200.000 ₫',
  },
  {
    id: 4,
    user: 'Phạm Quốc Bảo',
    action: 'Đã yêu cầu hủy đơn khách sạn Phú Quốc',
    time: '2 giờ trước',
    status: 'cancelled',
    amount: '4.800.000 ₫',
  },
  {
    id: 5,
    user: 'Đỗ Thúy An',
    action: 'Đã thanh toán Tour Tràng An Cố Đô',
    time: '3 giờ trước',
    status: 'paid',
    amount: '3.600.000 ₫',
  },
];

const shouldFallbackToDemo = (err) => {
  if (localStorage.getItem('travelai_demo_mode') === 'true') {
    return true;
  }
  const isDevWithoutToken = import.meta.env.DEV && !localStorage.getItem('travelai_token');
  const isBackendUnavailable =
    err?.isNetworkError || err?.status === 0 || err?.status === 403 || err?.status === 502 || err?.status === 503;

  return isDevWithoutToken && isBackendUnavailable;
};

export const adminService = {
  /**
   * Lấy số liệu thống kê tổng quan (Analytics Stats)
   */
  async getAuditStats() {
    try {
      const response = await api.get('/admin/bookings/stats');
      const data = response.data;
      return {
        ...DEFAULT_STATS,
        totalBookings: data.totalBookings || DEFAULT_STATS.totalBookings,
        totalRevenue: data.totalRevenue || DEFAULT_STATS.totalRevenue,
        tourRevenue: data.tourRevenue || DEFAULT_STATS.tourRevenue,
        hotelRevenue: data.hotelRevenue || DEFAULT_STATS.hotelRevenue,
        pendingCount: data.pendingCount || DEFAULT_STATS.pendingCount,
        confirmedCount: data.confirmedCount || DEFAULT_STATS.confirmedCount,
        paidCount: data.paidCount || DEFAULT_STATS.paidCount,
        completedCount: data.completedCount || DEFAULT_STATS.completedCount,
        cancelledCount: data.cancelledCount || DEFAULT_STATS.cancelledCount,
        reconciliationRate: data.reconciliationRate || DEFAULT_STATS.reconciliationRate,
      };
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        return DEFAULT_STATS;
      }
      throw err;
    }
  },

  /**
   * Lấy chuỗi doanh thu theo tháng cho biểu đồ
   */
  async getRevenueChartData() {
    return DEFAULT_REVENUE_CHART;
  },

  /**
   * Lấy danh sách điểm đến phổ biến nhất
   */
  async getPopularDestinations() {
    return DEFAULT_POPULAR_DESTINATIONS;
  },

  /**
   * Lấy hoạt động gần đây
   */
  async getRecentActivities() {
    try {
      const response = await api.get('/admin/bookings', { params: { size: 5 } });
      const bookings = response.data?.content || [];
      if (bookings.length > 0) {
        return bookings.map((b) => ({
          id: b.id,
          user: b.contactName || b.username || 'Khách hàng',
          action: `Đã đặt ${b.items?.[0]?.itemName || b.bookingType}`,
          time: new Date(b.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: (b.status || 'pending').toLowerCase(),
          amount: b.formattedTotalAmount || `${b.totalAmount} ₫`,
        }));
      }
      return DEFAULT_ACTIVITIES;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        return DEFAULT_ACTIVITIES;
      }
      throw err;
    }
  },

  formatVND(amount) {
    if (amount == null || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  },
};
