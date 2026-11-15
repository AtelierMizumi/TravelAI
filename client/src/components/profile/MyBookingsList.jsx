import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Eye,
  CreditCard,
  Ban,
  MessageSquare,
  Sparkles,
  MapPin,
  Luggage,
  Building2,
  Ticket,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { BookingDetailModal } from './BookingDetailModal';
import { BookingCancelModal } from './BookingCancelModal';
import { BookingPayModal } from './BookingPayModal';
import { Pagination } from '../places/Pagination';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { Skeleton } from '../ui/Skeleton';

export const MyBookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter & Pagination States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Action States
  const [detailModalBooking, setDetailModalBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [payModalBooking, setPayModalBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingService.getMyBookings({
        page,
        size: pageSize,
        status: statusFilter === 'ALL' ? '' : statusFilter,
        bookingType: typeFilter === 'ALL' ? '' : typeFilter,
      });

      setBookings(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(err);
      setToast({
        type: 'error',
        title: err?.title || 'Không thể tải danh sách đơn đặt',
        message:
          err?.detail ||
          'Đã có lỗi xảy ra khi đồng bộ đơn đặt chỗ từ hệ thống. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, typeFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Client-side quick search filtering
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter((b) => {
      const matchCode = b.bookingCode?.toLowerCase().includes(q);
      const matchItem = b.items?.some((item) =>
        item.itemName?.toLowerCase().includes(q)
      );
      return matchCode || matchItem;
    });
  }, [bookings, searchQuery]);

  // Handle Cancel Booking
  const handleConfirmCancel = async (bookingId) => {
    try {
      setActionLoading(true);
      await bookingService.cancelBooking(bookingId);
      setCancelModalBooking(null);
      setToast({
        type: 'success',
        title: 'Hủy đơn thành công',
        message: 'Đơn đặt chỗ của bạn đã được chuyển sang trạng thái Đã hủy.',
      });
      fetchBookings();
    } catch (err) {
      setToast({
        type: 'error',
        title: err?.title || 'Không thể hủy đơn',
        message:
          err?.detail ||
          'Không thể xử lý yêu cầu hủy đơn lúc này. Vui lòng liên hệ hỗ trợ.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Pay Booking
  const handleConfirmPay = async (bookingId, paymentMethod) => {
    try {
      setActionLoading(true);
      const res = await bookingService.payBooking(bookingId, { paymentMethod });
      setPayModalBooking(null);
      setToast({
        type: 'success',
        title: 'Thanh toán thành công!',
        message: res.voucherCode
          ? `Đơn hàng đã được thanh toán. Mã voucher của bạn là: ${res.voucherCode}`
          : 'Đơn hàng đã được ghi nhận thanh toán thành công.',
      });
      fetchBookings();
    } catch (err) {
      setToast({
        type: 'error',
        title: err?.title || 'Lỗi thanh toán',
        message:
          err?.detail ||
          'Không thể xử lý giao dịch thanh toán. Vui lòng kiểm tra lại tài khoản.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Copy code helper
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const statusTabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ thanh toán' },
    { id: 'PAID', label: 'Đã thanh toán / Xác nhận' },
    { id: 'COMPLETED', label: 'Đã hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all focus:outline-none ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Service Type Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50/80 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Type Selector Chips */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Loại:
            </span>
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'TOUR', label: 'Tour' },
              { id: 'HOTEL', label: 'Khách sạn' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTypeFilter(t.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === t.id
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 font-semibold'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row gap-5"
            >
              <Skeleton className="w-full md:w-56 h-40 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-6 w-32 rounded" />
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <Luggage className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Không tìm thấy đơn đặt chỗ nào
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            {searchQuery
              ? 'Không có đơn đặt nào khớp với từ khóa tìm kiếm của bạn.'
              : 'Bạn chưa có đơn đặt tour hoặc khách sạn nào trong danh mục này. Hãy bắt đầu khám phá các chuyến đi tuyệt vời cùng TravelAI!'}
          </p>
          <a href="/places">
            <Button variant="primary" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Khám phá tour & khách sạn ngay
            </Button>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const badgeInfo = bookingService.getStatusBadge(b.status);
            const mainItem = b.items?.[0] || {};
            const isPending = b.status === 'PENDING';
            const isCancellable =
              b.status === 'PENDING' ||
              b.status === 'PAID' ||
              b.status === 'CONFIRMED';
            const isCompleted = b.status === 'COMPLETED';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row group"
              >
                {/* Banner Thumbnail */}
                <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden bg-gray-100 flex-shrink-0">
                  {mainItem.imageUrl ? (
                    <img
                      src={mainItem.imageUrl}
                      alt={mainItem.itemName || 'Booking item'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-brand-50/50 text-brand-600">
                      {b.bookingType === 'HOTEL' ? (
                        <Building2 className="w-10 h-10 mb-1" />
                      ) : (
                        <Luggage className="w-10 h-10 mb-1" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {b.bookingType || 'DỊCH VỤ'}
                      </span>
                    </div>
                  )}

                  {/* Type Badge Floating */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs text-[11px] font-bold text-gray-800 flex items-center gap-1">
                    {b.bookingType === 'HOTEL' ? (
                      <Building2 className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <Luggage className="w-3.5 h-3.5 text-brand-600" />
                    )}
                    <span>{b.bookingType === 'HOTEL' ? 'Khách sạn' : 'Tour du lịch'}</span>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    {/* Top Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                          #{b.bookingCode}
                          <button
                            type="button"
                            onClick={() => handleCopyCode(b.bookingCode)}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title="Sao chép mã đơn"
                          >
                            {copiedCode === b.bookingCode ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                        {b.voucherCode && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Ticket className="w-3 h-3" />
                            {b.voucherCode}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`} />
                        {badgeInfo.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug mb-2">
                      {mainItem.itemName || `Đơn đặt dịch vụ ${b.bookingCode}`}
                    </h4>

                    {/* Dates & Guests */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-brand-600" />
                        <span>
                          {bookingService.formatDate(b.startDate)}
                          {b.endDate && ` - ${bookingService.formatDate(b.endDate)}`}
                        </span>
                      </div>
                      {mainItem.quantity && (
                        <span>• Số lượng: {mainItem.quantity} vé / phòng</span>
                      )}
                      {mainItem.numberOfNights && (
                        <span>• Lưu trú: {mainItem.numberOfNights} đêm</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Price & Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                        Tổng thanh toán
                      </p>
                      <p className="text-xl font-extrabold text-brand-600">
                        {bookingService.formatVND(b.totalAmount)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Xem chi tiết */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailModalBooking(b)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Xem chi tiết
                      </Button>

                      {/* Thanh toán ngay (nếu PENDING) */}
                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setPayModalBooking(b)}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                          Thanh toán ngay
                        </Button>
                      )}

                      {/* Viết đánh giá (nếu COMPLETED) */}
                      {isCompleted && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setToast({
                              type: 'info',
                              title: 'Đánh giá dịch vụ',
                              message:
                                'Tính năng đánh giá dịch vụ đã sẵn sàng và đang kết nối cùng hệ thống Review.',
                            })
                          }
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                          Viết đánh giá
                        </Button>
                      )}

                      {/* Hủy đặt chỗ (nếu có thể hủy) */}
                      {isCancellable && (
                        <button
                          type="button"
                          onClick={() => setCancelModalBooking(b)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel="đơn đặt chỗ"
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Modals */}
      <BookingDetailModal
        booking={detailModalBooking}
        isOpen={Boolean(detailModalBooking)}
        onClose={() => setDetailModalBooking(null)}
        onCancelClick={(b) => setCancelModalBooking(b)}
        onPayClick={(b) => setPayModalBooking(b)}
      />

      <BookingCancelModal
        booking={cancelModalBooking}
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        onConfirmCancel={handleConfirmCancel}
        isLoading={actionLoading}
      />

      <BookingPayModal
        booking={payModalBooking}
        isOpen={Boolean(payModalBooking)}
        onClose={() => setPayModalBooking(null)}
        onConfirmPay={handleConfirmPay}
        isLoading={actionLoading}
      />
    </div>
  );
};
