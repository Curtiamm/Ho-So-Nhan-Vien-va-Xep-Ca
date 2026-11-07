# Hiến chương dự án Hồ sơ nhân viên & Xếp ca (DT05)

> Bản dịch tiếng Việt của `.specify/memory/constitution.md`. Bản tiếng Anh là bản gốc; nếu có
> khác biệt, bản tiếng Anh được ưu tiên.

Dự án: quản lý hồ sơ nhân viên kèm giấy tờ có thời hạn và các khóa đào tạo bắt buộc, lập lịch ca
theo nhu cầu từng chi nhánh, tự kiểm tra luật giờ làm của Đức, cho nhân viên xem lịch và đề nghị
đổi ca, dành cho một chuỗi nhà hàng (hoặc một nhà hàng) ở Đức.

## Nguyên tắc cốt lõi

### I. Tuân thủ ngay từ thiết kế (KHÔNG THƯƠNG LƯỢNG)

Mọi thay đổi đưa một người vào ca PHẢI đi qua cùng một bộ kiểm tra tuân thủ (validator): xếp tay,
gợi ý của solver, nhận ca trống, duyệt đổi ca và công bố lịch.

- Luật cứng (giới hạn theo luật ArbZG, JArbSchG, MuSchG, AufenthG và cổng điều kiện ở Nguyên tắc II)
  PHẢI chặn thay đổi. Không vai trò, API, chức năng import hay tác vụ hàng loạt nào được bỏ qua.
- Luật mềm (nhu cầu nhân sự, công bằng, nguyện vọng, chính sách công ty, các điều luật chỉ "nên"
  như ArbZG §11(4)) CHỈ được bỏ qua bởi Quản lý chi nhánh hoặc Admin, kèm lý do bằng văn bản; việc
  bỏ qua được ghi vào nhật ký kiểm toán (audit log).
- Lịch còn bất kỳ vi phạm cứng nào thì KHÔNG được công bố.
- Đổi ca PHẢI kiểm tra lại cả hai nhân viên theo toàn bộ luật của họ và PHẢI có quản lý duyệt; nhân
  viên không thể tự thỏa thuận để bỏ qua giới hạn của luật.
- Validator PHẢI chạy ở server; kiểm tra phía client chỉ để tiện lợi.

Lý do: đề bài yêu cầu không xếp ca người chưa đủ điều kiện và cân bằng nhu cầu chi nhánh với luật
giờ làm. Vi phạm ArbZG bị phạt tới 30.000 EUR mỗi lần (§22), làm việc với thực phẩm khi chưa có
giấy chứng nhận IfSG tới 25.000 EUR (IfSG §73), thuê người không có giấy phép lao động hợp lệ tới
500.000 EUR (SGB III §404).

### II. Đủ điều kiện rồi mới xếp ca (KHÔNG THƯƠNG LƯỢNG)

Nhân viên chỉ đủ điều kiện nhận ca khi mọi yêu cầu gắn với vai trò của ca, chi nhánh và nhóm nhân
viên đều có và còn hiệu lực vào ngày của ca. Các yêu cầu ban đầu:

- Giấy chứng nhận §43 IfSG (Belehrung của Gesundheitsamt – buổi hướng dẫn của cơ quan y tế) cho ai
  tiếp xúc thực phẩm: bếp, rửa bát, và nhân viên phục vụ/quầy bar có chạm vào đồ ăn không đóng gói.
  Khi bắt đầu làm lần đầu, giấy KHÔNG được cũ hơn 3 tháng; sau đó không hết hạn. Chủ phải hướng dẫn
  lại theo §43(4) IfSG khi bắt đầu và mỗi 2 năm.
- Trẻ dưới 15 tuổi và người còn trong diện bắt buộc đi học toàn thời gian KHÔNG được xếp ca
  (chưa mô hình hóa Kinderarbeitsschutzverordnung).
- Nhân viên dưới 18 tuổi: khám sức khỏe ban đầu (JArbSchG §32, không cũ hơn 14 tháng); nếu không
  nộp kết quả khám lại (§33) trong vòng 14 tháng kể từ khi bắt đầu thì không được làm tiếp.
