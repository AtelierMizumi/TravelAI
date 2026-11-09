import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export const LikeButton = ({
  initialLikes = 0,
  initialIsLiked = false,
  onToggle,
}) => {
  const [liked, setLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likes + 1 : Math.max(0, likes - 1);
    setLiked(nextLiked);
    setLikes(nextCount);

    if (onToggle) {
      try {
        await onToggle();
      } catch {
        // Rollback on failure
        setLiked(liked);
        setLikes(likes);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none ${
        liked
          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
          : 'text-gray-600 hover:text-rose-600 hover:bg-gray-50'
      }`}
      aria-label={liked ? 'Bỏ thích' : 'Thích bài viết'}
    >
      <Heart
        className={`w-5 h-5 transition-transform active:scale-125 ${
          liked ? 'fill-rose-600 text-rose-600' : 'text-gray-500'
        }`}
      />
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;
