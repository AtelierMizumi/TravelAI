import React from 'react';
import DOMPurify from 'dompurify';
import { MapPin, ExternalLink, Sparkles, CheckCircle2, Tag, Compass, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const LandmarkCard = ({ result, matchedLocation }) => {
  if (!result || !result.landmark_name) return null;

  const sanitizedName = DOMPurify.sanitize(result.landmark_name);
  const sanitizedDesc = DOMPurify.sanitize(
    result.description || matchedLocation?.description || 'Địa danh du lịch nổi tiếng tại Việt Nam.'
  );

  const confidencePercent = Math.min(100, Math.max(0, result.confidence * 100)).toFixed(1);

  const getConfidenceColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-sky-600 bg-sky-50 border-sky-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getProgressBarColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  const latitude = result.latitude || matchedLocation?.latitude;
  const longitude = result.longitude || matchedLocation?.longitude;

  const mapUrl =
    latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.landmark_name + ' Việt Nam')}`;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header with Title and Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Kết quả AI nhận diện
            </span>
            <Badge variant="brand">
              {result.detection_type === 'WEB_DETECTION' ? 'Web Fallback' : 'Google Cloud Vision'}
            </Badge>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
            dangerouslySetInnerHTML={{ __html: sanitizedName }}
          />
        </div>

        {/* Confidence Gauge */}
        <div className="sm:text-right">
          <div className="text-xs text-gray-400 font-medium mb-1">Độ chính xác AI</div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-xl font-bold text-sm border ${getConfidenceColor(
              Number(confidencePercent)
            )}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {confidencePercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Độ tin cậy nhận diện</span>
          <span className="font-semibold text-gray-700">{confidencePercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${getProgressBarColor(
              Number(confidencePercent)
            )}`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-600 leading-relaxed">
        <p dangerouslySetInnerHTML={{ __html: sanitizedDesc }} />
      </div>

      {/* Location Metadata Bar (Province, Coordinates & Google Maps Link) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          {matchedLocation?.province && (
            <div className="flex items-center gap-1 font-semibold text-gray-800">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>{matchedLocation.province}</span>
            </div>
          )}

          {latitude && longitude ? (
            <div className="flex items-center gap-1 text-gray-500">
              <span>Tọa độ: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <Info className="w-3.5 h-3.5" />
              <span>Vị trí tự động trích xuất từ Google Knowledge Graph</span>
            </div>
          )}
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          Xem trên Google Maps
        </a>
      </div>

      {/* Keywords / Tags if available */}
      {result.matched_keywords && result.matched_keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-400 font-medium flex items-center mr-1">
            <Tag className="w-3 h-3 mr-1" />
            Từ khóa:
          </span>
          {result.matched_keywords.slice(0, 6).map((kw, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium"
            >
              #{DOMPurify.sanitize(kw)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
