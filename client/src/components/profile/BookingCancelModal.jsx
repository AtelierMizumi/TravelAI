import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Button } from '../common/Button';

export const BookingCancelModal = ({
  booking,
  isOpen,
  onClose,
  onConfirmCancel,
  isLoading,
}) => {
  const [reason, setReason] = useState('Thay đổi lịch trình cá nhân');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !booking) return null;

  const reasons = [
    'Thay đổi lịch trình cá nhân',
    'Có việc bận đột xuất không thể sắp xếp',
    'Muốn thay đổi ngày hoặc chọn dịch vụ khác',
    'Lý do tài chính',
    'Khác',
  ];

  const handleConfirm = () => {
    const finalReason = reason === 'Khác' ? customReason.trim() || 'Lý do khác' : reason;
    onConfirmCancel(booking.id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-red-50/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="cancel-booking-title" className="text-lg font-bold text-gray-900">
                Xác nhận hủy đơn đặt chỗ
              </h3>
              <p className="text-xs text-gray-500">Mã đơn: #{booking.bookingCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
            <p className="font-semibold text-gray-900 mb-1">
              {booking.items?.[0]?.itemName || 'Dịch vụ TravelAI'}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>
                Thời gian: {bookingService.formatDate(booking.startDate)} - {bookingService.formatDate(booking.endDate)}
              </span>
              <span className="font-bold text-gray-900">
                {bookingService.formatVND(booking.totalAmount)}
              </span>
            </div>
          </div>

          {/* Cancellation Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Chính sách hủy đơn:</p>
              <p>
                Sau khi xác nhận hủy, trạng thái đơn sẽ chuyển sang <strong>Đã hủy (CANCELLED)</strong>.
                Nếu đơn đã thanh toán, ban quản trị TravelAI sẽ tiến hành đối soát và hoàn tiền theo quy định trong vòng 3 - 5 ngày làm việc.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Lý do bạn muốn hủy đơn:
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r
                      ? 'border-brand-500 bg-brand-50/50 font-semibold text-brand-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{r}</span>
                  </div>
                  {reason === r && <Check className="w-4 h-4 text-brand-600" />}
                </label>
              ))}
            </div>

            {reason === 'Khác' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Vui lòng chia sẻ thêm lý do hủy của bạn..."
                rows={3}
                className="mt-3 w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Quay lại
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Xác nhận hủy đặt chỗ
          </Button>
        </div>
      </div>
    </div>
  );
};
