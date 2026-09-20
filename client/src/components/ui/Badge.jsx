import React from 'react';

export const Badge = ({
  children,
  variant = 'brand',
  className = '',
}) => {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.brand} ${className}`}
    >
      {children}
    </span>
  );
};
