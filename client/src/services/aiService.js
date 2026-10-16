import axios from 'axios';

// AI Service URL config - defaults to empty string so requests leverage Vite / Nginx reverse proxy
const getAiBaseUrl = () => {
  return import.meta.env.VITE_AI_SERVICE_URL || '';
};

// Dedicated axios instance for AI Microservice
const aiClient = axios.create({
  baseURL: getAiBaseUrl(),
  timeout: 15000,
});

// Normalize RFC 7807 Problem Details
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 500;
    let detail = error.response?.data?.detail;

    if (!detail) {
      if (status === 413) {
        detail = 'Kích thước file ảnh vượt quá giới hạn 10MB cho phép.';
      } else if (status === 415) {
        detail = 'Định dạng file không được hỗ trợ. Vui lòng chỉ tải lên ảnh JPEG, PNG hoặc WebP.';
      } else if (status === 422) {
        detail = 'Hình ảnh không thể xử lý hoặc bị hỏng. Vui lòng thử lại với hình ảnh khác.';
      } else if (status === 502) {
        detail = 'Dịch vụ Google Cloud Vision tạm thời không phản hồi. Vui lòng thử lại sau.';
      } else if (status === 504) {
        detail = 'Quá thời gian xử lý nhận diện AI (> 5.0s). Vui lòng thử lại.';
      } else {
        detail = error.response?.data?.message || 'Đã có lỗi xảy ra trong quá trình nhận diện AI.';
      }
    }

    const problemDetails = {
      status,
      title: error.response?.data?.title || 'Lỗi nhận diện AI',
      detail,
      type: error.response?.data?.type || 'about:blank',
    };

    return Promise.reject(problemDetails);
  }
);

export const aiService = {
  /**
   * Send uploaded image to AI Vision microservice for landmark recognition.
   * @param {File} imageFile
   * @returns {Promise<LandmarkRecognitionResult>}
   */
  async recognizeLandmark(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await aiClient.post('/api/v1/vision/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      // In offline / dev mode without running FastAPI service, provide realistic mock landmark result
      if (import.meta.env.DEV) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const fileName = imageFile.name.toLowerCase();
            let mockName = 'Vịnh Hạ Long';
            let mockLat = 20.9101;
            let mockLng = 107.1839;
            let mockConfidence = 0.942;
            let mockDesc = 'Di sản thiên nhiên thế giới UNESCO tại tỉnh Quảng Ninh, Việt Nam.';
            let detectionType = 'LANDMARK_DETECTION';

            if (fileName.includes('hoi-an') || fileName.includes('hoian')) {
              mockName = 'Phố Cổ Hội An';
              mockLat = 15.8801;
              mockLng = 108.338;
              mockConfidence = 0.918;
              mockDesc = 'Đô thị cổ được bảo tồn tại tỉnh Quảng Nam.';
            } else if (fileName.includes('trang-an') || fileName.includes('ninh-binh')) {
              mockName = 'Quần Thể Danh Thắng Tràng An';
              mockLat = 20.2506;
              mockLng = 105.9042;
              mockConfidence = 0.895;
              mockDesc = 'Di sản thế giới hỗn hợp văn hóa và thiên nhiên tại Ninh Bình.';
            } else if (fileName.includes('unknown') || fileName.includes('cat') || fileName.includes('dog')) {
              // Simulate unknown landmark / web fallback
              mockName = null;
              mockConfidence = 0.35;
              mockLat = null;
              mockLng = null;
              detectionType = 'UNKNOWN';
              mockDesc = 'Không tìm thấy danh lam thắng cảnh khớp chính xác trong cơ sở dữ liệu.';
            }

            resolve({
              landmark_name: mockName,
              confidence: mockConfidence,
              latitude: mockLat,
              longitude: mockLng,
              description: mockDesc,
              detection_type: detectionType,
              success: Boolean(mockName),
              matched_keywords: mockName ? [mockName.toLowerCase(), 'vietnam', 'landmark'] : ['landscape', 'outdoor'],
              bounding_poly: [],
              metadata: {
                original_width: 1920,
                original_height: 1080,
                processed_width: 1920,
                processed_height: 1080,
                format: 'JPEG',
                content_type: imageFile.type || 'image/jpeg',
                size_bytes: imageFile.size,
              },
            });
          }, 1200);
        });
      }
      throw err;
    }
  },

  /**
   * Fetch recent recognition history
   */
  async getHistory(limit = 10) {
    try {
      const response = await aiClient.get(`/api/v1/vision/history?limit=${limit}`);
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        return { total: 0, items: [] };
      }
      throw err;
    }
  },
};
