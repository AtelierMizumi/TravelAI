# Kiểm thử ảnh mẫu AI — 08/11/2026

Đã gửi 15 tệp ảnh trong `ai-service/ai` tới endpoint `/detect` và Google Cloud Vision theo sự đồng ý của người dùng. Cả 15 trả HTTP 200, nhưng HTTP 200 chỉ có nghĩa là yêu cầu được xử lý, không chứng minh tên địa điểm chính xác. Kết quả dưới đây dùng nguồn `google_vision_fallback`; Gemini không tham gia. Cột đối chiếu dựa trên nội dung nhìn thấy trong ảnh và tên tệp, không phải dữ liệu gốc đã xác minh độc lập.

| Ảnh | Phản hồi | Đối chiếu |
| --- | --- | --- |
| `benThanh.jpeg` | Không rõ; Con người | Chưa đúng với chủ thể nổi bật là chợ Bến Thành. |
| `berlin.jpeg` | Dự đoán Berlin Cathedral | Phù hợp với ảnh. |
| `du-lich-Hokkaido-nhat-ban.jpg` | Không rõ; Phương tiện giao thông | Chưa xác định được địa điểm; mô tả còn chung. |
| `images.jpeg` | Dự đoán Eiffel Tower | Phù hợp với ảnh tháp Eiffel. |
| `nui.jpeg` | Không rõ; Phong cảnh thiên nhiên | Chưa xác định được ngọn núi. |
| `phuQuoc.jpg` | Không rõ; Phong cảnh biển và đảo | Nhận được loại cảnh nhưng chưa xác định Phú Quốc. |
| `taXua.jpeg` | Dự đoán Ta Xua | Phù hợp với tên tệp và cảnh núi. |
| `test1.jpeg` | Dự đoán Notre Dame Cathedral of Saigon | Phù hợp với ảnh nhà thờ Đức Bà Sài Gòn. |
| `test2.webp` | Không rõ; Phong cảnh thiên nhiên | Chưa xác định được địa điểm cụ thể. |
| `test3.jpeg` | Không rõ; Phong cảnh biển và đảo | Nhận được loại cảnh nhưng chưa xác định được vịnh. |
| `test4.jpeg` | Dự đoán Dragon Bridge | Phù hợp với ảnh cầu Rồng. |
| `test5.jpeg` | Dự đoán Thien Mu Pagoda | Phù hợp với ảnh chùa Thiên Mụ. |
| `test6.jpeg` | Dự đoán Thien Mu Pagoda | Phù hợp với cảnh chùa trong ảnh, nhưng góc xa cần xác minh ảnh gốc. |
| `thaoDongHo.jpeg` | Dự đoán Big Ben | Phù hợp với ảnh. |
| `thap.jpeg` | Dự đoán Eiffel Tower | Phù hợp với ảnh tháp Eiffel; ảnh này trùng nội dung với `images.jpeg`. |

Tổng cộng 9 ảnh có tên dự đoán phù hợp khi đối chiếu sơ bộ và 6 ảnh chưa xác định được tên. Kết quả này không đánh giá độ chính xác tổng quát của mô hình: tập mẫu nhỏ, không có nhãn chuẩn độc lập, và có ảnh trùng. Tại thời điểm kiểm thử, mã dịch vụ chủ động vô hiệu hóa phân tích Gemini, kể cả khi có cấu hình khóa. Không khẳng định kết quả Gemini nếu chưa bật và kiểm thử riêng với sự đồng ý chia sẻ ảnh cho dịch vụ đó.
