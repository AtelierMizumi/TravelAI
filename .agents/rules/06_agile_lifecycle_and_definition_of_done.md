# 📈 VÒNG ĐỜI SPRINT & TIÊU CHUẨN HOÀN THÀNH (AGILE LIFECYCLE & DEFINITION OF DONE)
## RULESET 06: CADENCE EXECUTION & ACCEPTANCE CRITERIA ENFORCEMENT

> **ID**: `TAGF-RULE-006`  
> **Phạm vi**: Điều phối Sprint, chuyển đổi trạng thái task trên GitHub Project Board #2, tiêu chuẩn DoR & DoD.

---

## 1. TIÊU CHUẨN SẴN SÀNG (DEFINITION OF READY - DoR)

Một gói công việc WBS chỉ được phép bắt đầu lập trình khi thỏa mãn đồng thời 4 điều kiện:
1. **Rõ ràng phạm vi**: Có mô tả mục tiêu, sản phẩm bàn giao (Deliverables) cụ thể trong issue.
2. **Tiêu chí nghiệm thu rõ ràng**: Có ít nhất 2 điều kiện Acceptance Criteria đo lường được.
3. **Phụ thuộc đã giải quyết (Dependencies Resolved)**: Các gói công việc tiền đề đã hoàn thành hoặc có stub/mock sẵn sàng.
4. **Đúng người đúng việc**: Được phân công chính xác cho một trong 3 kỹ sư (Thuận, Đức hoặc Ngọc).

---

## 2. TIÊU CHUẨN HOÀN THÀNH (DEFINITION OF DONE - DoD)

Một gói công việc WBS chỉ được phép chuyển trạng thái sang **`Done`** và đóng Issue khi thỏa mãn đầy đủ Checklist sau:

