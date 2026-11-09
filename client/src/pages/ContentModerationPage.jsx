import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Check,
  X,
  Search,
  Filter,
  AlertCircle,
  Clock,
  ShieldAlert,
  User,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moderationService } from '../services/moderationService';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { Skeleton } from '../components/ui/Skeleton';

export const ContentModerationPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Reject Modal state
  const [rejectingPost, setRejectingPost] = useState(null);
  const [rejectReason, setRejectReason] = useState('Nội dung không phù hợp tiêu chuẩn cộng đồng');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await moderationService.getPosts({
        status: statusFilter,
        search,
      });
      setPosts(res);
    } catch {
      setToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách bài viết kiểm duyệt.',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApprove = async (id) => {
    try {
      await moderationService.approvePost(id);
      setToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã phê duyệt bài viết. Bài viết sẽ xuất hiện công khai trên bảng tin.',
      });
      fetchPosts();
    } catch {
      setToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể phê duyệt bài viết.',
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPost) return;
    try {
      setIsSubmitting(true);
      await moderationService.rejectPost(rejectingPost.id, rejectReason);
      setRejectingPost(null);
      setToast({
        type: 'success',
        title: 'Đã từ chối bài viết',
        message: 'Bài viết đã bị gỡ và chuyển sang trạng thái Từ chối.',
      });
      fetchPosts();
    } catch {
      setToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể từ chối bài viết.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadges = {
    pending: {
      label: 'Chờ duyệt',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    approved: {
      label: 'Đã duyệt',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    rejected: {
      label: 'Từ chối',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  if (!loading && user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Truy Cập Bị Từ Chối (403)</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Bạn cần tài khoản có phân quyền Quản trị viên (ROLE_ADMIN) để thực hiện kiểm duyệt nội dung.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
            >
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast */}
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-2">
              <FileCheck2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Kiểm Duyệt Nội Dung & An Toàn Cộng Đồng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Quản Lý Kiểm Duyệt Bài Viết
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Kiểm tra và phê duyệt các bài chia sẻ kinh nghiệm du lịch trước khi hiển thị công khai.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'Tất cả bài viết' },
              { id: 'pending', label: 'Chờ kiểm duyệt' },
              { id: 'approved', label: 'Đã phê duyệt' },
              { id: 'rejected', label: 'Đã từ chối' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề, tác giả..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              Không tìm thấy bài viết nào trong danh mục này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Bài viết & Nội dung</th>
                    <th className="px-6 py-4">Tác giả</th>
                    <th className="px-6 py-4">Chuyên mục</th>
                    <th className="px-6 py-4">Ngày gửi</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => {
                    const badge = statusBadges[post.status] || statusBadges.pending;
                    return (
                      <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 max-w-sm">
                          <p className="font-bold text-gray-900 leading-snug">
                            {post.title}
                          </p>
                          <p className="text-gray-400 mt-1 line-clamp-1">
                            {post.content}
                          </p>
                          {post.rejectReason && (
                            <p className="text-rose-600 text-[11px] mt-1 italic font-medium">
                              Lý do từ chối: {post.rejectReason}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {post.author}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {post.date}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {post.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(post.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                title="Phê duyệt bài viết"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            )}
                            {post.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => setRejectingPost(post)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                title="Từ chối bài viết"
                              >
                                <X className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject Dialog Modal */}
        {rejectingPost && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Từ chối phê duyệt bài viết
                </h3>
                <button
                  onClick={() => setRejectingPost(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-gray-600 space-y-3">
                <p>
                  Bài viết: <strong>{rejectingPost.title}</strong> của{' '}
                  <span className="text-gray-900 font-semibold">{rejectingPost.author}</span>
                </p>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    Lý do từ chối (hiển thị cho tác giả):
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Nội dung không phù hợp tiêu chuẩn cộng đồng">
                      Nội dung không phù hợp tiêu chuẩn cộng đồng
                    </option>
                    <option value="Nội dung spam quảng cáo thương mại">
                      Nội dung spam quảng cáo thương mại
                    </option>
                    <option value="Hình ảnh chất lượng kém hoặc không liên quan">
                      Hình ảnh chất lượng kém hoặc không liên quan
                    </option>
                    <option value="Thông tin địa danh sai lệch">
                      Thông tin địa danh sai lệch
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingPost(null)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmReject}
                  isLoading={isSubmitting}
                >
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentModerationPage;
