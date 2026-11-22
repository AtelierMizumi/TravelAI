export const uxPlaces = [
  { id: 101, name: 'Điểm thử nghiệm A', description: 'Dữ liệu tổng hợp A', province: 'Hà Nội' },
  { id: 102, name: 'Điểm thử nghiệm B', description: 'Dữ liệu tổng hợp B', province: 'Đà Nẵng' },
];
export const uxResponses = {
  expiredSession: { status: 401, body: { message: 'Synthetic expired session' } },
  conflict: { status: 409, body: { message: 'Synthetic conflict' } },
  roles: ['USER', 'ADMIN'] as const,
};
