import React, { useState } from 'react';
import { CreditCard, QrCode, Wallet, X, ShieldCheck, Check } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Button } from '../common/Button';

export const BookingPayModal = ({
  booking,
  isOpen,
  onClose,
  onConfirmPay,
  isLoading,
}) => {
  const [method, setMethod] = useState('VNPAY_QR');

  if (!isOpen || !booking) return null;

  const paymentMethods = [
    {
      id: 'VNPAY_QR',
      name: 'Cổng VNPAY / Quét mã QR',
      desc: 'Hỗ trợ quét qua hơn 40 ứng dụng ngân hàng và ví điện tử',
      icon: QrCode,
    },
    {
      id: 'VISA_MASTERCARD',
      name: 'Thẻ Quốc Tế (Visa / Mastercard / JCB)',
      desc: 'Bảo mật 3D-Secure tiêu chuẩn quốc tế',
      icon: CreditCard,
    },
    {
      id: 'MOMO',
      name: 'Ví Điện Tử MoMo',
      desc: 'Thanh toán tức thì bằng ứng dụng MoMo',
      icon: Wallet,
    },
  ];

  const handlePay = () => {
    onConfirmPay(booking.id, method);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-booking-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-brand-50/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-100 text-brand-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 id="pay-booking-title" className="text-lg font-bold text-gray-900">
                Thanh toán đơn #{booking.bookingCode}
              </h3>
              <p className="text-xs text-gray-500">Cổng thanh toán an toàn TravelAI</p>
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
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Số tiền cần thanh toán:</p>
              <p className="text-2xl font-black text-brand-600">
                {bookingService.formatVND(booking.totalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bảo mật SSL 256-bit</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Chọn phương thức thanh toán:
            </label>
            <div className="space-y-2.5">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = method === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-600 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {pm.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePay}
            isLoading={isLoading}
          >
            Xác nhận thanh toán ngay
          </Button>
        </div>
      </div>
    </div>
  );
};
