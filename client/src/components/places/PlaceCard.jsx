import React, { useState } from 'react';
import { MapPin, Star, Heart, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const PlaceCard = ({ place, onSelect }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80';

  const getCategoryVariant = (cat) => {
    switch (cat) {
      case 'Danh lam thắng cảnh':
        return 'brand';
      case 'Di tích lịch sử':
        return 'warning';
      case 'Biển đảo':
        return 'brand';
      case 'Sinh thái':
        return 'success';
      case 'Văn hóa':
        return 'gray';
      default:
        return 'brand';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-gray-100">
        <img
          src={place.imageUrl || fallbackImage}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Category Badge Top Left */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={getCategoryVariant(place.category)}
            className="backdrop-blur-md bg-white/90 shadow-xs"
          >
            {place.category || 'Địa danh'}
          </Badge>
        </div>

        {/* Favorite Button Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/80 hover:bg-white text-gray-700 hover:text-red-500 transition-all shadow-xs focus:outline-none"
          title={isFavorite ? 'Bỏ lưu' : 'Lưu địa danh'}
          aria-label="Yêu thích"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Province Bottom Left */}
        <div className="absolute bottom-3 left-3 flex items-center text-white text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1 text-sky-400" />
          <span>{place.province}</span>
        </div>

        {/* Rating Bottom Right */}
        <div className="absolute bottom-3 right-3 flex items-center bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-xs font-semibold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
          <span>{place.rating ? place.rating.toFixed(1) : '5.0'}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2">
            {place.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {place.description}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {place.reviewCount ? `${place.reviewCount.toLocaleString()} đánh giá` : 'Đang cập nhật'}
          </span>
          <button
            type="button"
            onClick={() => onSelect(place)}
            className="inline-flex items-center text-xs font-semibold text-brand-600 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all focus:outline-none"
          >
            Chi tiết địa danh
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
