# Đề xuất thêm task và báo cáo chuyển TravelAI sang đa nền tảng

**Ngày đối chiếu:** 09/11/2026. Đây là bản nháp để nhóm thảo luận, phân công và cập nhật board; **không phải biên bản xác nhận công việc đã hoàn thành**.

## 1. Bối cảnh và những điều cần nói đúng trong báo cáo

- Board trong ảnh dùng các issue của repository cũ [AtelierMizumi/TravelAI](https://github.com/AtelierMizumi/TravelAI). Repository đa nền tảng mới là [ngoctapcodee/travel-ai-system](https://github.com/ngoctapcodee/travel-ai-system). Đây là hai repository khác nhau; `#24` trong repo này không tự động là `#24` trong repo kia.
- Phạm vi thay đổi là chuyển từ web cũ sang ứng dụng dùng chung mã nguồn Expo/React Native cho **Web, Android, iOS**, đồng thời tích hợp với backend Spring Boot, PostgreSQL và FastAPI AI. Cần kiểm thử riêng từng nền tảng; có source/bundle không có nghĩa đã phát hành APK/IPA.
- Bản mới có API và chức năng **SIMULATED** cho ngân hàng, thanh toán và hoàn phí. Không giới thiệu đó là cổng Mastercard/ngân hàng thật, không lưu thông tin thẻ thật.
- Hiện FastAPI và Spring Boot chạy thành hai tiến trình, nhưng các nghiệp vụ chính vẫn nằm chung Spring Boot/PostgreSQL. Không ghi hệ thống đã chuyển hoàn toàn sang microservice hoặc mỗi service đã có database riêng.
- Ảnh chụp là bằng chứng tại thời điểm chụp, không đủ để xác nhận một issue mới đã hoàn tất. Các task dưới đây có phần **mã đã tồn tại nhưng cần kiểm thử/hoàn thiện**, không yêu cầu làm lại từ đầu.
- Theo thông tin thành viên cung cấp: `AtelierMizumi` phụ trách repository cũ của nhóm; `Duchayslay` và `ngoctapcodee` là hai thành viên còn lại. Chủ repo mới `ngoctapcodee/travel-ai-system` là `ngoctapcodee`. Vai trò và người xử lý bên dưới là **đề xuất**, nhóm cần thống nhất lại.

### Điểm khác biệt quan trọng về Docker/CI

[PR #42 của repo cũ](https://github.com/AtelierMizumi/TravelAI/pull/42) có nội dung Docker Compose, smoke test và CI, đã merge vào 07/11/2026. Khi kiểm tra ngày 09/11, [issue #24 của repo cũ](https://github.com/AtelierMizumi/TravelAI/issues/24) vẫn `open`; ảnh board hiển thị `Todo`, nhưng trạng thái cột Project trực tiếp chưa được kiểm tra. Repo đa nền tảng mới chưa thấy các file Docker/CI tương ứng. **Không nói nhóm chưa từng làm Docker/CI**; task mới là kiểm tra, điều chỉnh và chuyển phần phù hợp sang kiến trúc mới, sau đó mới đánh giá nghiệm thu.

## 2. Cách cập nhật board mà vẫn giữ lịch sử

1. Vào Project **TravelAI - WBS Roadmap & Sprint Planning**, mở bảng **Sprint Backlog & Work Packages** như trong ảnh.
2. Giữ các issue cũ và lịch sử trạng thái/PR. Đừng xóa hàng cũ hay chuyển toàn bộ issue `Done` về `Todo` chỉ vì có phiên bản mới.
3. Tạo một thay đổi phạm vi **CR-MP-01: Chuyển TravelAI từ web sang Web/Android/iOS**, ghi yêu cầu, lý do, ảnh hưởng và người quyết định. Mã `CR-MP-01` chỉ là đề xuất nội bộ, không phải issue có sẵn.
4. Trong Project, ở cuối bảng hoặc nhóm, chọn **+ → Create new issue**. Chọn đúng repository chứa mã cần làm, nhập tiêu đề/mô tả, chọn assignee và nhấn **Create**. Nếu chỉ nhập ý tưởng vào dòng thêm item, đó có thể là **draft**; mở menu của draft và chọn **Convert to issue**, sau đó chọn repository. Xem [hướng dẫn thêm item](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project) và [chuyển draft thành issue](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/converting-draft-issues-to-issues).
5. Nếu Project cho phép và các thành viên có quyền phù hợp, đưa issue của repo mới vào **cùng Project** để nhìn thấy cả WBS cũ và task chuyển đổi. Nếu không chọn được repo mới, nhờ chủ Project/owner kiểm tra quyền và cấu hình; không cần xóa board cũ.
6. Nhập các cột tương ứng với board: **Assignees**, **Status**, **Sprint/Iteration**, **Priority/MVP**, **Estimate**, ngày bắt đầu/kết thúc, module và link issue/PR liên quan. Tên cột thực tế phụ thuộc cấu hình Project. Giữ nguyên ngày sprint lịch sử; thời gian và effort cho task mới phải do nhóm ước lượng, không ghi thành số liệu thực tế nếu chưa có.
7. Dùng `Todo → In Progress → Review → Done` theo đúng trạng thái thật. Chỉ đặt `Done` khi tiêu chí và bằng chứng được nhóm kiểm tra. Nếu board hiện không có `Review`, thêm trạng thái nếu nhóm có quyền hoặc ghi rõ bước review trong issue; không cần giả định board đã có cột này.

**Phân quyền repository mới:** lúc kiểm tra, danh sách collaborator của `ngoctapcodee/travel-ai-system` chỉ hiện `ngoctapcodee`. Nếu nhóm muốn `AtelierMizumi` và `Duchayslay` cùng push/được phân công thuận tiện, chủ repo mới có thể vào **Settings → Collaborators → Add people** và mời hai tài khoản; họ cần chấp nhận lời mời. Cấp quyền ghi là quyết định của chủ repo. Người được gán issue cũng có thể thuộc các trường hợp khác do GitHub hỗ trợ, như người đã bình luận issue; xem [quy định phân công](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/assigning-issues-and-pull-requests-to-other-github-users) và [mời collaborator](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository).

## 3. Cấu trúc WBS bổ sung — đề xuất

Giữ WBS 1.1–1.8 cũ và thêm gói chuyển đổi, sau khi nhóm/chủ dự án đồng ý cập nhật phạm vi. Tên/mã sau là **đề xuất**, không phải mã đã tồn tại trên GitHub:

```text
1.9 Chuyển đổi TravelAI sang đa nền tảng
├── 1.9.1 Giao diện và điều hướng Web/Android/iOS          → ngoctapcodee
├── 1.9.2 Tích hợp nghiệp vụ, tài khoản và dữ liệu        → Duchayslay
├── 1.9.3 Nhận diện AI và quyền thiết bị                  → AtelierMizumi
└── 1.9.4 Tích hợp, kiểm thử, CI/CD và bàn giao           → AtelierMizumi điều phối; cả nhóm tham gia
```

Đây là các **work package theo kết quả bàn giao**. Mỗi gói nên được nhóm ước lượng sao cho một người/cặp có thể thực hiện khoảng 1–2 tuần; 12 task nhỏ bên dưới có thể là issue con hoặc checklist. Đối chiếu tránh tính trùng với #4–#24: task chuyển đổi mô tả phần *kiểm chứng/điều chỉnh cho phiên bản mới*, còn issue cũ giữ lịch sử web cũ. Nếu Project chưa hỗ trợ sub-issues, liên kết issue mới với issue cũ trong mô tả bằng URL đầy đủ.

## 4. Đề xuất 12 task để thêm vào board

Các mã `MP-01…MP-12` chỉ dùng để trao đổi trong bản nháp; **GitHub sẽ tự cấp số issue mới**. Ưu tiên `Must/Should` là đề xuất, không phải giá trị đã duyệt. Các task mặc định `Todo` **nếu phần nghiệm thu/tồn đọng thực sự chưa làm**; nếu đã làm, ghi bằng chứng và trạng thái thật.

| Mã | Tiêu đề issue đề xuất | Người phụ trách đề xuất | Liên hệ WBS cũ | Ưu tiên |
| --- | --- | --- | --- | --- |
| MP-01 | Giao diện và điều hướng Web/Android/iOS | `ngoctapcodee` | [#5](https://github.com/AtelierMizumi/TravelAI/issues/5), [#9](https://github.com/AtelierMizumi/TravelAI/issues/9) | Must |
| MP-02 | Hồ sơ, cài đặt và ảnh đại diện đa nền tảng | `ngoctapcodee` | [#5](https://github.com/AtelierMizumi/TravelAI/issues/5) | Must |
| MP-03 | Bảng tin cộng đồng và tương tác đa nền tảng | `ngoctapcodee` | [#15](https://github.com/AtelierMizumi/TravelAI/issues/15) | Must |
| MP-04 | Dashboard, chuông thông báo và animation | `ngoctapcodee` | [#17](https://github.com/AtelierMizumi/TravelAI/issues/17), [#16](https://github.com/AtelierMizumi/TravelAI/issues/16) | Should |
| MP-05 | Xác thực phiên và khôi phục mật khẩu qua email | `Duchayslay` | [#4](https://github.com/AtelierMizumi/TravelAI/issues/4) | Must |
| MP-06 | Đặt chỗ, thanh toán và lịch sử **SIMULATED** | `Duchayslay` | [#12](https://github.com/AtelierMizumi/TravelAI/issues/12), [#21](https://github.com/AtelierMizumi/TravelAI/issues/21) | Must |
| MP-07 | Hủy, hoàn tiền và đổi lịch **SIMULATED** | `Duchayslay` | [#13](https://github.com/AtelierMizumi/TravelAI/issues/13) | Must |
| MP-08 | Tin nhắn WebSocket và dữ liệu chat | `Duchayslay` | [#16](https://github.com/AtelierMizumi/TravelAI/issues/16) | Should |
| MP-09 | Đặc tả thay đổi và kiến trúc đa nền tảng | `AtelierMizumi` | [#1](https://github.com/AtelierMizumi/TravelAI/issues/1), [#2](https://github.com/AtelierMizumi/TravelAI/issues/2), [#3](https://github.com/AtelierMizumi/TravelAI/issues/3) | Must |
| MP-10 | AI nhận diện ảnh và quyền camera trên thiết bị | `AtelierMizumi` | [#6](https://github.com/AtelierMizumi/TravelAI/issues/6), [#7](https://github.com/AtelierMizumi/TravelAI/issues/7), [#8](https://github.com/AtelierMizumi/TravelAI/issues/8) | Must |
| MP-11 | Điều chỉnh Docker/CI cho repo đa nền tảng | `AtelierMizumi` | [#24](https://github.com/AtelierMizumi/TravelAI/issues/24), [PR #42](https://github.com/AtelierMizumi/TravelAI/pull/42) | Should |
| MP-12 | Kiểm thử tích hợp, bằng chứng và bàn giao | `AtelierMizumi` điều phối, cả nhóm phối hợp | [#23](https://github.com/AtelierMizumi/TravelAI/issues/23), [#24](https://github.com/AtelierMizumi/TravelAI/issues/24) | Must |

### Nội dung ngắn để sao chép vào từng issue

**MP-01 — Giao diện và điều hướng Web/Android/iOS**  
Mô tả: rà soát giao diện Expo dùng chung, đường dẫn và tương tác trên Web/Android/iOS.  
Nghiệm thu: các trang chính mở đúng; nút hoạt động; không che nội dung ở kích thước màn hình đã kiểm tra; có ảnh/chứng cứ kiểm thử theo từng nền tảng.

**MP-02 — Hồ sơ, cài đặt và ảnh đại diện đa nền tảng**  
Mô tả: kiểm tra hồ sơ, cài đặt, chọn ảnh từ thiết bị và lưu qua API.  
Nghiệm thu: chỉ chủ tài khoản sửa hồ sơ của mình; ảnh chọn từ thiết bị được hiển thị/lưu đúng; xử lý từ chối quyền hoặc file sai.

**MP-03 — Bảng tin cộng đồng và tương tác đa nền tảng**  
Mô tả: kiểm tra bài viết, ảnh, nút biểu tượng thích/bình luận/chia sẻ, theo dõi và trạng thái duyệt qua backend.  
Nghiệm thu: dữ liệu lấy từ API, không tự sinh bài mẫu; thao tác được ghi nhận và hiển thị lỗi nếu API thất bại.

**MP-04 — Dashboard, chuông thông báo và animation**  
Mô tả: kiểm tra số liệu dashboard, chuông thông báo và hiệu ứng xuất hiện/cuộn trên các màn hình.  
Nghiệm thu: thông báo và số liệu khớp API; không mất nội dung khi giảm chuyển động; kiểm tra log cảnh báo và ghi kết quả thực tế.

**MP-05 — Xác thực phiên và khôi phục mật khẩu qua email**  
Mô tả: nghiệm thu đăng ký/đăng nhập, phiên, vai trò và luồng gửi mã → xác nhận mã → đổi mật khẩu TravelAI.  
Nghiệm thu: mã đúng mới được đổi mật khẩu; mã sai/hết hạn/dùng lại bị từ chối; lỗi SMTP không báo gửi thành công; không yêu cầu mật khẩu Gmail của người dùng cuối.

**MP-06 — Đặt chỗ, thanh toán và lịch sử SIMULATED**  
Mô tả: nghiệm thu xem lại booking, liên kết tài khoản thử, thanh toán và lịch sử thành công/thất bại.  
Nghiệm thu: chỉ xác nhận booking sau thanh toán và cấp chỗ thành công; thất bại không trừ tiền; thao tác lặp không trừ hai lần; số tiền/thẻ được ghi rõ `SIMULATED`.

**MP-07 — Hủy, hoàn tiền và đổi lịch SIMULATED**  
Mô tả: kiểm tra chính sách hủy, đổi lịch, cutoff, lịch lễ và giải phóng tồn chỗ.  
Nghiệm thu: chính sách 65%/35%, hoàn 100% khi admin hủy vì không cung cấp được, phí đổi lịch 20% giá gốc và chênh lệch ngày lễ được xử lý theo đặc tả; lỗi thanh toán hoặc hết chỗ giữ booking cũ; không hoàn/trừ lặp.

**MP-08 — Tin nhắn WebSocket và dữ liệu chat**  
Mô tả: kiểm tra gửi/nhận, reconnect, quyền truy cập và ghi âm nếu có.  
Nghiệm thu: hai tài khoản thử chỉ xem hội thoại được phép; tin nhắn được ghi nhận và cập nhật lại sau reconnect; kiểm tra nội dung được mã hóa khi lưu; không mô tả đó là mã hóa đầu cuối.

**MP-09 — Đặc tả thay đổi và kiến trúc đa nền tảng**  
Mô tả: lập CR-MP-01, cập nhật charter/WBS và sơ đồ hiện trạng.  
Nghiệm thu: ghi rõ phạm vi, người duyệt, ảnh hưởng thời gian/nguồn lực, backend và PostgreSQL dùng chung, FastAPI riêng; lưu quyết định và liên kết tới repo/board thực tế.

**MP-10 — AI nhận diện ảnh và quyền camera trên thiết bị**  
Mô tả: kiểm tra chọn/chụp, sự đồng ý gửi ảnh, Vision API, xử lý sai/hết hạn mức và quét khung hình nếu được bật.  
Nghiệm thu: có bộ ảnh và kết quả lưu thật, biết phân biệt “dự đoán” với “không xác định”; kiểm tra quyền camera, lỗi API và Web/thiết bị khả dụng. Không tự nhận AI chính xác 100%.

**MP-11 — Điều chỉnh Docker/CI cho repo đa nền tảng**  
Mô tả: đọc PR #42 repo cũ, đánh giá phần tái sử dụng rồi điều chỉnh cho cấu trúc Expo/Spring Boot/FastAPI mới.  
Nghiệm thu: lệnh build/test chạy ở môi trường nhóm xác định; pipeline hiển thị kết quả; secrets nằm ngoài mã; ghi rõ đã triển khai cloud hay chưa. Không đóng chỉ vì PR #42 cũ đã merge.

**MP-12 — Kiểm thử tích hợp, bằng chứng và bàn giao**  
Mô tả: tổng hợp E2E trọng yếu, kiểm thử nền tảng, README, board, rủi ro, retrospective và xác nhận nghiệm thu.  
Nghiệm thu: có kết quả thực tế từng môi trường, hạn chế còn lại, hướng dẫn chạy và người xác nhận. Không tự tạo log/số giờ hay xác nhận nghiệm thu giả.

## 5. Gợi ý sprint và thứ tự phụ thuộc

Ảnh cho thấy Sprint 5 có mốc 02–15/11/2026 và Sprint 6 có mốc 16–29/11/2026; kiểm tra lại iteration trong Project trước khi dùng. Đây là **kế hoạch đề xuất**, không phải ghi nhận quá khứ hay cam kết đã được duyệt.

- **Phần còn lại Sprint 5, dự kiến:** MP-09 chốt thay đổi; MP-01/02/05/06/10 rà soát luồng cốt lõi. Nhóm chọn lượng việc theo năng lực thực tế.
- **Sprint 6, dự kiến:** tiếp tục MP-03/04/07/08; MP-11 điều chỉnh CI/Docker; MP-12 tổng hợp kiểm thử và bàn giao. Nếu deadline môn khác, điều chỉnh theo thông báo giảng viên.
- **Phụ thuộc:** MP-09 xác định phạm vi trước; MP-05/06 và MP-10 cần môi trường/API; MP-07 cần nền booking; MP-12 tổng hợp bằng chứng từ các task. MP-11 cần xác định repo và cấu trúc chạy mới.
- Ghi estimate sau khi cả nhóm thảo luận; không sử dụng thời gian đề xuất như giờ thực tế. Khi có thay đổi, cập nhật scope và theo dõi burnup để thấy tổng phạm vi thay đổi.

## 6. Gợi ý 1–2 vấn đề cho từng người

**Cách dùng:** đây là các sự việc/hạn chế có căn cứ từ mã nguồn, log hoặc trao đổi đã cung cấp, được **gán người phụ trách theo đề xuất**. Chưa có bằng chứng khẳng định chính thành viên đó đã trực tiếp gặp hoặc sửa chúng. Trước khi đưa vào báo cáo theo ngôi “em đã…”, từng thành viên phải xác nhận đóng góp và cung cấp commit, PR, log hoặc ảnh thật. Nếu không xác nhận được, viết là “nhóm phát hiện” hoặc không sử dụng.

### `ngoctapcodee` — giao diện/cộng đồng

1. **Nút đăng ký từng không bấm được** — người dùng đã phản ánh trong trao đổi; giao diện đăng nhập hiện có nút chuyển sang đăng ký. Phân công đề xuất: kiểm thử lại Web và thiết bị, ghi ảnh/kết quả. Không suy ra ai đã trực tiếp sửa chỉ từ việc task được gán.
2. **Cảnh báo Reanimated lặp lại khi nhiều hiệu ứng dùng chung thuộc tính** — log người dùng gửi có cảnh báo `transform`/`opacity`; mã đã được tách lớp animation. Cần kiểm tra log bản đang chạy và so sánh trước/sau, không khẳng định đã hết mọi cảnh báo nếu chưa đo.

### `Duchayslay` — backend/đặt chỗ

1. **Gmail từ chối xác thực SMTP, người dùng không nhận được mã** — log đã có `MailAuthenticationException`; sau khi cấu hình đúng mật khẩu ứng dụng Gmail, người dùng xác nhận đã nhận thư thử. Mã mới kiểm tra kết nối và báo lỗi. Phân công đề xuất: bổ sung case lỗi/mã hết hạn; khi chụp bằng chứng phải che mã, email nhạy cảm và mọi mật khẩu.
2. **Luồng thanh toán web cũ lưu booking ở `localStorage`** — đây là hạn chế quan sát được trong [Payment.jsx của snapshot web cũ](https://github.com/ngoctapcodee/ai/blob/c2ee6fa3949a7c76462073862bb82c71b69392f1/frontend/src/pages/Booking/Payment.jsx), không tự chứng minh `Duchayslay` là người gặp. Bản mới có backend/database và giao dịch mô phỏng; cần nghiệm thu đồng thời, thất bại và idempotency.

### `AtelierMizumi` — kiến trúc/AI/tích hợp

1. **Backend không khởi động do class Java khác phiên bản runtime** — log thực tế có `UnsupportedClassVersionError` khi class biên dịch mới hơn Java đang chạy; script đã tách thư mục build theo JDK và đã khởi động thử. Phân công đề xuất: đưa kiểm tra JDK/build sạch vào CI, lưu bằng chứng log không có secrets.
2. **AI chưa xác định chính xác mọi ảnh mẫu** — lần thử 15 ảnh cho 9 tên phù hợp đối chiếu sơ bộ, 6 ảnh không xác định; ảnh chợ Bến Thành bị mô tả chung. Xem [báo cáo ảnh](kiem-thu-anh-ai-2026-11-08.md). Đây là hạn chế cần đánh giá thêm, không phải bằng chứng độ chính xác chung và không chứng minh riêng một thành viên đã gây ra.

### Hai vấn đề chung cho nhóm — cần ba thành viên xác nhận trước khi ghi nhận

1. **Thay đổi phạm vi web → đa nền tảng:** yêu cầu mở rộng làm ảnh hưởng thiết kế, kiểm thử, thời gian và thiết bị; lập CR-MP-01, cập nhật charter/WBS/risk register, ghi ngày và người duyệt thật. Đây là **thay đổi phạm vi đã được yêu cầu**, không tự khẳng định cả ba đã tham gia xử lý nếu chưa xác nhận.
2. **Lịch sử Git/board và môi trường bị phân tách:** board cũ gắn repo `AtelierMizumi/TravelAI`, repo mới có lịch sử riêng; PR #42 repo cũ đã merge nhưng issue #24 vẫn mở và file CI/Docker chưa có trong snapshot repo mới. Nhóm cần đối chiếu bằng chứng, thống nhất repo nộp và quy tắc cập nhật status. Không coi PR cũ tự chứng minh CI của repo mới đã hoạt động.

**Phân biệt rủi ro và lỗi:** lỗi đã xảy ra ghi vào issue tracker với biểu hiện, nguyên nhân xác thực, xử lý, trạng thái và bằng chứng. Rủi ro chưa xảy ra ghi vào risk register với điều kiện → sự kiện → ảnh hưởng, dấu hiệu cảnh báo, xác suất/tác động do nhóm đánh giá, phương án, người phụ trách và thời điểm cập nhật. Không biến dự đoán thành sự việc đã xảy ra.

## 7. Mẫu nội dung báo cáo thay đổi phạm vi

> Nhóm tiếp nhận yêu cầu mở rộng TravelAI từ giao diện web sang ứng dụng dùng chung mã nguồn cho Web, Android và iOS. Thay đổi làm tăng phạm vi kiểm thử giao diện, quyền thiết bị, kết nối API và đóng gói. Nhóm đề xuất cập nhật charter, WBS, backlog và risk register, đồng thời giữ lại lịch sử của phiên bản web để truy vết. Kiến trúc tại thời điểm đối chiếu gồm backend Spring Boot dùng PostgreSQL và FastAPI AI riêng; chưa tuyên bố đã tách toàn bộ nghiệp vụ thành microservice. Các luồng thanh toán và hoàn tiền trong phạm vi hiện tại là **SIMULATED**.

Thay/điền theo hồ sơ thật trước khi nộp:

| Trường CR-MP-01 | Nội dung cần điền thật |
| --- | --- |
| Ngày yêu cầu / người yêu cầu | `[Nhóm xác nhận theo trao đổi thực tế]` |
| Người đánh giá / phê duyệt | `[Tên và bằng chứng quyết định thực tế]` |
| Phạm vi thêm/bớt | `[Danh sách được nhóm và stakeholder đồng ý]` |
| Ảnh hưởng thời gian/chi phí/nguồn lực | `[Số liệu ước lượng và thực tế có căn cứ; chưa có thì ghi chưa xác định]` |
| Quyết định và ngày | `[Được duyệt / chưa duyệt; không tự điền]` |
| Tài liệu/issue được cập nhật | `[Link Project, issue, PR, risk register và biên bản]` |

## 8. Bằng chứng cần chuẩn bị cho báo cáo cuối kỳ

Theo tài liệu môn, cần báo cáo tổng hợp và bằng chứng thật. Gợi ý checklist, **không đánh dấu hoàn thành khi chưa có**:

- [ ] Project charter và phạm vi trước/sau thay đổi; CR-MP-01 có người duyệt thật.
- [ ] WBS/backlog cập nhật, assignee, estimate, sprint, issue/PR và trạng thái thật.
- [ ] Link cả repo cũ lẫn repo mới, PR/commit thực tế và giải thích repo mới được tạo với lịch sử sạch để tránh đưa lại khóa cũ. **Không bịa commit hoặc tác giả.**
- [ ] Board export/lịch sử Sprint 1 và Sprint 2, không chỉ một ảnh trạng thái cuối.
- [ ] Risk register cập nhật tối thiểu theo các mốc môn học; ghi rủi ro, chủ trì, phản ứng, trigger và thay đổi trạng thái thực tế.
- [ ] Retrospective Sprint 1 và retrospective cuối dự án, dựa trên việc nhóm thực sự đã thảo luận.
- [ ] Minh chứng sử dụng AI thật: prompt/output phù hợp đã loại bí mật, người kiểm tra và bài học; con người chịu trách nhiệm với phần mã mình chấp nhận.
- [ ] Bằng chứng test: ngày chạy, commit, nền tảng, kết quả và lỗi còn lại; test Android/iOS thật ghi đúng thiết bị đã dùng.
- [ ] Burndown/burnup hoặc PV/EV/AC từ **lịch sử board và số liệu thật**; nếu chưa có thì ghi chưa có, không tự tạo số giờ/biểu đồ.
- [ ] Hướng dẫn chạy, giới hạn sản phẩm và xác nhận nghiệm thu của stakeholder thật; không tự tạo chữ ký hay biên bản.

## 9. Tài liệu tham khảo

- Slide môn: Week 03 Scope/WBS, Week 05 Agile/Scrum, Week 06 Risk/Quality, Week 07 Resources/Team, Week 09–10 AI, Week 11 Change Management, Week 12 Monitoring, Week 13 Closure và Week 14 Report Finalization. Tuần 04 không được cung cấp trong bộ file hiện tại; không tự suy diễn nội dung hoặc lịch.
- [GitHub: Adding items to a project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project).
- [GitHub: Converting draft issues](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/converting-draft-issues-to-issues).
- [GitHub: Assigning issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/assigning-issues-and-pull-requests-to-other-github-users).
- [GitHub: Inviting collaborators](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository).
- [Bản so sánh WBS và mã nguồn](WBS_SO_SANH_VA_DE_XUAT.md), [hướng dẫn chạy](../HUONG_DAN_CHAY.md), [mô hình database](database-hien-tai.md).
