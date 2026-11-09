import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminStatCard = ({
  title,
  value,
  icon: Icon,
  change,
  isRevenue = false,
  subtitle,
}) => {
  const isPositive = change >= 0;

  const displayValue = isRevenue
    ? adminService.formatVND(value)
    : typeof value === 'number'
    ? value.toLocaleString('vi-VN')
    : value;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
          {displayValue}
        </h3>

        <div className="flex items-center gap-2 pt-1 text-xs">
          {change != null && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              {Math.abs(change)}%
            </span>
          )}
          <span className="text-gray-400 font-medium">
            {subtitle || 'so với tháng trước'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;
