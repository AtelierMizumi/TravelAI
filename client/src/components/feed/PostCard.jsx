import React, { useState } from 'react';
import {
  MessageCircle,
  Share2,
  MapPin,
  Check,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { feedService } from '../../services/feedService';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';

export const PostCard = ({
  post,
  currentUser,
  onLikeToggle,
  onCommentAdded,
  onFollowToggle,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(
    feedService.isFollowing(post.author?.username)
  );

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollow = () => {
    const nextStatus = feedService.toggleFollow(post.author?.username);
    setIsFollowing(nextStatus);
    if (onFollowToggle) {
      onFollowToggle(post.author?.username, nextStatus);
    }
  };

  const isOwnPost = Boolean(
    currentUser?.username &&
      post.author?.username?.toLowerCase() === currentUser.username.toLowerCase()
  );

  return (
    <div className="bg-white rounded-3xl shadow-xs hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300">
      {/* Post Header */}
      <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={
              post.author?.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
            }
            alt={post.author?.fullName || 'Tác giả'}
            className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-xs flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                {post.author?.fullName || 'Du Khách'}
              </h4>
              {isOwnPost && (
                <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold border border-brand-200">
                  Bạn
                </span>
              )}
              {post.status === 'PENDING' && (
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                  Đang chờ duyệt
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{feedService.formatRelativeTime(post.createdAt)}</span>
              {post.locationTag && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-brand-600 font-medium">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {post.locationTag}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Follow Button */}
        {!isOwnPost && (
          <button
            type="button"
            onClick={handleFollow}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Đang theo dõi</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Theo dõi</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Text */}
      <div className="px-5 sm:px-6 pb-4">
        <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      </div>

      {/* Post Image Banner */}
      {post.imageUrl && (
        <div className="max-h-[460px] overflow-hidden bg-gray-100 group relative">
          <img
            src={post.imageUrl}
            alt={post.locationTag || 'Ảnh chuyến đi'}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-t border-gray-100 text-xs sm:text-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like */}
          <LikeButton
            initialLikes={post.likesCount || 0}
            initialIsLiked={post.isLiked || false}
            onToggle={() => onLikeToggle(post.id, currentUser?.username)}
          />

          {/* Comment Toggle */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
              showComments
                ? 'text-brand-600 bg-brand-50'
                : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{(post.comments || []).length}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-semibold"
          title="Sao chép liên kết chia sẻ"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600 text-xs">Đã copy link!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>{post.sharesCount || 0}</span>
            </>
          )}
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="px-5 sm:px-6 pb-6">
          <CommentSection
            comments={post.comments || []}
            currentUser={currentUser}
            onAddComment={(text) => onCommentAdded(post.id, text)}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
