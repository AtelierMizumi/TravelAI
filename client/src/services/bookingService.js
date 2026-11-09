import api from './api';

const MOCK_STORAGE_KEY = 'travelai_demo_bookings';

// High-fidelity seed bookings for dev / offline testing, perfectly matching BookingResponse DTO
const DEFAULT_BOOKINGS = [
  {
    id: 1,
    bookingCode: 'BK20261109001',
    userId: 1,
    username: 'traveler',
    bookingType: 'TOUR',
    status: 'PAID',
    totalAmount: 9500000,
    formattedTotalAmount: '9.500.000 đ',
    currency: 'VND',
    contactName: 'Nguyễn Văn Du Khách',
    contactEmail: 'traveler@travelai.vn',
    contactPhone: '0901234567',
    specialRequests: 'Yêu cầu phòng hướng biển, ăn chay nhẹ.',
    startDate: '2026-11-20',
    endDate: '2026-11-23',
    voucherCode: 'VCH-HALONG2026',
    items: [
      {
        id: 101,
        itemType: 'TOUR',
        itemId: 1,
        itemName: 'Tour Du Thuyền 5 Sao Vịnh Hạ Long - Đảo Ti Tốp (3N2Đ)',
        unitPrice: 4750000,
        formattedUnitPrice: '4.750.000 đ',
        quantity: 2,
        numberOfNights: 2,
        subtotal: 9500000,
        formattedSubtotal: '9.500.000 đ',
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      },
    ],
    payment: {
      id: 201,
      paymentMethod: 'VNPAY_QR',
      transactionId: 'TXN-984729103',
      amount: 9500000,
      status: 'SUCCESS',
      paidAt: '2026-11-09T10:15:30',
    },
    createdAt: '2026-11-09T09:45:00',
    updatedAt: '2026-11-09T10:15:30',
  },
  {
    id: 2,
    bookingCode: 'BK20261109002',
    userId: 1,
    username: 'traveler',
    bookingType: 'HOTEL',
    status: 'PENDING',
    totalAmount: 6400000,
    formattedTotalAmount: '6.400.000 đ',
    currency: 'VND',
    contactName: 'Nguyễn Văn Du Khách',
    contactEmail: 'traveler@travelai.vn',
    contactPhone: '0901234567',
    specialRequests: 'Nhận phòng sớm khoảng 12:00 nếu có phòng trống.',
    startDate: '2026-11-28',
    endDate: '2026-11-30',
    voucherCode: null,
    items: [
      {
        id: 102,
        itemType: 'HOTEL',
        itemId: 2,
        itemName: 'Lotte Hotel Hà Nội - Phòng Deluxe Hướng Hồ Tây',
        unitPrice: 3200000,
        formattedUnitPrice: '3.200.000 đ',
        quantity: 1,
        numberOfNights: 2,
        subtotal: 6400000,
        formattedSubtotal: '6.400.000 đ',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      },
    ],
    payment: null,
    createdAt: '2026-11-09T11:00:00',
    updatedAt: '2026-11-09T11:00:00',
  },
  {
    id: 3,
    bookingCode: 'BK20261015003',
    userId: 1,
    username: 'traveler',
    bookingType: 'TOUR',
    status: 'COMPLETED',
    totalAmount: 5200000,
    formattedTotalAmount: '5.200.000 đ',
    currency: 'VND',
    contactName: 'Nguyễn Văn Du Khách',
    contactEmail: 'traveler@travelai.vn',
    contactPhone: '0901234567',
    specialRequests: 'Không.',
    startDate: '2026-10-20',
    endDate: '2026-10-22',
    voucherCode: 'VCH-HOIAN-PROMO',
    items: [
      {
        id: 103,
        itemType: 'TOUR',
        itemId: 3,
        itemName: 'Tour Di Sản Phố Cổ Hội An & Thánh Địa Mỹ Sơn (2N1Đ)',
        unitPrice: 2600000,
        formattedUnitPrice: '2.600.000 đ',
        quantity: 2,
        numberOfNights: 1,
        subtotal: 5200000,
        formattedSubtotal: '5.200.000 đ',
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    payment: {
      id: 202,
      paymentMethod: 'VISA_MASTERCARD',
      transactionId: 'TXN-874211094',
      amount: 5200000,
      status: 'SUCCESS',
      paidAt: '2026-10-15T14:20:00',
    },
    createdAt: '2026-10-15T14:10:00',
    updatedAt: '2026-10-22T18:00:00',
  },
  {
    id: 4,
    bookingCode: 'BK20261001004',
    userId: 1,
    username: 'traveler',
    bookingType: 'HOTEL',
    status: 'CANCELLED',
    totalAmount: 4800000,
    formattedTotalAmount: '4.800.000 đ',
    currency: 'VND',
    contactName: 'Nguyễn Văn Du Khách',
    contactEmail: 'traveler@travelai.vn',
    contactPhone: '0901234567',
    specialRequests: 'Đã hủy do thay đổi lịch trình đột xuất.',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    voucherCode: null,
    items: [
      {
        id: 104,
        itemType: 'HOTEL',
        itemId: 4,
        itemName: 'Vinpearl Resort & Spa Phú Quốc - Villa 1 Phòng Ngủ',
        unitPrice: 2400000,
        formattedUnitPrice: '2.400.000 đ',
        quantity: 1,
        numberOfNights: 2,
        subtotal: 4800000,
        formattedSubtotal: '4.800.000 đ',
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      },
    ],
    payment: null,
    createdAt: '2026-10-01T08:30:00',
    updatedAt: '2026-10-02T09:00:00',
  },
];

const shouldFallbackToDemo = (err) => {
  if (localStorage.getItem('travelai_demo_mode') === 'true') {
    return true;
  }
  const isDevWithoutToken = import.meta.env.DEV && !localStorage.getItem('travelai_token');
  const isBackendUnavailable =
    err?.isNetworkError || err?.status === 0 || err?.status === 502 || err?.status === 503;

  return isDevWithoutToken && isBackendUnavailable;
};

const getStoredMockBookings = () => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(DEFAULT_BOOKINGS));
  return DEFAULT_BOOKINGS;
};