- Nhân viên ngoài EU: giấy cư trú còn hiệu lực cho phép làm công việc này (AufenthG §4a); sinh viên
  ngoài EU còn bị giới hạn 140 ngày làm việc mỗi năm (AufenthG §16b(3)).
- Thời gian bảo vệ thai sản (MuSchG §3) khiến nhân viên không đủ điều kiện trong suốt thời gian đó.
- Các yêu cầu khác doanh nghiệp tự cấu hình (ví dụ đào tạo vệ sinh thực phẩm hằng năm theo LMHV §4,
  hướng dẫn an toàn hằng năm theo DGUV Vorschrift 1 §4), là cứng hay mềm tùy cấu hình.

Hiệu lực PHẢI được xét theo ngày của ca, không theo ngày hôm nay. Hệ thống PHẢI cảnh báo trước khi
hết hạn (mặc định 30 ngày, cấu hình được) và PHẢI cho biết vì sao một người không đủ điều kiện. Luật
về độ phủ (ví dụ mỗi ca của chi nhánh có ít nhất một người sơ cứu đã đào tạo, DGUV Vorschrift 1 §26)
được xét theo từng ca, không theo từng nhân viên.

### III. Luật là dữ liệu có phiên bản và có nguồn

Giới hạn pháp lý và hợp đồng KHÔNG được viết cứng thành hằng số trong logic nghiệp vụ.

- Mỗi luật được lưu dưới dạng dữ liệu gồm: loại luật, tham số, nguồn pháp lý (luật và §), phạm vi
  (quốc gia, bang, chi nhánh, loại hợp đồng, nhóm nhân viên, thỏa ước tập thể), mức độ (cứng/mềm) và
  thời gian hiệu lực (từ ngày / đến ngày).
- Một ca luôn được kiểm tra theo phiên bản bộ luật có hiệu lực vào ngày của ca.
- Thay đổi giới hạn (cải cách ArbZG, lương tối thiểu hay mức Minijob mới, thỏa ước tập thể) PHẢI làm
  được bằng cách thêm phiên bản bộ luật mới, không sửa code, miễn là loại luật đã tồn tại.
- Mọi sai khác so với mặc định của luật (ví dụ 10 Chủ nhật thay vì 15, nghỉ 9 giờ) PHẢI dẫn chiếu
  thỏa ước tập thể hoặc thỏa thuận nội bộ cho phép điều đó.
- Mô hình giờ tối đa theo tuần của ArbZG mới là dự thảo tính đến tháng 11/2026 (chưa thành luật).
  CHỈ được cài đặt như một chế độ tắt sẵn, muốn bật phải lưu dẫn chiếu thỏa ước tập thể.
- Ngày lễ PHẢI lấy theo bang (và thành phố nếu cần) nơi chi nhánh đặt.

### IV. Một mô hình ràng buộc, ba chế độ lập lịch

Xếp tay, tự gợi ý lịch và kiểm tra PHẢI dùng chung một mô hình ràng buộc.

- Ràng buộc Timefold ánh xạ theo mức độ: luật cứng → điểm hard; nhu cầu nhân sự chưa đủ → điểm
  medium; công bằng và nguyện vọng → điểm soft.
- Kết quả solver chỉ là đề xuất, không phải quyết định. Nó PHẢI được kiểm tra lại bằng cùng
  validator dùng cho xếp tay trước khi hiển thị là hợp lệ; người lập lịch PHẢI chấp nhận, sửa hoặc
  từ chối được từng phân công đề xuất.
- Solver PHẢI giữ nguyên các phân công đã ghim (xếp tay cố định).
- Validator PHẢI hoạt động độc lập với solver, để xếp tay vẫn chạy khi solver chậm, bị tắt hoặc
  lỗi. Việc giải PHẢI chạy bất đồng bộ với giới hạn thời gian cấu hình được.

### V. Quyết định giải thích được và nhật ký kiểm toán đầy đủ

- Mỗi vi phạm và mỗi trường hợp không đủ điều kiện PHẢI nêu: tên luật, nguồn pháp lý hoặc chính
  sách (kèm §), nhân viên và (các) ca liên quan, giá trị đo được so với giới hạn, và ít nhất một gợi
  ý sửa nếu suy ra được.
