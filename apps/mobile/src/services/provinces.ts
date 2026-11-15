// Resolution 202/2025/QH15: current province names and the former provinces merged into them.
// Only exact comma-delimited location components are mapped; unknown addresses remain unclassified.
export const provinces: Record<string, string[]> = {
  "An Giang": ["An Giang", "Kiên Giang"],
  "Bắc Ninh": ["Bắc Ninh", "Bắc Giang"],
  "Cà Mau": ["Cà Mau", "Bạc Liêu"],
  "Cao Bằng": ["Cao Bằng"],
  "Cần Thơ": ["Cần Thơ", "Sóc Trăng", "Hậu Giang"],
  "Đà Nẵng": ["Đà Nẵng", "Quảng Nam"],
  "Đắk Lắk": ["Đắk Lắk", "Phú Yên"],
  "Điện Biên": ["Điện Biên"],
  "Đồng Nai": ["Đồng Nai", "Bình Phước"],
  "Đồng Tháp": ["Đồng Tháp", "Tiền Giang"],
  "Gia Lai": ["Gia Lai", "Bình Định"],
  "Hà Nội": ["Hà Nội"],
  "Hà Tĩnh": ["Hà Tĩnh"],
  "Hải Phòng": ["Hải Phòng", "Hải Dương"],
  "Hồ Chí Minh": [
    "Hồ Chí Minh",
    "TP Hồ Chí Minh",
    "TP. Hồ Chí Minh",
    "TP.HCM",
    "Bà Rịa - Vũng Tàu",
    "Bình Dương",
  ],
  Huế: ["Huế", "Thừa Thiên Huế", "Thừa Thiên - Huế"],
  "Hưng Yên": ["Hưng Yên", "Thái Bình"],
  "Khánh Hòa": ["Khánh Hòa", "Ninh Thuận"],
  "Lai Châu": ["Lai Châu"],
  "Lâm Đồng": ["Lâm Đồng", "Đắk Nông", "Bình Thuận"],
  "Lạng Sơn": ["Lạng Sơn"],
  "Lào Cai": ["Lào Cai", "Yên Bái"],
  "Nghệ An": ["Nghệ An"],
  "Ninh Bình": ["Ninh Bình", "Hà Nam", "Nam Định"],
  "Phú Thọ": ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"],
  "Quảng Ngãi": ["Quảng Ngãi", "Kon Tum"],
  "Quảng Ninh": ["Quảng Ninh"],
  "Quảng Trị": ["Quảng Trị", "Quảng Bình"],
  "Sơn La": ["Sơn La"],
  "Tây Ninh": ["Tây Ninh", "Long An"],
  "Thái Nguyên": ["Thái Nguyên", "Bắc Kạn"],
  "Thanh Hóa": ["Thanh Hóa"],
  "Tuyên Quang": ["Tuyên Quang", "Hà Giang"],
  "Vĩnh Long": ["Vĩnh Long", "Bến Tre", "Trà Vinh"],
};
const normalize = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("vi")
    .replace(/^(tỉnh|thành phố)\s+/u, "");
export function provinceFor(location?: string | null): string | null {
  const parts = (location || "").split(",").map(normalize);
  for (const [current, aliases] of Object.entries(provinces))
    if (aliases.some((alias) => parts.includes(normalize(alias))))
      return current;
  return null;
}
