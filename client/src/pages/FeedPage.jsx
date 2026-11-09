import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Flame,
  User,
  Compass,
  MessageSquare,
  Luggage,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { feedService } from '../services/feedService';
import { CreatePostBox } from '../components/feed/CreatePostBox';
import { PostCard } from '../components/feed/PostCard';
import { TrendingDestinations } from '../components/feed/TrendingDestinations';
import { Skeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/common/Toast';

export const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await feedService.getFeedPosts({
        filter,
        currentUsername: user?.username || 'traveler',
      });
      setPosts(res);
    } catch {
      setToast({
        type: 'error',
        title: 'Lỗi tải bảng tin',
        message: 'Không thể đồng bộ các bài viết du lịch mới nhất.',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, user?.username]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = async (postData) => {
    try {
      await feedService.createPost({
        ...postData,
        currentUser: user,
      });
      setToast({
        type: 'success',
        title: 'Đăng bài thành công!',
        message: 'Trải nghiệm du lịch của bạn đã được chia sẻ lên bảng tin cộng đồng.',
      });
      fetchPosts();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Không thể đăng bài',
        message: err.message || 'Đã có lỗi xảy ra khi tạo bài viết.',
      });
    }
  };

  const handleLikeToggle = async (postId, username) => {
    await feedService.toggleLike(postId, username || user?.username || 'traveler');
  };

  const handleCommentAdded = async (postId, text) => {
    await feedService.addComment(postId, {
      text,
      currentUser: user,
    });
    fetchPosts();
  };

  const filterTabs = [
    { id: 'ALL', label: 'Bảng tin mới nhất', icon: Compass },
    { id: 'POPULAR', label: 'Phổ biến nhất', icon: Flame },
    { id: 'MINE', label: 'Bài viết của tôi', icon: User },
  ];

  const myPostsCount = posts.filter(
    (p) =>
      p.isOwnPost ||
      (user?.username &&
        p.author?.username?.toLowerCase() === user.username.toLowerCase())
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast notification */}
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Cộng Đồng Du Lịch Thông Minh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Bảng Tin Trải Nghiệm Du Lịch
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
            Khám phá những khoảnh khắc tuyệt đẹp và cẩm nang du ngoạn được chia sẻ bởi cộng đồng lữ hành trên khắp Việt Nam.
          </p>
        </div>

        {/* Main Grid: Feed Stream (Left) + Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">
          {/* Left Column: Feed Stream */}
          <div className="space-y-6">
            {/* Create Post Card */}
            <CreatePostBox
              currentUser={user}
              onPostCreated={handlePostCreated}
            />

            {/* Filter Pills */}
            <div className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all focus:outline-none ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                  <Luggage className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Chưa có bài viết nào trong mục này
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Hãy là người đầu tiên chia sẻ cảm xúc hoặc hình ảnh chuyến đi thú vị của bạn cùng cộng đồng TravelAI!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onLikeToggle={handleLikeToggle}
                    onCommentAdded={handleCommentAdded}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Profile Summary & Trending */}
          <div className="hidden lg:block">
            <TrendingDestinations
              currentUser={user}
              postsCount={myPostsCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
