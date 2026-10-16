import React from 'react';
import { Compass, Hotel, Star, ArrowRight, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { Button } from '../common/Button';

export const SuggestedServices = ({ landmarkName, location }) => {
  const defaultTours = [
    {
      id: 101,
      title: `Tour Trải Nghiệm Khám Phá ${landmarkName || 'Địa Danh'} 1 Ngày`,
      duration: '1 ngày',
      price: '850.000 đ',
      rating: 4.9,
      reviews: 128,
      imageUrl:
        location?.imageUrl ||
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
      highlights: ['Hướng dẫn viên bản địa', 'Bao gồm xe đưa đón', 'Vé tham quan trọn gói'],
    },
    {
      id: 102,
      title: `Tour VIP Nghỉ Dưỡng & Ẩm Thực Cao Cấp tại ${location?.province || landmarkName}`,
      duration: '2 ngày 1 đêm',
      price: '2.450.000 đ',
      rating: 4.8,
      reviews: 95,
      imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80',
      highlights: ['Khách sạn 4-5 sao', 'Thực đơn đặc sản', 'Bảo hiểm du lịch trọn gói'],
    },
  ];

  const defaultHotels = [
    {
      id: 201,
      name: `Khách sạn Nghỉ Dưỡng Grand ${location?.province || 'Bản Địa'}`,
      stars: 5,
      pricePerNight: '1.200.000 đ',
      rating: 4.9,
      address: `Trung tâm ${location?.province || 'thành phố'}, cách điểm đến 2.5 km`,
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 202,
      name: `Homestay View Đẹp & Yên Tĩnh ${landmarkName || ''}`,
      stars: 4,
      pricePerNight: '550.000 đ',
      rating: 4.7,
      address: `Gần danh thắng ${landmarkName || ''}`,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-8 pt-4">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Ticket className="w-4 h-4" />
          </span>
          <h3 className="text-xl font-bold text-gray-900">
            Gợi ý dịch vụ du lịch thông minh
          </h3>
        </div>
        <p className="text-sm text-gray-500">
          Các tour trải nghiệm và nơi lưu trú được đề xuất tối ưu xung quanh{' '}
          <strong className="text-gray-700">{landmarkName}</strong>.
        </p>
      </div>

      {/* Suggested Tours */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
          <Compass className="w-4 h-4 mr-2 text-brand-600" />
          Tour du lịch nổi bật
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {defaultTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-gray-100">
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tour.duration}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      {tour.rating} ({tour.reviews})
                    </div>
                    <span className="text-base font-extrabold text-brand-600">
                      {tour.price}
                    </span>
                  </div>

                  <h5 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">
                    {tour.title}
                  </h5>

                  <ul className="text-xs text-gray-500 space-y-1">
                    {tour.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="primary" size="sm" className="w-full">
                  Xem chi tiết tour
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Hotels */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
          <Hotel className="w-4 h-4 mr-2 text-sky-600" />
          Khách sạn & Lưu trú lân cận
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {defaultHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-gray-100">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-0.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-400 text-xs font-medium">
                  {[...Array(hotel.stars)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Giá phòng / đêm</span>
                    <span className="text-base font-extrabold text-sky-600">
                      {hotel.pricePerNight}
                    </span>
                  </div>

                  <h5 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                    {hotel.name}
                  </h5>

                  <p className="text-xs text-gray-500 line-clamp-1">
                    {hotel.address}
                  </p>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  Kiểm tra phòng trống
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
