import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('travelai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    // Standard RFC 7807 Problem Details normalizer
    const problemDetails = {
      status: error.response?.status || 0,
      title: isNetworkError
        ? 'Lỗi kết nối máy chủ'
        : error.response?.data?.title || 'Lỗi hệ thống',
      detail:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (isNetworkError
          ? 'Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra lại dịch vụ.'
          : 'Đã có lỗi xảy ra trong quá trình xử lý yêu cầu.'),
      type: error.response?.data?.type || 'about:blank',
      instance: error.response?.data?.instance || null,
      isNetworkError,
      code: error.code || null,
    };

    return Promise.reject(problemDetails);
  }
);

export default api;
