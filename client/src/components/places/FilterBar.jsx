import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, MapPin } from 'lucide-react';
import { locationService } from '../../services/locationService';

export const FilterBar = ({
  selectedCategory,
  onSelectCategory,
  selectedProvince,
  onSelectProvince,
  selectedSort,
  onSelectSort,
  onResetFilters,
  hasActiveFilters,
}) => {
  const categories = locationService.getCategories();
  const provinces = locationService.getProvinces();

  const sortOptions = [
    { label: 'Đánh giá cao nhất', value: 'rating,desc' },
    { label: 'Mới nhất', value: 'id,desc' },
    { label: 'Tên A - Z', value: 'name,asc' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center mr-1">
          <Filter className="w-3.5 h-3.5 mr-1" />
          Danh mục:
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat || (!selectedCategory && cat === 'Tất cả');
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat === 'Tất cả' ? '' : cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all focus:outline-none ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-xs font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Dropdowns Row: Province & Sort & Reset */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Province Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 font-medium">Tỉnh / Thành:</span>
            <select
              value={selectedProvince || 'Tất cả'}
              onChange={(e) => onSelectProvince(e.target.value === 'Tất cả' ? '' : e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 font-medium">Sắp xếp:</span>
            <select
              value={selectedSort}
              onChange={(e) => onSelectSort(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Đặt lại bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};
