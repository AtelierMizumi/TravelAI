import type { Page } from '@playwright/test';
export async function syntheticApi(page: Page) {
  await page.route('http://127.0.0.1:18000/**', route => route.fulfill({ json: { found: false }, headers: { 'access-control-allow-origin': '*' } }));
  await page.route('**/api/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    const place = { id: 101, name: 'Điểm thử nghiệm 1', description: 'Dữ liệu tổng hợp', province: 'Hà Nội' };
    const data = pathname.endsWith('/auth/me') ? { id: 7001, name: 'Synthetic traveler', role: 'USER', status: 'ACTIVE' }
      : pathname.endsWith('/places/101') ? place
      : pathname.endsWith('/places/101/services') ? { province: 'Hà Nội', tours: [], hotels: [] }
      : pathname.endsWith('/tours') ? [{ id: 201, name: 'Tour tổng hợp', description: 'Synthetic tour', location: 'Hà Nội', price: 100000, rating: 4, durationDays: 1 }]
      : pathname.endsWith('/hotels') ? [{ id: 301, name: 'Khách sạn tổng hợp', description: 'Synthetic hotel', location: 'Hà Nội', price: 100000, rating: 4, maxGuests: 2, rooms: 1 }]
      : pathname.includes('/posts') ? [{ id: 5001, authorId: 7002, authorName: 'Synthetic author', content: 'Synthetic community post', likesCount: 2, comments: [], shareCount: 0, liked: false, status: 'APPROVED' }]
      : pathname.endsWith('/places')
      ? Array.from({ length: 12 }, (_, i) => ({ id: 101 + i, name: `Điểm thử nghiệm ${i + 1}`, description: 'Dữ liệu tổng hợp', imageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23087fba%22/%3E%3C/svg%3E', province: 'Hà Nội' }))
      : pathname.endsWith('/system-settings') ? { maintenanceMode: false } : [];
    return route.fulfill({ json: data, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Authorization,Content-Type,Idempotency-Key', 'access-control-allow-methods': 'GET,POST,OPTIONS' } });
  });
}
