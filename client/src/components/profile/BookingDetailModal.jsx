import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Tag,
  CreditCard,
  FileText,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Button } from '../common/Button';

export const BookingDetailModal = ({
  booking,
  isOpen,
  onClose,
  onCancelClick,
  onPayClick,
}) => {
  if (!isOpen || !booking) return null;

  const badgeInfo = bookingService.getStatusBadge(booking.status);
  const isPending = booking.status === 'PENDING';
  const isCancellable = booking.status === 'PENDING' || booking.status === 'PAID' || booking.status === 'CONFIRMED';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="booking-detail-title" className="text-lg font-bold text-gray-900">
                  Đơn đặt #{booking.bookingCode}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeInfo.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`} />
                  {badgeInfo.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Ngày tạo đơn: {bookingService.formatDateTime(booking.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-gray-700">
          {/* Services / Items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600" />
              Chi tiết dịch vụ đã đặt
            </h4>
            <div className="space-y-3">
              {(booking.items || []).map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-brand-100/60 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {item.itemType || 'SERVICE'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 leading-snug">
                        {item.itemName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                        <span>Số lượng: {item.quantity}</span>
                        {item.numberOfNights && (
                          <span>• Lưu trú: {item.numberOfNights} đêm</span>
                        )}
                        <span>• Đơn giá: {bookingService.formatVND(item.unitPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                    <p className="text-xs text-gray-500">Thành tiền</p>
                    <p className="font-bold text-brand-600 text-base">
                      {bookingService.formatVND(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/80">
            <div>
              <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Ngày bắt đầu / Check-in
              </p>
              <p className="font-bold text-gray-900 text-sm">
                {bookingService.formatDate(booking.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Ngày kết thúc / Check-out
              </p>
              <p className="font-bold text-gray-900 text-sm">
                {bookingService.formatDate(booking.endDate)}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" />
              Thông tin liên hệ nhận vé / phòng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-500 block mb-0.5">Người đại diện:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {booking.contactName || 'Chưa cung cấp'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Email liên hệ:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {booking.contactEmail || 'Chưa cung cấp'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Số điện thoại:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {booking.contactPhone || 'Chưa cung cấp'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Yêu cầu đặc biệt:</span>
                <span className="font-medium text-gray-800">
                  {booking.specialRequests || 'Không có yêu cầu đặc biệt'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Voucher Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Thanh toán & Ưu đãi
            </h4>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mã ưu đãi / Voucher:</span>
                {booking.voucherCode ? (
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {booking.voucherCode}
                  </span>
                ) : (
                  <span className="text-gray-400">Không áp dụng</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Phương thức thanh toán:</span>
                <span className="font-semibold text-gray-800">
                  {booking.payment?.paymentMethod || (isPending ? 'Chưa thanh toán' : 'Cổng trực tuyến')}
                </span>
              </div>
              {booking.payment?.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mã giao dịch:</span>
                  <span className="font-mono text-gray-700">{booking.payment.transactionId}</span>
                </div>
              )}
              {booking.payment?.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Thời gian thanh toán:</span>
                  <span className="text-gray-700">
                    {bookingService.formatDateTime(booking.payment.paidAt)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-base">
                <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                <span className="font-extrabold text-brand-600 text-lg">
                  {bookingService.formatVND(booking.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            {isCancellable && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onClose();
                  onCancelClick(booking);
                }}
              >
                Hủy đặt chỗ này
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            {isPending && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onPayClick(booking);
                }}
              >
                Thanh toán ngay ({bookingService.formatVND(booking.totalAmount)})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
