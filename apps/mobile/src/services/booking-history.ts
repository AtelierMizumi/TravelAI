const statuses: Record<string, string> = {
  CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy", RESCHEDULED: "Đã đổi lịch",
  NO_SHOW: "Đã ghi nhận vắng mặt", NO_SHOW_CORRECTED: "Đã khôi phục đặt chỗ",
};
export function bookingStatus(action: string): string {
  return statuses[action] || "Đã cập nhật đặt chỗ";
}
export function historySummary(action: string, details: unknown): string {
  const data = details && typeof details === "object" ? details as Record<string, unknown> : {};
  const message = action === "CONFIRMED" ? "Đặt chỗ đã được xác nhận và lưu vào lịch sử."
    : action === "CANCELLED" ? "Đặt chỗ đã được hủy."
    : action === "RESCHEDULED" ? "Lịch trình mới đã được xác nhận."
    : "Trạng thái đặt chỗ đã được cập nhật.";
  const amounts = ([['refund', 'Hoàn tiền'], ['fee', 'Phí']] as const).flatMap(([key, label]) => {
    const amount = data[key];
    return typeof amount === "number" && Number.isFinite(amount) && amount >= 0
      ? [`${label}: ${new Intl.NumberFormat("vi-VN").format(amount)} VND.`] : [];
  });
  return [message, ...amounts].join(" ");
}
