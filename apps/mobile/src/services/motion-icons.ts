/** Original 24×24 outline paths for TravelAI; no remote icon/font request. */
export const motionIcons = {
  camera: ["M4 6h4l2-3h4l2 3h4v15H4Z M16 13a4 4 0 1 0-8 0a4 4 0 1 0 8 0", "M3 8V3h5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M16 12a4 4 0 1 0-8 0a4 4 0 1 0 8 0"],
  compass: ["M22 12a10 10 0 1 0-20 0a10 10 0 1 0 20 0 M16 8l-3 5-5 3 3-5Z", "M3 10l18-7-7 18-3-8Z M11 13l10-10"],
  bed: ["M3 18V7 M21 18V7 M3 14h18 M5 14V9h14v5 M7 9V7h4v2 M13 9V7h4v2", "M4 21V10l8-7 8 7v11H4Z M9 21v-8h6v8"],
  people: ["M16 7a4 4 0 1 0-8 0a4 4 0 1 0 8 0 M4 21v-3a6 6 0 0 1 12 0v3 M18 4a4 4 0 0 1 0 8 M19 15a5 5 0 0 1 3 4v2", "M20 4a5 5 0 0 0-8 2 5 5 0 0 0-8-2C-2 9 6 17 12 21 18 17 26 9 20 4Z"],
  support: ["M3 13V11a9 9 0 0 1 18 0v2 M3 12h4v8H3Z M17 12h4v8h-4Z M17 20l-5 2", "M5 5l14 14 M19 5L5 19"],
  sparkles: ["M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z", "M4 4h16v13H9l-5 4Z M8 9h8 M8 13h5"],
} as const;
export type MotionIconName = keyof typeof motionIcons;
