import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Sparkles, UserCheck } from 'lucide-react';

export const TrendingDestinations = ({ currentUser, postsCount = 0 }) => {
  const trendingList = [
    { name: 'Vịnh Hạ Long', count: '1.420 bài viết', tag: 'Quảng Ninh' },
    { name: 'Phố Cổ Hội An', count: '1.250 bài viết', tag: 'Quảng Nam' },
    { name: 'Đảo Ngọc Phú Quốc', count: '980 bài viết', tag: 'Kiên Giang' },
    { name: 'Bà Nà Hills & Cầu Vàng', count: '890 bài viết', tag: 'Đà Nẵng' },
    { name: 'Tràng An Cố Đô', count: '740 bài viết', tag: 'Ninh Bình' },
    { name: 'Sa Pa Thị Trấn Sương Mờ', count: '620 bài viết', tag: 'Lào Cai' },
  ];

  return (
    <div className="space-y-6 sticky top-24">
      {/* User Quick Profile Card */}
      {currentUser && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-center space-y-4">
          <div className="relative inline-block mx-auto">
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
              }
              alt={currentUser.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-brand-100 shadow-sm"
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {currentUser.fullName || 'Nguyễn Du Khách'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              @{currentUser.username || 'traveler'} • Đam mê du lịch ✈️
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
            <div className="p-2 rounded-xl bg-gray-50/80">
              <p className="text-base font-extrabold text-brand-600">
                {postsCount}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Bài viết
              </p>
            </div>
            <div className="p-2 rounded-xl bg-gray-50/80">
              <p className="text-base font-extrabold text-gray-900">1.2K</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Theo dõi
              </p>
            </div>
            <div className="p-2 rounded-xl bg-gray-50/80">
              <p className="text-base font-extrabold text-gray-900">834</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Đang follow
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="block w-full py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            Xem trang cá nhân
          </Link>
        </div>
      )}

      {/* Trending Locations Widget */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span>Địa Điểm Xu Hướng</span>
        </div>

        <div className="space-y-3">
          {trendingList.map((item, idx) => (
            <Link
              key={idx}
              to={`/places?keyword=${encodeURIComponent(item.name)}`}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-brand-600 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.tag}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600">
                {item.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingDestinations;