const saveStoredMockBookings = (bookings) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(bookings));
};

export const bookingService = {
  /**
   * Lấy danh sách booking của người dùng hiện tại
   */
  async getMyBookings({ page = 0, size = 10, status = '', bookingType = '' } = {}) {
    try {
      const params = { page, size };
      if (status) params.status = status;
      if (bookingType) params.bookingType = bookingType;

      const response = await api.get('/bookings/my-bookings', { params });
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        let list = getStoredMockBookings();

        if (status && status !== 'ALL') {
          list = list.filter((b) => b.status?.toUpperCase() === status.toUpperCase());
        }
        if (bookingType && bookingType !== 'ALL') {
          list = list.filter((b) => b.bookingType?.toUpperCase() === bookingType.toUpperCase());
        }

        const totalElements = list.length;
        const totalPages = Math.ceil(totalElements / size) || 1;
        const start = page * size;
        const pagedContent = list.slice(start, start + size);

        return {
          content: pagedContent,
          pageable: { pageNumber: page, pageSize: size },
          totalPages,
          totalElements,
          number: page,
          size,
          last: page >= totalPages - 1,
          first: page === 0,
        };
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết đơn đặt theo ID
   */
  async getBookingById(id) {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        const list = getStoredMockBookings();
        const found = list.find((b) => b.id === Number(id));
        if (found) return found;
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết đơn đặt theo Booking Code
   */
  async getBookingByCode(bookingCode) {
    try {
      const response = await api.get(`/bookings/code/${bookingCode}`);
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        const list = getStoredMockBookings();
        const found = list.find(
          (b) => b.bookingCode?.toLowerCase() === bookingCode?.toLowerCase()
        );
        if (found) return found;
      }
      throw err;
    }
  },

  /**
   * Gửi yêu cầu hủy đơn đặt chỗ
   */
  async cancelBooking(id) {
    try {
      const response = await api.put(`/bookings/${id}/cancel`);
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        const list = getStoredMockBookings();
        const idx = list.findIndex((b) => b.id === Number(id));
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
          };
          saveStoredMockBookings(list);
          return list[idx];
        }
      }
      throw err;
    }
  },

  /**
   * Thanh toán cho đơn đặt chỗ đang PENDING
   */
  async payBooking(id, paymentData = {}) {
    try {
      const response = await api.post(`/bookings/${id}/pay`, paymentData);
      return response.data;
    } catch (err) {
      if (shouldFallbackToDemo(err)) {
        const list = getStoredMockBookings();
        const idx = list.findIndex((b) => b.id === Number(id));
        if (idx !== -1) {
          const updated = {
            ...list[idx],
            status: 'PAID',
            voucherCode: list[idx].voucherCode || `VCH-${Math.floor(100000 + Math.random() * 900000)}`,
            payment: {
              id: Date.now(),
              paymentMethod: paymentData.paymentMethod || 'MOCK_GATEWAY',
              transactionId: `TXN-${Date.now()}`,
              amount: list[idx].totalAmount,
              status: 'SUCCESS',
              paidAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
          list[idx] = updated;
          saveStoredMockBookings(list);
          return updated;
        }
      }
      throw err;
    }
  },

  /**
   * Định dạng tiền tệ VND chuẩn Quốc Tế
   */
  formatVND(amount) {
    if (amount == null || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  },

  /**
   * Định dạng chuỗi ngày tháng hiển thị thân thiện
   */
  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  },

  /**
   * Định dạng ngày giờ đầy đủ
   */
  formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '—';
    try {
      const d = new Date(dateTimeStr);
      if (isNaN(d.getTime())) return dateTimeStr;
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateTimeStr;
    }
  },

  /**
   * Cung cấp thông tin hiển thị Badge trạng thái đơn
   */
  getStatusBadge(status) {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
        return {
          label: 'Chờ thanh toán',
          variant: 'warning',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500',
        };
      case 'PAID':
        return {
          label: 'Đã thanh toán',
          variant: 'success',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
        };
      case 'CONFIRMED':
        return {
          label: 'Đã xác nhận',
          variant: 'success',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
        };
      case 'COMPLETED':
        return {
          label: 'Đã hoàn thành',
          variant: 'brand',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500',
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          variant: 'danger',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500',
        };
      default:
        return {
          label: status || 'Không xác định',
          variant: 'gray',
          badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
          dotClass: 'bg-gray-400',
        };
    }
  },
};
