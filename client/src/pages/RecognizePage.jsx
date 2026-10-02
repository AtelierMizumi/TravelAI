import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/ui/Badge';

export const RecognizePage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white mb-6 shadow-md shadow-brand-500/20">
        <Camera className="w-10 h-10" />
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge variant="brand">WBS 1.3.3 - Sprint 2</Badge>
        <span className="text-xs text-gray-500 font-medium">AI Landmark Vision</span>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Nhận diện danh lam thắng cảnh bằng AI
      </h1>

      <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
        Phân hệ tiếp nhận ảnh chụp và hiển thị kết quả phân tích AI kèm gợi ý tour du lịch đang được tích hợp cùng AI Microservice trong gói WBS 1.3.3.
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
