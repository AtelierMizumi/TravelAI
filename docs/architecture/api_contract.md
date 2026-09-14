# 🔌 ĐẶC TẢ GIAO DIỆN API LIÊN DỊCH VỤ (API CONTRACT SPECIFICATION)

> **Mã công việc WBS**: `1.1.2 - Thiết kế kiến trúc hệ thống`  
> **Người thực hiện**: Trần Minh Thuận (Tech Lead / System Architect)  
> **Phiên bản**: `1.0.0` | **Sprint**: `Sprint 1 (Tuần 1 - 2)`  
> **Liên kết Issue**: [Issue #2](https://github.com/AtelierMizumi/TravelAI/issues/2)

---

## 1. GIAO TIẾP NỘI BỘ (INTERNAL INTER-SERVICE API: SPRING BOOT <-> FASTAPI)

### 1.1. API Nhận Diện Địa Danh Bằng AI
- **Endpoint**: `POST /api/v1/vision/recognize`
- **Giao thức**: HTTP/1.1 RESTful (Internal Microservice Network)
- **Content-Type**: `multipart/form-data`

#### Request Parameters:
| Tên Tham Số | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|---|---|---|---|
| `file` | Binary (Image) | Có | File hình ảnh định dạng JPEG/PNG/WEBP, kích thước < 10MB |

#### Response Success (`200 OK`):
```json
{
  "success": true,
  "landmark_name": "Vịnh Hạ Long",
  "confidence": 0.94,
  "latitude": 20.9101,
  "longitude": 107.1839,
  "description": "Di sản thiên nhiên thế giới UNESCO tại tỉnh Quảng Ninh, Việt Nam.",
  "matched_keywords": ["ha long", "vịnh hạ long", "ha long bay"],
  "detection_type": "LANDMARK_DETECTION"
}
```

#### Response Not Recognized (`200 OK`):
```json
{
  "success": false,
  "landmark_name": null,
  "confidence": 0.0,
  "latitude": null,
  "longitude": null,
  "description": "Không nhận diện được danh lam thắng cảnh trong bức ảnh.",
  "matched_keywords": [],
  "detection_type": "UNKNOWN"
}
```

#### Response Error (`400 Bad Request / 500 Internal Error`):
```json
{
  "success": false,
  "error_code": "INVALID_IMAGE_FORMAT",
  "message": "Định dạng file không được hỗ trợ. Vui lòng tải lên định dạng JPEG, PNG hoặc WEBP.",
  "timestamp": "2026-09-27T10:00:00Z"
}
```

---

## 2. GIAO DIỆN NGOẠI VI (EXTERNAL CLIENT-FACING REST API)

### 2.1. Nhận Diện & Gợi Ý Điểm Đến
- **Endpoint**: `POST /api/places/recognize`
- **Header**: `Authorization: Bearer <JWT_TOKEN>` (Tùy chọn)
- **Mô tả**: Tiếp nhận ảnh từ React Client, chuyển tiếp đến AI Service và kết hợp dữ liệu từ PostgreSQL.
- **Response Success (`200 OK`)**:
```json
{
  "status": "success",
  "data": {
    "landmark": {
      "id": 1,
      "name": "Vịnh Hạ Long",
      "province": "Quảng Ninh",
      "description": "Kỳ quan thiên nhiên thế giới nổi tiếng với hàng ngàn đảo đá vôi.",
      "image_url": "https://storage.travelai.vn/places/ha-long.jpg",
      "rating": 4.8,
      "review_count": 128
    },
    "confidence_score": 0.94,
    "suggested_tours": [
      {
        "id": 101,
        "title": "Tour Du Thuyền 5 Sao Vịnh Hạ Long 2N1Đ",
        "price": 2850000,
        "duration": "2 ngày 1 đêm",
        "rating": 4.9
      }
    ],
    "suggested_hotels": [
      {
        "id": 201,
        "name": "Vinpearl Resort & Spa Hạ Long",
        "price_per_night": 2200000,
        "stars": 5,
        "address": "Đảo Rều, Bãi Cháy, TP. Hạ Long"
      }
    ]
  }
}
```

### 2.2. Chuẩn Mã Lỗi Hệ Thống (RFC 7807 Standard Error Format)
```json
{
  "type": "https://travelai.vn/errors/resource-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Không tìm thấy thông tin địa danh với mã được cung cấp.",
  "instance": "/api/places/999",
  "timestamp": "2026-09-27T10:00:00Z"
}
```
