interface BackendAddress {
  configured?: string;
  webOrigin?: string;
  expoHost?: string | null;
}

function configurationError() {
  return new Error(
    "Chưa có địa chỉ backend truy cập được. Đặt EXPO_PUBLIC_API_URL=http://IP-WiFi-máy-tính:8080/api, dùng cùng Wi-Fi rồi tải lại ứng dụng. Expo tunnel không mở cổng backend.",
  );
}

function localHost(host: string) {
  if (host === "localhost" || host.endsWith(".local")) return true;
  const parts = host.split(".");
  if (
    parts.length !== 4 ||
    !parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  ) return false;
  const [first, second] = parts.map(Number);
  return first === 127 || first === 10 ||
    (first === 192 && second === 168) ||
    (first === 172 && second >= 16 && second <= 31);
}

export function resolveBackendUrl(address: BackendAddress) {
  const configured = address.configured?.trim();
  if (configured) {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      throw configurationError();
    return configured.replace(/\/+$/, "");
  }
  const host = address.webOrigin
    ? new URL(address.webOrigin)
    : address.expoHost
      ? new URL(`http://${address.expoHost}`)
      : null;
  if (!host || !localHost(host.hostname)) throw configurationError();
  return `${host.protocol}//${host.hostname}:8080/api`;
}
