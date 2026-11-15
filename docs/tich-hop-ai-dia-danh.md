# Nhận diện địa danh và dịch vụ theo tỉnh

Model ONNX có 17 đầu ra; danh mục dùng 14 lớp được chọn trong tệp `classes_curated.json` do nhóm cung cấp. Ba lớp Cầu Rồng, Văn Miếu và Hồ Hoàn Kiếm không được tự động chấp nhận bởi model. Không xóa hay đổi thứ tự đầu ra model. SHA-256: `b3e69b571a0c2c7943e0d4e68f2e5b3fae51df5b612535f7fa57cd8d47f058cc`.

Model phân loại toàn ảnh, không phải bộ phát hiện đối tượng và không tự chứng minh đúng. Google Cloud Vision phải xác nhận tên địa danh mới liên kết đến danh mục dịch vụ; nếu không xác nhận, app chỉ cho xem dự đoán và không tự gắn dịch vụ theo tỉnh. Model có thể nhầm ảnh ngoài tập huấn luyện với điểm cao, nên cần tiếp tục đo trên ảnh độc lập, đặc biệt ảnh Cầu Rồng và Vịnh Hạ Long.

Chạy cục bộ trong thư mục gốc:

```bash
python3 -m venv ai-service/.venv
ai-service/.venv/bin/pip install -r ai-service/requirements.txt
python3 scripts/download-landmark-model.py
bash scripts/dev.sh web
```

File model không được commit do kích thước; script tải model từ commit cố định của repo nhóm và kiểm tra checksum. Trong môi trường deploy cần đưa `shared/landmarks.json`, `shared/provinces.json`, `shared/image-credits.json`, model đã xác minh, `classes.json` và các phụ thuộc vào đúng đường dẫn hoặc cấu hình `LANDMARK_CATALOG_PATH`, `LANDMARK_MODEL_PATH`, `LANDMARK_CLASSES_PATH`. Cấu hình Google Cloud Vision bằng credential trên máy chủ, không đưa khóa vào Git. Cần cho phép CORS của frontend thật trong `AI_ALLOWED_ORIGINS`.

Backend bổ sung `/api/places/resolve?landmarkCode=...` và `/api/places/{id}/services`. Các địa điểm trong danh mục được đồng bộ theo mã khi backend khởi động; tour/khách sạn chỉ được hiển thị nếu đang hoạt động và có tỉnh khớp rõ ràng. Tour/khách sạn không có tỉnh xác định không được gán đoán. Không tạo tour, khách sạn hay giá giả: quản trị viên cần bổ sung dữ liệu thật. Các tỉnh cũ Quảng Nam và Thừa Thiên Huế được chuẩn hóa về Đà Nẵng và Huế. SQL thay đổi cột tham khảo: `backend/src/main/resources/db/011_landmark_provinces.sql`; cần sao lưu và rà soát dữ liệu trùng trước triển khai, đặc biệt khi có nhiều bản backend cùng khởi động.

Ảnh có nguồn và giấy phép trong `shared/image-credits.json`. Hiện chỉ 4 ảnh tải được; Wikimedia trả giới hạn truy cập cho các ảnh khác. Cần bổ sung ảnh có giấy phép và ghi nguồn trước khi hoàn tất danh mục.

Các thay đổi trong repo `travel-ai-system-public` không tự triển khai lên trang do Thuận vận hành. Cần đối chiếu nhánh/kiến trúc repo nhóm với Thuận, review code, migration, model, phiên bản Python và cấu hình Cloud Vision, rồi triển khai AI, backend và frontend tương ứng.

Màn hình nhận diện cho phép tìm địa điểm trong danh mục backend theo tên hoặc tỉnh (có thể gõ không dấu), chọn và xác nhận trước khi mở trang dịch vụ. Danh mục không có địa điểm thì thông báo không tìm thấy; không tự thêm dữ liệu. Google Vision là nguồn chính, model bổ sung khi có tín hiệu khớp; model và OCR khớp nhưng Vision mâu thuẫn chỉ hiển thị dự đoán.
