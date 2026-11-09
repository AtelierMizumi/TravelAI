import React, { useState } from 'react';
import { Image, MapPin, Send, Sparkles, X } from 'lucide-react';
import { Button } from '../common/Button';

export const CreatePostBox = ({ currentUser, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleImages = [
    { label: 'Hội An', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Hạ Long', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Tràng An', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Đà Nẵng', url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onPostCreated({
        content: content.trim(),
        imageUrl: imageUrl.trim() || sampleImages[0].url,
        locationTag: locationTag.trim() || 'Việt Nam',
      });
      setContent('');
      setImageUrl('');
      setLocationTag('');
      setShowImageInput(false);
      setShowLocationInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
      {/* Top Author & Input Area */}
      <div className="flex items-start gap-3.5">
        <img
          src={
            currentUser?.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
          }
          alt={currentUser?.fullName || 'User'}
          className="w-11 h-11 rounded-full object-cover border border-gray-100 shadow-xs flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm hoặc cảm nhận chuyến đi của bạn..."
            rows={3}
            className="w-full p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Auxiliary Inputs (Image & Location) */}
      {(showImageInput || imageUrl) && (
        <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2.5 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-brand-600" />
              Đính kèm liên kết ảnh chuyến đi:
            </span>
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setShowImageInput(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Dán đường dẫn ảnh (https://...)"
            className="w-full px-3 py-1.5 bg-white rounded-xl border border-gray-200 outline-none focus:ring-1 focus:ring-brand-500"
          />
          {/* Sample quick photos */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-gray-400 mr-1">Ảnh mẫu:</span>
            {sampleImages.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setImageUrl(s.url)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  imageUrl === s.url
                    ? 'bg-brand-50 text-brand-700 border-brand-300 font-bold'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(showLocationInput || locationTag) && (
        <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Gắn thẻ địa danh / Điểm đến:
            </span>
            <button
              type="button"
              onClick={() => {
                setLocationTag('');
                setShowLocationInput(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={locationTag}
            onChange={(e) => setLocationTag(e.target.value)}
            placeholder="VD: Vịnh Hạ Long, Sa Pa, Phố Cổ Hội An..."
            className="w-full px-3 py-1.5 bg-white rounded-xl border border-gray-200 outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showImageInput || imageUrl
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <Image className="w-4 h-4 text-brand-600" />
            <span>Thêm ảnh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLocationInput(!showLocationInput)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showLocationInput || locationTag
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Gắn địa danh</span>
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim()}
          isLoading={isSubmitting}
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Đăng bài
        </Button>
      </div>
    </div>
  );
};

export default CreatePostBox;