- Thông báo PHẢI có bằng tiếng Đức, tiếng Anh và tiếng Việt (Nguyên tắc VIII).
- Những việc sau PHẢI ghi vào audit log chỉ-ghi-thêm với người thực hiện, thời điểm, giá trị
  trước/sau và lý do: phân công, bỏ qua cảnh báo, yêu cầu và quyết định đổi ca, công bố lịch và sửa
  sau khi công bố, thay đổi giấy tờ và đào tạo, thay đổi bộ luật.
- Giờ làm thực tế (bắt đầu, kết thúc, thời lượng) PHẢI ghi được cho từng ca và kiểm tra lại được
  theo luật: nhà hàng phải ghi chậm nhất cuối ngày thứ 7 và lưu 2 năm (MiLoG §17 cùng SchwarzArbG
  §2a; ArbZG §16(2); BAG 1 ABR 22/21).

### VI. Bộ luật viết test trước (KHÔNG THƯƠNG LƯỢNG)

- Mỗi loại luật PHẢI có test tự động viết trước hoặc cùng lúc với code, tối thiểu gồm: đúng bằng
  giới hạn, vượt một phút, ca qua nửa đêm, ca gãy (chia nhiều đoạn), lúc chuyển giờ mùa hè/đông
  Europe/Berlin, cửa sổ trượt (ngày, tuần, hai tuần, tháng, kỳ tính trung bình, năm dương lịch) và
  ranh giới giữa các phiên bản bộ luật.
- Thời gian PHẢI lưu dạng thời điểm UTC kèm múi giờ chi nhánh (Europe/Berlin) và tính bằng
  `java.time` (`Instant`, `ZonedDateTime`); KHÔNG dùng `LocalDateTime` để tính thời lượng.
- Solver PHẢI có test trên bộ dữ liệu nhỏ cố định chứng minh nó không bao giờ trả về phân công mà
  validator coi là vi phạm cứng.
- Pull request sửa logic luật KHÔNG được merge khi còn test luật nào lỗi.

### VII. Bảo vệ dữ liệu ngay từ thiết kế (DSGVO)

- Chỉ lưu tối thiểu để quyết định điều kiện: loại giấy tờ, ngày cấp và ngày hết hạn, trạng thái xác
  minh và người xác minh. Chỉ giữ bản scan/bản sao khi luật bắt chủ phải giữ (giấy chứng nhận §43
  IfSG, bản sao giấy phép theo AufenthG §4a(5), giấy khám sức khỏe theo JArbSchG §41) và chỉ vai trò
  được phép mới xem.
- Dữ liệu nhạy cảm (GDPR Điều 9) PHẢI rút gọn thành cờ bảo vệ có thời hạn, ví dụ "áp dụng MuSchG",
  "được duyệt làm đêm đến 22:00", "miễn làm thêm giờ theo SGB IX §207"; không lưu chẩn đoán hay chi
  tiết y tế.
- Cơ sở pháp lý là GDPR Điều 6(1)(b)/(c) và Điều 9(2)(b); KHÔNG được dẫn BDSG §26(1) làm cơ sở
  (EuGH C-34/21; BAG 8 AZR 209/21).
- Mỗi loại dữ liệu cá nhân PHẢI có quy tắc lưu giữ và xóa (ví dụ bản ghi giờ làm ít nhất 2 năm; giấy
  khám của người chưa thành niên trả lại khi nghỉ việc, JArbSchG §41). Nhân viên PHẢI xem được hồ sơ
  của chính mình.
- Phân quyền theo vai trò PHẢI giới hạn dữ liệu theo nhu cầu: Admin (văn phòng chính), Quản lý chi
  nhánh (chỉ chi nhánh mình), Nhân viên (dữ liệu và lịch của chính mình).
- Dữ liệu phát triển và demo PHẢI là dữ liệu giả; không đưa dữ liệu cá nhân thật vào repository.

### VIII. Ba ngôn ngữ mặc định (DE / EN / VI)

- Giao diện PHẢI hỗ trợ tiếng Đức, tiếng Anh và tiếng Việt. Mọi chuỗi hiển thị PHẢI lấy từ message
  bundle; không viết cứng chữ trong UI. Một tính năng chưa xong nếu chưa có key ở cả ba ngôn ngữ.
