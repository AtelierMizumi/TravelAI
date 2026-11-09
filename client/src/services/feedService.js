const STORAGE_KEY = 'travelai_social_posts';
const FOLLOWING_KEY = 'travelai_following_users';

const DEFAULT_POSTS = [
  {
    id: 1,
    author: {
      id: 101,
      username: 'minh_traveler',
      fullName: 'Trần Minh Hoàng',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    locationTag: 'Phố Cổ Hội An, Quảng Nam',
    content: 'Hoàng hôn ở Phố Cổ Hội An thật sự quá đỗi bình yên 🌅 Những ánh đèn lồng rực rỡ phản chiếu xuống dòng sông Hoài thơ mộng khiến ai đến đây cũng muốn quay trở lại nhiều lần!',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    baseLikesCount: 542,
    likedByUsernames: [],
    sharesCount: 38,
    status: 'APPROVED',
    comments: [
      {
        id: 1001,
        authorName: 'Lê Thảo',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        text: 'Góc chụp này ở gần Chùa Cầu đúng không bạn? Đẹp ngỡ ngàng luôn!',
        createdAt: '2026-11-08T16:30:00',
      },
      {
        id: 1002,
        authorName: 'Nguyễn Dũng',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        text: 'Nên đi thuyền thả hoa đăng lúc 18h tối là đẹp nhất nhé mọi người.',
        createdAt: '2026-11-08T17:15:00',
      },
    ],
    createdAt: '2026-11-08T15:00:00',
  },
  {
    id: 2,
    author: {
      id: 102,
      username: 'khanh_sky',
      fullName: 'Nguyễn Mai Khánh',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    },
    locationTag: 'Bà Nà Hills & Cầu Vàng, Đà Nẵng',
    content: 'Lần đầu trải nghiệm tuyến cáp treo Bà Nà Hills săn mây vào sáng sớm 😍 Cầu Vàng được đôi bàn tay rêu phong nâng đỡ giữa ngút ngàn rừng núi quả xứng danh kỳ quan du lịch!',
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
    baseLikesCount: 820,
    likedByUsernames: ['khanh_sky'],
    sharesCount: 65,
    status: 'APPROVED',
    comments: [
      {
        id: 1003,
        authorName: 'Phạm Tuấn',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        text: 'Trời quang mây đẹp quá bạn ơi, chuyến đi này săn ảnh chuẩn 10 điểm!',
        createdAt: '2026-11-08T19:00:00',
      },
    ],
    createdAt: '2026-11-08T18:20:00',
  },
  {
    id: 3,
    author: {
      id: 103,
      username: 'hai_wanderlust',
      fullName: 'Vũ Thanh Hải',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    },
    locationTag: 'Vịnh Hạ Long, Quảng Ninh',
    content: 'Du ngoạn du thuyền 5 sao trên Vịnh Hạ Long ngắm nhìn hàng nghìn hòn đảo đá vôi kỳ vĩ. Chèo kayak vào hang Luồn và ngắm hoàng hôn buông xuống mặt nước ngọc bích cực kỳ chill!',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    baseLikesCount: 1240,
    likedByUsernames: [],
    sharesCount: 94,
    status: 'APPROVED',
    comments: [
      {
        id: 1004,
        authorName: 'Hà Trang',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        text: 'Du thuyền nào vậy bạn ơi, cho mình xin thông tin dịch vụ với nhé!',
        createdAt: '2026-11-07T10:10:00',
      },
    ],
    createdAt: '2026-11-07T08:45:00',
  },
  {
    id: 4,
    author: {
      id: 104,
      username: 'an_explorer',
      fullName: 'Đỗ Thúy An',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    locationTag: 'Quần Thể Danh Thắng Tràng An, Ninh Bình',
    content: 'Tràng An mùa này nước trong vắt nhìn thấy cả rong rêu đáy sông. Ngồi thuyền lướt qua những thung lũng ngập nước và hang động xuyên thủy cảm giác như lạc vào cõi bồng lai tiên cảnh 🌿✨',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    baseLikesCount: 673,
    likedByUsernames: [],
    sharesCount: 42,
    status: 'APPROVED',
    comments: [],
    createdAt: '2026-11-06T14:15:00',
  },
];

const getStoredPosts = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  return DEFAULT_POSTS;
};

const saveStoredPosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

const getStoredFollowing = () => {
  const stored = localStorage.getItem(FOLLOWING_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return ['minh_traveler'];
};

const saveStoredFollowing = (following) => {
  localStorage.setItem(FOLLOWING_KEY, JSON.stringify(following));
};

export const feedService = {
  /**
   * Lấy danh sách bài viết theo bộ lọc và danh tính người xem
   */
  async getFeedPosts({ filter = 'ALL', currentUsername = 'traveler' } = {}) {
    const list = getStoredPosts();
    const normalizedUser = (currentUsername || '').toLowerCase();

    // Enrich each post dynamically according to the current viewing user
    const enriched = list.map((p) => {
      const likedBy = Array.isArray(p.likedByUsernames) ? p.likedByUsernames : [];
      const isLiked = normalizedUser
        ? likedBy.some((u) => (u || '').toLowerCase() === normalizedUser)
        : false;
      const baseCount = p.baseLikesCount ?? (p.likesCount ?? 0);
      const likesCount = baseCount + likedBy.length;
      const postAuthor = (p.author?.username || '').toLowerCase();
      const isOwn = Boolean(normalizedUser && postAuthor === normalizedUser);

      return {
        ...p,
        isLiked,
        likesCount,
        isOwnPost: isOwn,
      };
    });

    let result = [];
    if (filter === 'MINE') {
      // Strictly user's own posts (no leakage from other accounts)
      result = enriched.filter((p) => p.isOwnPost);
    } else {
      // Only APPROVED posts appear on the public community feed,
      // EXCEPT the author can see their own pending posts.
      result = enriched.filter((p) => (p.status === 'APPROVED' || !p.status) || p.isOwnPost);

      if (filter === 'POPULAR') {
        result.sort((a, b) => b.likesCount - a.likesCount);
      } else {
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }

    return result;
  },

  /**
   * Đăng bài viết mới
   */
  async createPost({ content, imageUrl, locationTag, currentUser }) {
    if (!content?.trim()) {
      throw new Error('Nội dung bài viết không được để trống.');
    }

    const posts = getStoredPosts();
    const username = currentUser?.username || 'traveler';
    const newPost = {
      id: Date.now(),
      author: {
        id: currentUser?.id || Date.now(),
        username: username,
        fullName: currentUser?.fullName || 'Nguyễn Văn Du Khách',
        avatarUrl:
          currentUser?.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      locationTag: locationTag?.trim() || 'Việt Nam',
      content: content.trim(),
      imageUrl:
        imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      baseLikesCount: 0,
      likedByUsernames: [],
      sharesCount: 0,
      comments: [],
      status: 'PENDING', // Đưa vào queue duyệt nội dung WBS 1.7.6
      createdAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    saveStoredPosts(posts);

    return {
      ...newPost,
      isLiked: false,
      likesCount: 0,
      isOwnPost: true,
    };
  },

  /**
   * Thả tim hoặc Bỏ thả tim bài viết (Namespaced theo từng tài khoản)
   */
  async toggleLike(postId, currentUsername = 'traveler') {
    const posts = getStoredPosts();
    const idx = posts.findIndex((p) => p.id === Number(postId));
    if (idx === -1) throw new Error('Bài viết không tồn tại.');

    const post = posts[idx];
    const likedBy = Array.isArray(post.likedByUsernames) ? [...post.likedByUsernames] : [];
    const normalizedUser = (currentUsername || 'traveler').toLowerCase();
    const userIdx = likedBy.findIndex((u) => (u || '').toLowerCase() === normalizedUser);

    let newLiked = false;
    if (userIdx > -1) {
      likedBy.splice(userIdx, 1);
      newLiked = false;
    } else {
      likedBy.push(currentUsername || 'traveler');
      newLiked = true;
    }

    const baseCount =
      post.baseLikesCount ??
      (post.likesCount ? Math.max(0, post.likesCount - (post.isLiked ? 1 : 0)) : 0);
    const totalLikes = baseCount + likedBy.length;

    posts[idx] = {
      ...post,
      baseLikesCount: baseCount,
      likedByUsernames: likedBy,
      likesCount: totalLikes,
    };

    saveStoredPosts(posts);
    return { isLiked: newLiked, likesCount: totalLikes };
  },

  /**
   * Thêm bình luận vào bài viết
   */
  async addComment(postId, { text, currentUser }) {
    if (!text?.trim()) {
      throw new Error('Nội dung bình luận không được để trống.');
    }

    const posts = getStoredPosts();
    const idx = posts.findIndex((p) => p.id === Number(postId));
    if (idx === -1) throw new Error('Bài viết không tồn tại.');

    const newComment = {
      id: Date.now(),
      authorName: currentUser?.fullName || 'Du Khách',
      authorAvatar:
        currentUser?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    posts[idx].comments = posts[idx].comments || [];
    posts[idx].comments.push(newComment);

    saveStoredPosts(posts);
    return newComment;
  },

  /**
   * Kiểm tra và Đảo trạng thái theo dõi tác giả
   */
  toggleFollow(username) {
    if (!username) return false;
    let following = getStoredFollowing();
    const isCurrentlyFollowing = following.includes(username);

    if (isCurrentlyFollowing) {
      following = following.filter((u) => u !== username);
    } else {
      following.push(username);
    }

    saveStoredFollowing(following);
    return !isCurrentlyFollowing;
  },

  /**
   * Kiểm tra xem đang theo dõi tác giả hay không
   */
  isFollowing(username) {
    if (!username) return false;
    const following = getStoredFollowing();
    return following.includes(username);
  },

  /**
   * Tính toán thời gian tương đối thân thiện (VD: "2 giờ trước", "Hôm qua")
   */
  formatRelativeTime(dateStr) {
    if (!dateStr) return 'Vừa xong';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

      if (diffSec < 60) return 'Vừa xong';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;

      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  },
};

export default feedService;