```markdown
- [ ] Code tuân thủ kiến trúc phân tầng (Clean Layered Architecture)
- [ ] Không có file tài liệu văn phòng (*.docx, *.xlsx, *.pdf) nào bị commit
- [ ] Không có console.log, print debug hoặc mã nguồn rác chưa dọn dẹp
- [ ] API endpoint trả về đúng cấu trúc JSON và có xử lý lỗi theo chuẩn RFC 7807
- [ ] Đã chạy thử nghiệm cục bộ và xác nhận hoạt động chính xác
- [ ] Commit tuân thủ Conventional Commits có gắn mã Issue: `<type>(<scope>): <desc> (#<id>)`
- [ ] Thẻ trên GitHub Project Board #2 được cập nhật sang cột "Done"
- [ ] Issue liên kết được đóng thành công trên GitHub
```

---

## 3. QUY TRÌNH THỰC HIỆN 1 BUỔI / TUẦN (WEEKLY SPRINT SESSION PROTOCOL)

Khi bước vào buổi làm việc tập trung hàng tuần, Agent và nhóm kỹ sư thực hiện theo chu trình khép kín:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHU TRÌNH 4 BƯỚC BUỔI LÀM VIỆC TUẦN                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 1: SYNC-UP & KÉO VIỆC (00:00 - 00:15)                                  │
│ - Mở Project #2: https://github.com/users/AtelierMizumi/projects/2          │
│ - Xác nhận các Issue thuộc Sprint hiện tại đang ở Todo                       │
│ - Kéo các Issue được phân công sang cột "In Progress"                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 2: DEEP WORK & CODING (00:15 - 03:30)                                  │
│ - Tạo nhánh: git checkout -b feat/wbs-<id>-<ten>                            │
│ - Lập trình tính năng, viết unit test, kiểm tra chạy thử                    │
│ - Tuyệt đối không commit file tài liệu cũ hoặc file văn phòng               │
├─────────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 3: CODE REVIEW & MERGE (03:30 - 04:00)                                 │
│ - Đẩy nhánh lên remote: git push -u origin feat/wbs-...                     │
│ - Tạo Pull Request gắn mã (#<issue_id>)                                     │
│ - Thành viên khác review chéo, kiểm tra DoD, merge vào main                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 4: WRAP-UP & PROJECT SYNC (04:00 - 04:15)                              │
│ - Kéo thẻ trên GitHub Project #2 sang cột "Done"                            │
│ - Kiểm tra Issue đã tự động đóng                                            │
│ - Ghi nhận thành quả Sprint và sẵn sàng cho tuần tiếp theo                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. MA TRẬN TIẾN ĐỘ 6 SPRINTS & CHECKLIST NGHIỆM THU

### 🔹 Sprint 1 (Tuần 1 - 2): Khởi Động & Kiến Trúc
- [x] `[WBS 1.1.1]` Khởi động & xác định yêu cầu (Trần Minh Thuận) -> **Issue #1 (Closed)**
- [x] `[WBS 1.1.2]` Thiết kế kiến trúc hệ thống đa dịch vụ (Trần Minh Thuận) -> **Issue #2 (Closed)**
- [ ] `[WBS 1.1.3]` Thiết kế CSDL & mô hình dữ liệu PostgreSQL (Hoàng Văn Đức) -> **Issue #3**

### 🔹 Sprint 2 (Tuần 3 - 4): Xác Thực & Nền Tảng AI Service *(Hiện tại)*
- [ ] `[WBS 1.2.1]` Đăng ký / đăng nhập (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #4**
- [ ] `[WBS 1.2.2]` Profile & bảo mật JWT (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #5**
- [ ] `[WBS 1.3.1]` Upload & tiền xử lý ảnh (Trần Minh Thuận) -> **Issue #6**
- [ ] `[WBS 1.3.2]` AI Service bằng FastAPI (Trần Minh Thuận) -> **Issue #7**

### 🔹 Sprint 3 (Tuần 5 - 6): AI Landmark & Khám Phá
- [ ] `[WBS 1.3.3]` Tích hợp Google Vision API (Trần Minh Thuận) -> **Issue #8**
- [ ] `[WBS 1.3.4]` Hiển thị kết quả nhận diện (Lê Văn Ngọc) -> **Issue #9**
- [ ] `[WBS 1.5.1]` Khám phá & tìm kiếm địa điểm (Lê Văn Ngọc FE + Hoàng Văn Đức BE) -> **Issue #10**

### 🔹 Sprint 4 (Tuần 7 - 8): Review, Booking & Quản Trị *(100% Core MVP)*
- [ ] `[WBS 1.4.3]` Viết & hiển thị Review (Lê Văn Ngọc) -> **Issue #11**
- [ ] `[WBS 1.5.4]` Đặt Tour / Khách sạn & thanh toán (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #12**
- [ ] `[WBS 1.6.1]` Dashboard quản trị (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #13**
- [ ] `[WBS 1.6.2]` Quản lý người dùng (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #14**
- [ ] `[WBS 1.6.3]` Quản lý địa danh (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #15**

### 🔹 Sprint 5 (Tuần 9 - 10): Mạng Xã Hội, Chat Realtime & Mở Rộng
- [ ] `[WBS 1.4.1]` Đăng bài & chia sẻ trải nghiệm (Lê Văn Ngọc FE + Hoàng Văn Đức BE) -> **Issue #16**
- [ ] `[WBS 1.4.2]` Like / Comment / Follow (Lê Văn Ngọc) -> **Issue #17**
- [ ] `[WBS 1.4.4]` Chat thời gian thực WebSocket (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #18**
- [ ] `[WBS 1.5.2]` Danh sách & chi tiết Tour (Lê Văn Ngọc) -> **Issue #19**
- [ ] `[WBS 1.5.3]` Danh sách & chi tiết Khách sạn (Lê Văn Ngọc) -> **Issue #20**
- [ ] `[WBS 1.6.4]` Quản lý đặt chỗ (Hoàng Văn Đức) -> **Issue #21**
- [ ] `[WBS 1.6.5]` Kiểm duyệt bài viết & cài đặt (Lê Văn Ngọc UI + Hoàng Văn Đức BE) -> **Issue #22**

### 🔹 Sprint 6 (Tuần 11 - 12): Kiểm Thử, Tối Ưu, Docker & Bàn Giao
- [ ] `[WBS 1.7.1]` Kiểm thử tích hợp & chức năng (Cả nhóm) -> **Issue #23**
- [ ] `[WBS 1.7.2]` Kiểm thử hiệu năng, bảo mật, responsive (Cả nhóm) -> **Issue #24**
- [ ] `[WBS 1.7.3]` Triển khai Cloud, Docker & bàn giao (Trần Minh Thuận) -> **Issue #25**
