# TravelAI Constitution

Nguồn chân lý đầy đủ là [AGENTS.md](../../AGENTS.md) và [.agents/rules/](../../.agents/rules). File này chỉ tóm tắt những nguyên tắc mà mọi spec và plan phải tuân theo. Khi có mâu thuẫn, AGENTS.md thắng.

## Nguyên tắc cốt lõi

1. **Không lộ dữ liệu**: không commit secret, `.env`, credential, đường dẫn tuyệt đối trên máy cá nhân, hay tài liệu nhị phân văn phòng (`*.docx`, `*.pdf`, `*.xlsx`, `*.pptx`, `*.csv`). `local_references/` luôn nằm trong `.gitignore`.
2. **Test trước**: mỗi thay đổi code phải đi kèm test; test được viết và thấy đỏ trước khi sửa code. Không sửa, xóa, skip hay nới assertion để test qua.
3. **Đúng vai trò**: mỗi spec khai báo BA, QC, Dev theo [roles.md](roles.md) (BA Ngọc viết spec, QC Thuận viết test plan và nghiệm thu, Dev Đức viết code). Trước khi làm việc, đối chiếu `git config user.email` với vai trò đang đảm nhận; không khớp thì dừng và hỏi.
4. **Lịch sử git trung thực**: Conventional Commits `<type>(<scope>): <summary> (#<issue>)`, không có trailer của trợ lý AI, không đặt lại ngày hay tác giả, không rewrite lịch sử chung.
5. **Không đụng phần người khác** khi chưa được yêu cầu: WBS của Đức (backend/DB) và Ngọc (frontend/QA) chỉ sửa khi người dùng yêu cầu rõ, và PR phải ghi là cross-scope.
6. **Không push `main`**: chỉ commit và push khi người dùng yêu cầu; merge vào `main` chỉ qua PR.
7. **Đơn giản trước**: spec ngắn, plan và tasks vừa đủ để làm được; không thêm abstraction hay file chưa cần.

**Version**: 1.0.0 | **Ratified**: 2026-11-21 | **Last Amended**: 2026-11-21