- Ngày, giờ và số PHẢI định dạng theo ngôn ngữ đang chọn; tuần bắt đầu từ thứ Hai.
- Thuật ngữ pháp lý tiếng Đức (ví dụ Ruhezeit, Belehrung nach §43 IfSG) PHẢI hiển thị kèm từ gốc
  tiếng Đức bên cạnh bản dịch.
- Tài liệu dự án viết bằng tiếng Anh là bản gốc, kèm bản dịch tiếng Việt và tiếng Đức. Nếu bản dịch
  khác nhau, bản tiếng Anh được ưu tiên.

## Nền tảng pháp lý (bộ luật khởi tạo 2026-11)

Đây là giá trị mặc định theo luật dùng để khởi tạo phiên bản bộ luật `2026-11`. Chúng là dữ liệu,
không phải code (Nguyên tắc III). Nguồn: báo cáo nghiên cứu "Luật xếp ca nhà hàng Đức" (11/2026).
Các giá trị PHẢI được đối chiếu lại với văn bản chính thức trước khi dùng thật.

| Mảng | Luật mặc định (nhà hàng, không có thỏa ước tập thể) | Nguồn | Mức độ |
|------|------------------------------------------------------|-------|--------|
| Giờ tối đa/ngày | 8 giờ mỗi Werktag (thứ Hai–thứ Bảy); tới 10 giờ nếu trung bình ≤ 8 giờ trong 6 tháng / 24 tuần | ArbZG §3 | Cứng: trần 10 giờ; trung bình 8 giờ: cảnh báo đến khi hết kỳ |
| Nghỉ giữa ca | ≥ 30 phút nếu > 6 giờ, ≥ 45 phút nếu > 9 giờ; mỗi đoạn ≥ 15 phút; không làm quá 6 giờ liền | ArbZG §4 | Cứng |
| Nghỉ giữa 2 ca | 11 giờ; nhà hàng được 10 giờ nếu bù bằng một lần nghỉ ≥ 12 giờ trong 1 tháng / 4 tuần; sau ngày làm > 12 giờ phải nghỉ đủ 11 giờ | ArbZG §5(1)(2), §7(9) | Cứng |
| Làm đêm | Giờ đêm 23:00–06:00; người làm đêm 8 giờ/ngày, 10 giờ chỉ khi bù trung bình trong 1 tháng / 4 tuần | ArbZG §2, §6 | Cứng |
| Chủ nhật | ≥ 15 Chủ nhật nghỉ mỗi năm (≥ 10 chỉ khi có thỏa ước); ngày nghỉ bù trong 2 tuần (Chủ nhật) / 8 tuần (ngày lễ) | ArbZG §11, §12 | Cứng |
| Nghỉ bù + 11 giờ | Ngày nghỉ bù nên nối liền với 11 giờ nghỉ | ArbZG §11(4) | Mềm |
| Ca gãy | Được phép; cộng mọi đoạn vào giới hạn ngày; tính nghỉ từ đoạn cuối | ArbZG §3, §5 (còn tranh cãi) | Cứng (phần cộng dồn) |
| Dưới 18 tuổi | 8 giờ/ngày, 40 giờ/tuần, 5 ngày/tuần; nghỉ 30/60 phút; Schichtzeit 11 giờ ở nhà hàng; nghỉ 12 giờ giữa ca; 06:00–20:00 (≥ 16 tuổi: đến 22:00); ≥ 2 Chủ nhật nghỉ/tháng; cấm làm 25/12, 1/1, Chủ nhật Phục sinh, 1/5, sau 14:00 ngày 24/12 và 31/12 | JArbSchG §§8, 11–18 | Cứng |
| Thai sản | 8,5 giờ/ngày, 90 giờ/2 tuần (dưới 18: 8 giờ / 80 giờ); không làm 20:00–06:00 trừ khi được duyệt đến 22:00; Chủ nhật/lễ chỉ khi đồng ý; nghỉ 11 giờ | MuSchG §§3–6, §28 | Cứng |
| Khuyết tật nặng | Chỉ xếp làm thêm giờ nếu nhân viên chưa yêu cầu miễn | SGB IX §207 | Cứng khi có cờ |
| Minijob | Thu nhập ≤ 603 EUR/tháng năm 2026 (633 EUR năm 2027), lương tối thiểu 13,90 EUR (2026) / 14,60 EUR (2027) | SGB IV §8, MiLoG | Cảnh báo mềm theo tháng |
| Werkstudent | ≤ 20 giờ/tuần trong học kỳ (ngoại lệ: kỳ nghỉ, buổi tối/cuối tuần) | Án lệ BSG | Cảnh báo mềm |
| Làm theo gọi | Báo ca trước ≥ 4 ngày; mỗi lần gọi tối thiểu 3 giờ | TzBfG §12 | Cứng với hợp đồng làm theo gọi |
| Báo lịch | Luật không quy định hạn; ≥ 4 ngày với làm theo gọi; mặc định công ty 14 ngày | GewO §106, thực tiễn | Mềm |

