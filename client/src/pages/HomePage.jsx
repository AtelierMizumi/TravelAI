import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Camera, ShieldCheck, Sparkles, MapPin, ArrowRight, User } from 'lucide-react';
import { Button } from '../components/common/Button';

export const HomePage = () => {
  return (
    <div className="space-y-16 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>TravelAI Platform v1.0 • Trí tuệ nhân tạo nhận diện danh lam</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Khám phá kỳ quan Việt Nam với{' '}
          <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
            AI Vision thông minh
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Tải ảnh lên để nhận diện địa danh tức thì, tra cứu lịch sử, điểm đánh giá và nhận gợi ý tour, khách sạn phù hợp nhất cho chuyến đi của bạn.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/profile">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
              <User className="w-5 h-5 mr-2" />
              Xem hồ sơ du khách
            </Button>
          </Link>
          <Link to="/places">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Compass className="w-5 h-5 mr-2" />
              Khám phá danh lam thắng cảnh
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Nhận diện địa danh AI
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Phân hệ AI kết hợp tiền xử lý hình ảnh tối ưu và mô hình thị giác máy tính của Google Cloud Vision cho độ chính xác cao.
            </p>
            <div className="text-xs font-semibold text-brand-600 flex items-center">
              Khám phá công nghệ <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Kho dữ liệu du lịch số
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Hệ thống danh mục địa danh toàn diện được phân loại theo vùng miền, tỉnh thành kèm thông tin chi tiết và đánh giá từ cộng đồng.
            </p>
            <div className="text-xs font-semibold text-emerald-600 flex items-center">
              Tra cứu địa điểm <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Quản lý hồ sơ & Bảo mật
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Bảo vệ dữ liệu cá nhân theo tiêu chuẩn doanh nghiệp, quản lý lịch sử tương tác và tùy biến trải nghiệm chuyến đi tiện lợi.
            </p>
            <Link to="/profile" className="text-xs font-semibold text-sky-600 flex items-center">
              Cập nhật thông tin <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
