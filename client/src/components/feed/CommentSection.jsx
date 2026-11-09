import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { feedService } from '../../services/feedService';

export const CommentSection = ({ comments = [], onAddComment, currentUser }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="pt-4 border-t border-gray-100 space-y-4">
      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <img
          src={
            currentUser?.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
          }
          alt={currentUser?.fullName || 'User'}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="relative flex-1">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết bình luận trải nghiệm của bạn..."
            className="w-full pl-4 pr-12 py-2.5 bg-gray-50/80 rounded-xl border border-gray-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-brand-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors shadow-xs"
            aria-label="Gửi bình luận"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-2.5 pt-1 max-h-64 overflow-y-auto no-scrollbar">
          {comments.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-2.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100"
            >
              <img
                src={
                  c.authorAvatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                }
                alt={c.authorName || 'Bình luận viên'}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-bold text-gray-900">
                    {c.authorName || 'Du khách'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {feedService.formatRelativeTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed font-normal">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
