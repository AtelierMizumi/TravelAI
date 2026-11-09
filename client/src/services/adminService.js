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
  if (typeof localStorage !== 'undefined' && localStorage.getItem('travelai_demo_mode') === 'true') {
    return true;
  }
  const isDevWithoutToken =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.DEV &&
    typeof localStorage !== 'undefined' &&
    !localStorage.getItem('travelai_token');
  const isBackendUnavailable =
    err?.isNetworkError || err?.status === 0 || err?.status === 502 || err?.status === 503;

  return isDevWithoutToken && isBackendUnavailable;
};

export const adminService = {
  /**
   * Lấy số liệu thống kê tổng quan (Analytics Stats) từ Backend Core
   */
  async getAuditStats() {
    try {
      const response = await api.get('/admin/bookings/stats');
      const data = response?.data || {};

      // Dùng toán tử ?? để bảo toàn giá trị 0 hợp lệ từ API (không dùng || vì sẽ ghi đè 0 bằng mock)
      return {
        totalBookings: data.totalBookings ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
        formattedTotalRevenue:
          data.formattedTotalRevenue ?? adminService.formatVND(data.totalRevenue ?? 0),
        tourRevenue: data.tourRevenue ?? 0,
        formattedTourRevenue:
          data.formattedTourRevenue ?? adminService.formatVND(data.tourRevenue ?? 0),
        hotelRevenue: data.hotelRevenue ?? 0,
        formattedHotelRevenue:
          data.formattedHotelRevenue ?? adminService.formatVND(data.hotelRevenue ?? 0),
        pendingCount: data.pendingCount ?? 0,
        confirmedCount: data.confirmedCount ?? 0,
        paidCount: data.paidCount ?? 0,
        completedCount: data.completedCount ?? 0,
        cancelledCount: data.cancelledCount ?? 0,
        reconciliationRate: data.reconciliationRate ?? 0,
        totalPayments: data.totalPayments ?? 0,
        reconciledPayments: data.reconciledPayments ?? 0,
        // Các chỉ số không có trong BookingAuditStatsResponse: không bịa đặt số liệu giả
        totalUsers: data.totalUsers ?? null,
        growthRate: data.growthRate ?? null,
        isDemoData: false,
      };
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        return {
          ...DEFAULT_STATS,
          isDemoData: true,
        };
      }
      throw err;
    }
  },

  /**
   * Lấy chuỗi doanh thu theo tháng cho biểu đồ
   * Tổng hợp trực tiếp từ danh sách giao dịch đặt chỗ thực tế (GET /api/v1/admin/bookings)
   */
  async getRevenueChartData() {
    try {
      const response = await api.get('/admin/bookings', { params: { size: 100 } });
      const bookings = response?.data?.content || [];
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      const monthlyRevenue = months.map((m) => ({ month: m, revenue: 0 }));

      if (Array.isArray(bookings) && bookings.length > 0) {
        bookings.forEach((b) => {
          if (
            b.createdAt &&
            b.totalAmount &&
            (b.status === 'PAID' || b.status === 'CONFIRMED' || b.status === 'COMPLETED')
          ) {
            const date = new Date(b.createdAt);
            const mIdx = date.getMonth();
            if (mIdx >= 0 && mIdx < 12) {
              monthlyRevenue[mIdx].revenue += Number(b.totalAmount) || 0;
            }
          }
        });
        return monthlyRevenue;
      }

      // Khi API thành công nhưng cơ sở dữ liệu chưa có booking: trả về 0 doanh thu cho các tháng
      return monthlyRevenue;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        return DEFAULT_REVENUE_CHART;
      }
      throw err;
    }
  },

  /**
   * Lấy danh sách điểm đến phổ biến nhất từ dữ liệu booking
   */
  async getPopularDestinations() {
    try {
      const response = await api.get('/admin/bookings', { params: { size: 100 } });
      const bookings = response?.data?.content || [];

      if (Array.isArray(bookings) && bookings.length > 0) {
        const destCounts = {};
        let totalCount = 0;
        bookings.forEach((b) => {
          const item = b.items?.[0];
          const name = item?.itemName || b.bookingType || 'Địa điểm du lịch';
          destCounts[name] = (destCounts[name] || 0) + 1;
          totalCount++;
        });

        return Object.entries(destCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({
            name,
            location: 'Điểm tham quan',
            count,
            percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
          }));
      }

      // Trả về mảng rỗng khi cơ sở dữ liệu chưa có giao dịch
      return [];
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        return DEFAULT_POPULAR_DESTINATIONS;
      }
      throw err;
    }
  },

  /**
   * Lấy hoạt động giao dịch gần đây
   */
  async getRecentActivities() {
    try {
      const response = await api.get('/admin/bookings', { params: { size: 5 } });
      const bookings = response?.data?.content;

      // Khi API thành công: trả về đúng dữ liệu từ database, nếu rỗng thì trả về mảng rỗng []
      if (Array.isArray(bookings)) {
        return bookings.map((b) => ({
          id: b.id,
          bookingCode: b.bookingCode,
          user: b.contactName || b.username || 'Khách hàng',
          action: `Đã đặt ${b.items?.[0]?.itemName || b.bookingType || 'dịch vụ'}`,
          time: b.createdAt
            ? new Date(b.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })
            : 'Mới đây',
          status: (b.status || 'pending').toLowerCase(),
          amount: b.formattedTotalAmount || adminService.formatVND(b.totalAmount ?? 0),
        }));
      }
      return [];
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

export default adminService;