Lưu ý hội đồng nhân viên: nơi có Betriebsrat, lịch ca (BetrVG §87(1) Nr. 2/3) và bản thân phần mềm
xếp ca (§87(1) Nr. 6) cần được hội đồng đồng ý. Sản phẩm PHẢI cho phép cấu hình các bước duyệt lịch.

## Công nghệ và quy trình phát triển

- Backend: Java (bản LTS hiện hành, 21 trở lên) với Spring Boot; Timefold Solver để gợi ý lịch.
  TODO(DATABASE) và TODO(FRONTEND) sẽ chốt ở `/speckit-plan`.
- Màn hình cho nhân viên (lịch của mình, lịch rảnh, yêu cầu đổi ca) PHẢI dùng được trên trình duyệt
  điện thoại (web responsive; PWA tùy chọn).
- Kiến trúc: bộ luật và validator nằm trong module không phụ thuộc web, persistence hay solver, để
  test riêng và dùng lại cho solver.
- Quy trình mỗi tính năng: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Mỗi spec PHẢI liệt kê các luật nó động tới.
- Thứ tự phạm vi: (1) hồ sơ nhân viên, giấy tờ và điều kiện; (2) nhu cầu chi nhánh và xếp tay có
  kiểm tra trực tiếp; (3) lịch cho nhân viên và yêu cầu đổi ca; (4) tự gợi ý lịch bằng Timefold;
  (5) báo cáo công bằng và giao diện quản lý phiên bản bộ luật. Giai đoạn sau KHÔNG bắt đầu khi giai
  đoạn trước chưa qua kiểm thử nghiệm thu.
- Review code: mỗi pull request được ít nhất một thành viên khác review; CI chạy toàn bộ test trên
  mỗi pull request.
- Định nghĩa "xong": đạt tiêu chí nghiệm thu, test luật xanh, có key i18n DE/EN/VI, có ghi sự kiện
  audit, không viết cứng giá trị pháp lý, tài liệu đã cập nhật.

## Quản trị

- Hiến chương này đứng trên mọi thói quen khác của dự án. Mỗi `/speckit-plan` PHẢI có mục
  Constitution Check đối chiếu Nguyên tắc I–VIII; mọi sai lệch PHẢI giải thích ở mục Complexity
  Tracking của plan.
- Sửa đổi: đề xuất bằng pull request sửa file này cùng bản dịch VI/DE, được đa số thành viên chấp
  thuận, ghi phiên bản và ngày mới.
- Đánh số phiên bản: MAJOR khi bỏ hoặc định nghĩa lại một nguyên tắc; MINOR khi thêm nguyên tắc/mục
  hoặc mở rộng đáng kể hướng dẫn; PATCH khi sửa câu chữ, làm rõ.
- Thay đổi giá trị pháp lý thuộc về dữ liệu bộ luật, không sửa hiến chương, trừ khi nó làm đổi một
  nguyên tắc.
- Rà soát tuân thủ: người review kiểm tra pull request theo các nguyên tắc; nhóm rà lại hiến chương
  vào đầu mỗi sprint.
- Đây là dự án sinh viên, không phải tư vấn pháp lý. Giá trị pháp lý PHẢI được đối chiếu với văn bản
  chính thức (gesetze-im-internet.de) trước khi dùng thật.

**Phiên bản**: 1.0.0 | **Thông qua**: 2026-11-07 | **Sửa đổi lần cuối**: 2026-11-07
