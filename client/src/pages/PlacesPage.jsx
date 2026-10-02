import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/ui/Badge';

export const PlacesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-brand-50 text-brand-600 mb-6 shadow-xs">
        <Compass className="w-10 h-10" />
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge variant="brand">WBS 1.4.1 - Sprint 2</Badge>
        <span className="text-xs text-gray-500 font-medium">Khám phá địa điểm</span>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Kho dữ liệu danh lam thắng cảnh Việt Nam
      </h1>

      <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
        Phân hệ tra cứu địa danh du lịch theo vùng miền, tỉnh thành và thông tin chi tiết đang được hoàn thiện trong gói WBS 1.4.1.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/profile">
          <Button variant="primary" size="md">
            Quay lại Hồ sơ cá nhân
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};
