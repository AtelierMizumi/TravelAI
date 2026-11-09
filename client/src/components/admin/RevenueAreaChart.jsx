import React, { useState } from 'react';
import { adminService } from '../../services/adminService';

export const RevenueAreaChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 650;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 35, left: 20 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.revenue)) * 1.15;
  const minVal = 0;

  const getX = (index) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (val) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  // Construct SVG Path
  const points = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = padding.top + innerHeight * pct;
          return (
            <line
              key={idx}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#adminRevenueGradient)" />

        {/* Curve Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#0284c7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & X labels */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.revenue);
          const isHovered = hoveredPoint?.index === i;

          return (
            <g key={i}>
              {/* Point circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                className="fill-white stroke-brand-600 transition-all cursor-pointer"
                strokeWidth={isHovered ? 3 : 2}
                onMouseEnter={() => setHoveredPoint({ ...d, cx, cy, index: i })}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* X label */}
              <text
                x={cx}
                y={height - 12}
                textAnchor="middle"
                className="text-[11px] fill-gray-400 font-semibold"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-semibold shadow-lg z-10 transition-all"
          style={{
            left: `${(hoveredPoint.cx / width) * 100}%`,
            top: `${(hoveredPoint.cy / height) * 100}%`,
          }}
        >
          <div className="text-[10px] text-gray-400 font-medium">
            Tháng {hoveredPoint.month}
          </div>
          <div className="font-bold text-sky-300">
            {adminService.formatVND(hoveredPoint.revenue)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAreaChart;
