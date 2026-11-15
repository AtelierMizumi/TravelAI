export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requestJson<T>(
  url: string,
  options: RequestInit = {},
  unauthorized: () => void = () => {},
  timeoutMs = 30_000,
): Promise<T> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) cancel();
  const timer = setTimeout(cancel, timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) unauthorized();
      throw new ApiError(
        data?.message ||
          data?.detail ||
          `Yêu cầu thất bại (${response.status}).`,
        response.status,
      );
    }
    return data as T;
  } catch (error) {
    if (options.signal?.aborted || error instanceof ApiError) throw error;
    throw new ApiError(
      controller.signal.aborted
        ? "Backend phản hồi quá lâu. Nếu đã gửi thanh toán, thử lại cùng yêu cầu để truy vấn kết quả."
        : "Không kết nối được backend. Kiểm tra địa chỉ server và kết nối mạng.",
      0,
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
  }
}
