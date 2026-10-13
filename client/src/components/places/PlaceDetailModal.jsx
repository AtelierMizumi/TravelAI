import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin, Star, Compass, ExternalLink, Calendar, Heart, Share2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../common/Button';

export const PlaceDetailModal = ({ place, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!place) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80';

  const mapUrl =
    place.latitude && place.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.province)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-100">
          <img
            src={place.imageUrl || fallbackImage}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors focus:outline-none"
            aria-label="Đóng chi tiết"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and metadata on image overlay */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="brand" className="backdrop-blur-md bg-white/90 text-brand-800 shadow-xs">
                {place.category || 'Địa danh'}
              </Badge>
              <div className="flex items-center text-xs text-white/90 font-medium bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 mr-1 text-sky-400" />
                {place.province}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{place.name}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-5 h-5 fill-amber-400" />
                <span className="ml-1.5 text-base font-bold text-gray-900">
                  {place.rating ? place.rating.toFixed(1) : '5.0'}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                ({place.reviewCount ? place.reviewCount.toLocaleString() : 0} đánh giá)
              </span>
            </div>

            {/* GPS Link */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Mở trên Google Maps
            </a>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
              Giới thiệu & Lịch sử
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {place.description}
            </p>
          </div>

          {/* Coordinates Info if available */}
          {place.latitude && place.longitude && (
            <div className="text-xs text-gray-400 flex items-center gap-4">
              <span>Tọa độ GPS: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/recognize"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:opacity-95 transition-all"
            >
              <Compass className="w-4 h-4 mr-2" />
              Thử nghiệm AI Scanner cho địa danh này
            </Link>

            <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
