import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Windowed pagination: show at most 5 page numbers centered around currentPage
  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - maxVisible);
    }
    const pages = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
      <div className="text-xs text-gray-500">
        Hiển thị trang <span className="font-semibold text-gray-800">{currentPage + 1}</span> /{' '}
        <span className="font-semibold text-gray-800">{totalPages}</span> (Tổng số{' '}
        <span className="font-semibold text-brand-600">{totalElements}</span> địa danh)
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
