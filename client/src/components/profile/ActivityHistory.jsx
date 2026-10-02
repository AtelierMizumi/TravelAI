import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Star, Bookmark, Clock, AlertCircle } from 'lucide-react';
import { userService } from '../../services/userService';
import { Skeleton } from '../ui/Skeleton';

export const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const data = await userService.getRecentActivities();
        if (isMounted) {
          setActivities(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err?.detail || 'Không thể tải lịch sử hoạt động lúc này.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadActivities();
    return () => {
      isMounted = false;
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'AI_RECOGNITION':
        return <Camera className="w-4 h-4 text-brand-600" />;
      case 'BOOKING':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'SAVED_PLACE':
        return <Bookmark className="w-4 h-4 text-sky-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'AI_RECOGNITION':
        return 'bg-brand-50 border-brand-100';
      case 'BOOKING':
        return 'bg-emerald-50 border-emerald-100';
      case 'REVIEW':
        return 'bg-amber-50 border-amber-100';
      case 'SAVED_PLACE':
        return 'bg-sky-50 border-sky-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Lịch sử hoạt động & Tương tác</h2>
        <p className="text-sm text-gray-500">
          Xem lại các lượt quét AI, lượt đặt dịch vụ và đánh giá địa danh của bạn.
        </p>
      </div>

      {fetchError ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <p>{fetchError}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Chưa có hoạt động nào được ghi nhận.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activities.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 hover:bg-gray-50/50 px-2 rounded-xl transition-colors"
            >
              <div
                className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${getBadgeStyle(item.type)}`}
              >
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
