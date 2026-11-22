# Research: Governance CI Gate

Không còn mục NEEDS CLARIFICATION trong Technical Context. Các quyết định dưới đây là lựa chọn đã thực hiện hoặc đang chấp nhận.

## R1. Ngôn ngữ của gate: bash thuần

- **Decision**: bash với `set -u`, chỉ dùng `git`, `grep`, `sed`.
- **Rationale**: CI đã chạy bash (`scripts/scan-secrets.sh`, `scripts/test-*.sh`). Không cần cài thêm gì trên runner. Gate cần đọc lịch sử git, bash là phù hợp nhất.
- **Alternatives**: Python (`pytest`) cho harness. Bị loại vì thêm bước `setup-python` vào job CI chỉ để kiểm một script bash, và trái nguyên tắc 7 (đơn giản trước).

## R2. Harness: repo git tạm cho từng case

- **Decision**: mỗi TC dựng `mktemp -d`, `git init`, copy script vào, tạo vi phạm, kiểm exit code (và thông điệp khi cần).
- **Rationale**: kiểm đúng hành vi end-to-end, không mock git. Cô lập hoàn toàn với repo thật.
- **Alternatives**: mock `git` bằng fake PATH. Bị loại vì khó đảm bảo đúng hành vi git thật, và phức tạp hơn.

## R3. Phạm vi test-first: theo layout thật

- **Decision**: heuristic test-first áp dụng cho `backend/src/main/`, `ai-service/` (trừ `tests/`) và `apps/mobile/src|app`.
- **Rationale**: layout cũ (`services/`, `client/src`) đã bỏ từ lâu nên heuristic không bao giờ kích hoạt (BUG-002). `AGENTS.md` là nguồn chân lý về layout.
- **Alternatives**: đọc layout từ file cấu hình. Bị loại vì tăng độ phức tạp mà không có lợi ích hiện tại.

## R4. Ngoại lệ trong secret-scan và path-scan

- **Decision**: loại trừ đúng hai đường dẫn có chủ đích: `scripts/test-scan-secrets.sh` (fixture) và `.env.example` (placeholder). Không loại trừ theo mẫu rộng.
- **Rationale**: BUG-003, BUG-004. Loại trừ theo mẫu rộng sẽ làm mất khả năng phát hiện thật.
- **Alternatives**: dùng `.secretscan-allow` như `scan-secrets.sh`. Bị loại vì gate này đã có danh sách loại trừ riêng; hợp nhất là việc của Phase 4 nếu cần.

## R5. CI wiring: sau merge, không trước

- **Decision**: không sửa `ci.yml` cho đến khi script được merge vào `main`. Fallback "skipped" vẫn tồn tại đến lúc đó.
- **Rationale**: nếu bỏ fallback trên branch chưa có script, CI sẽ đỏ trên nhánh feature khác.
- **Alternatives**: bỏ fallback ngay. Bị loại vì sẽ làm đỏ mọi PR đang chờ.
