import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  FileCheck2,
  Settings,
  Sparkles,
  ArrowRight,
  Receipt,
  Luggage,
  Building2,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { AdminStatCard } from '../components/admin/AdminStatCard';
import { RevenueAreaChart } from '../components/admin/RevenueAreaChart';
import { Skeleton } from '../components/ui/Skeleton';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, chartRes, destRes, actRes] = await Promise.all([
          adminService.getAuditStats(),
          adminService.getRevenueChartData(),
          adminService.getPopularDestinations(),
          adminService.getRecentActivities(),
        ]);
        setStats(statsRes);
        setChartData(chartRes);
        setDestinations(destRes);
        setActivities(actRes);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'paid':
      case 'completed':
        return {
          label: s === 'completed' ? 'Hoàn thành' : 'Đã thanh toán',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'pending':
        return {
          label: 'Chờ thanh toán',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>Hệ Thống Quản Trị Vận Hành (Admin Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Bảng Điều Khiển Tổng Quan
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Theo dõi hiệu quả kinh doanh, lượt đặt chỗ và tương tác cộng đồng theo thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 shadow-xs">
              Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* 4 Stats Cards */}
        {loading || !stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AdminStatCard
              title="Tổng người dùng"
              value={stats.totalUsers}
              icon={Users}
              change={12.4}
              subtitle="tăng so với tháng trước"
            />
            <AdminStatCard
              title="Tổng lượt đặt chỗ"
              value={stats.totalBookings}
              icon={CalendarDays}
              change={8.2}
              subtitle="tăng so với tháng trước"
            />
            <AdminStatCard
              title="Doanh thu hệ thống"
              value={stats.totalRevenue}
              icon={DollarSign}
              change={15.8}
              isRevenue={true}
              subtitle="tăng so với tháng trước"
            />
            <AdminStatCard
              title="Tỷ lệ tăng trưởng"
              value={`${stats.growthRate}%`}
              icon={TrendingUp}
              change={3.1}
              subtitle="ổn định vượt mục tiêu"
            />
          </div>
        )}

        {/* Charts & Destinations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  Biểu Đồ Doanh Thu Theo Tháng
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Phân tích chu kỳ dòng tiền tour du lịch và khách sạn
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-brand-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                  Doanh thu (VND)
                </span>
              </div>
            </div>

            {loading ? (
              <Skeleton className="h-60 w-full rounded-2xl" />
            ) : (
              <RevenueAreaChart data={chartData} />
            )}

            {/* Sub-revenue breakdown */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
                <div className="p-3 bg-gray-50/80 rounded-2xl">
                  <span className="text-gray-400 block mb-1">Doanh thu Tour:</span>
                  <span className="font-extrabold text-brand-600 text-sm">
                    {adminService.formatVND(stats.tourRevenue)}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-2xl">
                  <span className="text-gray-400 block mb-1">Doanh thu Khách sạn:</span>
                  <span className="font-extrabold text-brand-600 text-sm">
                    {adminService.formatVND(stats.hotelRevenue)}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-gray-400 block mb-1">Tỷ lệ đối soát:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {stats.reconciliationRate}% (Chuẩn)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Popular Destinations */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                Điểm Đến Phổ Biến Nhất
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Xếp hạng theo số lượt đặt tour và phòng
              </p>
            </div>

            <div className="space-y-4">
              {destinations.map((dest, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {dest.name}
                    </span>
                    <span className="font-bold text-brand-600">
                      {dest.count} lượt
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dest.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                Hoạt Động Đặt Chỗ Gần Đây
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Nhật ký giao dịch dịch vụ trên toàn hệ thống
              </p>
            </div>
            <Link
              to="/profile"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Xem chi tiết booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {activities.map((act) => {
              const badge = getStatusBadge(act.status);
              return (
                <div
                  key={act.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">
                        {act.user}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{act.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs pl-12 sm:pl-0">
                    <span className="font-bold text-gray-900">{act.amount}</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.time}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
