# Bếp — bản trải nghiệm POS

Frontend độc lập bổ sung trên khung React/Vite của HSNV. Không thay đổi backend, dữ liệu nhân sự hoặc quy tắc xếp ca của dự án gốc.

## Chạy và kiểm tra

```sh
cd frontend
npm ci
npm test
npm run build
npm run preview -- --host 0.0.0.0 --port 5173
```

`npm run dev` dùng khi phát triển; service worker chỉ đăng ký trong bản production. Managed Preview được cấu hình ở `.hoplite/settings.json` để build và phục vụ bản production.

## Chức năng đã có

- 12 bàn mẫu trong nhà/sân vườn; gọi món theo bàn, tìm kiếm không dấu, lọc nhóm món.
- Thêm/xóa số lượng, ghi chú và topping minh họa. Bấm ảnh món để mở tùy chọn, bấm dấu cộng để thêm nhanh.
- Chuyển toàn bộ đơn sang bàn trống, gộp đơn vào bàn đích, tách các dòng món sang bàn trống. Chưa tách một phần số lượng của cùng dòng.
- Sửa giá và đánh dấu còn/hết món. Món đã gọi giữ nguyên đơn giá tại thời điểm thêm.
- Giảm theo phần trăm hoặc mã thử nghiệm `BEP10`; VAT tùy chỉnh, mặc định 8% minh họa. VAT tính sau giảm giá, làm tròn đến đồng. Cấu hình giảm giá/VAT hiện thuộc phiên màn hình, không lưu theo từng bàn.
- Ghi nhận thanh toán tiền mặt và tiền trả lại; các lựa chọn thẻ, VietQR, MoMo, ZaloPay, VNPay yêu cầu thu ngân xác nhận đã thu tiền bên ngoài. **Không tạo QR thanh toán, không gọi cổng thanh toán và không xác minh giao dịch.**
- Hóa đơn có thể in qua trình duyệt, xem lại trong báo cáo. Đây không phải hóa đơn thuế/hóa đơn điện tử hợp pháp.
- Tồn kho theo định lượng mẫu, trừ một lần khi thanh toán. Thanh toán bị chặn khi không đủ nguyên liệu. Có nhập bổ sung tồn kho và cảnh báo mức thấp. Topping dùng chung định lượng món, chưa có recipe riêng.
- Báo cáo hôm nay/7/30 ngày theo ngày địa phương, doanh thu, số hóa đơn, trung bình mỗi hóa đơn, tiền mặt, đối soát tiền thực đếm theo khoảng đã chọn.

## Offline và giới hạn dữ liệu

State phiên bản 1 lưu trong `localStorage` với khóa `restaurant-pos-state-v1`. Nếu ghi thất bại, thao tác không được cập nhật trong UI. Dữ liệu lưu sai cấu trúc bị chặn, không bị tự động ghi đè.

Bản production dùng service worker để cache giao diện, ảnh và font nội bộ. Cần truy cập online lần đầu và chờ cache hoàn tất trước khi dùng offline; cần HTTPS hoặc localhost. Offline có thể tiếp tục gọi món, tính tiền và ghi nhận thanh toán trên thiết bị. Không có khẳng định rằng mạng thanh toán bên ngoài hoạt động offline. Không xóa dữ liệu trình duyệt nếu cần giữ đơn và hóa đơn. Khi phát hành thay đổi shell, tăng phiên bản cache trong `public/sw.js`.

Chỉ dùng **một tab hoạt động, một thiết bị** cho bản trải nghiệm. Chưa có máy chủ đồng bộ, đăng nhập/phân quyền, sao lưu, xử lý xung đột nhiều thu ngân, tích hợp máy in bếp, nhật ký kiểm toán hay quy trình hoàn/hủy giao dịch. Không lưu dữ liệu khách hàng hoặc dữ liệu thẻ ngân hàng. Số liệu trong app là mẫu tổng hợp, ảnh minh họa.

Chưa triển khai: happy hour theo lịch, quản trị chiến dịch voucher, mở/đóng và báo cáo ca theo nhân viên, tiền đầu ca/thu chi, định lượng tùy chỉnh, tích hợp POS ngân hàng và API/webhook ví điện tử. Bộ kiểm tra xếp ca lao động Đức của HSNV không liên quan đến POS này. Ngôn ngữ hiện tại là tiếng Việt; chưa bổ sung bản dịch Đức/Anh cho POS.

Trước khi dùng thực tế, cần thiết kế backend giao dịch và audit, phân quyền, sao lưu/sync offline có chống ghi trùng, xác minh chính sách VAT/hóa đơn địa phương, và ký kết cấu hình merchant với nhà cung cấp thanh toán.
