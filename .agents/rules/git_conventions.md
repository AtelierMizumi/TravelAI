# Quy Chuẩn Git Commits, Thời Gian & Tác Giả (Git Conventions & Authoring)

## 1. Xác Định Tác Giả Commit (Commit Authorship)
- **Agent không bao giờ được ghi nhận commit là do AI / Agent tạo ra.**
- Mọi commit trong Git bắt buộc phải được gán quyền tác giả cho người dùng hoặc thành viên trong nhóm 3 kỹ sư (`git config user.name` & `user.email`).
- Luôn kiểm tra cấu hình Git trước khi commit để đảm bảo tính nhất quán về danh tính kỹ sư.

## 2. Mô Phỏng Dòng Thời Gian Commit Chân Thực (Realistic Timeline)
- Dòng thời gian commit phải tương thích với lộ trình 12 tuần / 6 Sprints:
  - **Sprint 1**: 07/09/2026 - 20/09/2026 (Khởi động, Kiến trúc, CSDL)
  - **Sprint 2**: 21/09/2026 - 04/10/2026 (Xác thực JWT, Nền tảng AI FastAPI)
  - **Sprint 3**: 05/10/2026 - 18/10/2026 (Google Vision API, Kết quả nhận diện, Khám phá)
  - **Sprint 4**: 19/10/2026 - 01/11/2026 (Review, Booking & Payment, Admin Dashboard)
  - **Sprint 5**: 02/11/2026 - 15/11/2026 (Mạng xã hội, Chat WebSocket, Tour & Hotel)
  - **Sprint 6**: 16/11/2026 - 29/11/2026 (Kiểm thử, Tối ưu hóa, Docker, Cloud CI/CD)
- **Khung giờ commit hợp lý**:
  - Phản ánh giờ làm việc thực tế của con người: trong khoảng `09:30` đến `22:30` các ngày làm việc, hoặc các buổi coding cuối tuần.
  - Phân bổ rải rác, tránh tình trạng commit hàng loạt trong cùng 1 giây hoặc 1 phút phi tự nhiên.
  - Khi cần commit vào quá khứ hoặc tương lai theo kế hoạch Sprint, sử dụng biến môi trường Git:
    ```bash
    GIT_AUTHOR_DATE="YYYY-MM-DD HH:MM:SS" GIT_COMMITTER_DATE="YYYY-MM-DD HH:MM:SS" git commit -m "..."
    ```

## 3. Quy Chuẩn Thông Điệp Commit (Conventional Commits)
- Tuân thủ định dạng: `<type>(<scope>): <mô tả ngắn gọn> (#issue_id)`
  - `feat`: Thêm tính năng mới (ví dụ: `feat(ai): integrate Google Vision landmark detection (#8)`)
  - `fix`: Sửa lỗi (ví dụ: `fix(auth): resolve JWT expiration parsing issue (#5)`)
  - `docs`: Cập nhật tài liệu kỹ thuật
  - `refactor`: Tái cấu trúc mã nguồn không đổi hành vi
  - `test`: Bổ sung kịch bản kiểm thử tự động
  - `chore`: Cập nhật cấu hình build, dependency, Docker
- Nội dung commit rõ ràng, mang tính kỹ thuật cao, không viết cụt ngủn hoặc chung chung.
