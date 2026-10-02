import React from 'react';
import { Compass, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900">TravelAI Platform</span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              Nền tảng du lịch thông minh thế hệ mới kết hợp thị giác máy tính và AI nhận diện danh lam thắng cảnh Việt Nam.
            </p>
            <div className="flex items-center text-xs text-gray-400 space-x-4">
              <span className="inline-flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" /> Chuẩn bảo mật doanh nghiệp
              </span>
              <span className="inline-flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-brand-500" /> Đà Nẵng, Việt Nam
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Khám phá
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/places" className="hover:text-brand-600 transition-colors">
                  Danh mục địa danh
                </Link>
              </li>
              <li>
                <Link to="/recognize" className="hover:text-brand-600 transition-colors">
                  AI Landmark Scanner
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-brand-600 transition-colors">
                  Hồ sơ du khách
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Liên hệ kỹ thuật
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Hỗ trợ tích hợp hệ sinh thái API & AI Vision Microservice.
            </p>
            <div className="flex items-center text-xs text-gray-600">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              <span>contact@travelai.vn</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2026 TravelAI Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Thiết kế & phát triển bởi TravelAI Engineering Team
          </p>
        </div>
      </div>
    </footer>
  );
};
