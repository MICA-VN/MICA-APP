# Ứng dụng giao diện

## Khởi tạo và điều hướng

`src/main.jsx` tạo React root, bật `StrictMode`, nạp CSS nền và đăng ký
`public/sw.js` khi trình duyệt hỗ trợ Service Worker.

`src/App.jsx` là khung ứng dụng cấp cao. State `currentPage` có giá trị mặc định
là `home`; callback điều hướng đọc `data-page` và chỉ chấp nhận `home` hoặc
`periodic-table`. Trang được render là `Home` hoặc `PeriodicTable`. Cách làm này
thay cho router, do ứng dụng hiện chỉ có các màn hình nội bộ đơn giản.

## Thành phần dùng chung

- `Header.jsx`: thương hiệu, text logo, điều khiển tài khoản giả lập, menu di
  động và trạng thái online/offline.
- `Sidebar.jsx`: logo và các nút Trang chủ, Bảng tuần hoàn; ở thiết bị nhỏ có
  overlay để mở/đóng menu.
- `Logo.jsx`: hiển thị logo qua API SVG.
- `SvgIcon.jsx`: tải SVG theo tên/kích thước, làm mới sau khi có mạng trở lại
  và báo lỗi rõ ràng nếu tải thất bại.
- `Footer.jsx`: lấy tên, mô tả, phiên bản và tác giả từ `package.json`.
- `DebugGuard.jsx`: khi không bật `VITE_IS_DEBUG=true`, chặn menu chuột phải và
  một số phím tắt mở/công cụ devtools. Đây chỉ là hành vi giao diện phía client,
  không phải biện pháp bảo mật và không thay thế kiểm soát truy cập phía server.

CSS của các thành phần nằm trong `src/styles/components/`.

## Các trang

### Trang chủ

`src/pages/Home.jsx` giới thiệu MICA và các tính năng đang được phát triển.
Phần trình bày hiện gồm giới thiệu nền tảng và các thẻ chức năng như bảng tuần
hoàn, công cụ tính hóa học, phòng thí nghiệm ảo. CSS riêng nằm trong
`src/styles/pages/Home.css`.

### Bảng tuần hoàn

`src/pages/PeriodicTable.jsx` tạo lưới tuần hoàn, nhóm nguyên tố theo chu kỳ và
nhóm, tách hai dãy Lanthanide/Actinide, hiển thị chú giải phân loại và trạng
thái tải/lỗi/offline. Người dùng có thể chọn hoặc rê chuột lên bộ lọc theo nhóm,
chu kỳ và phân loại. Khi chọn phân loại, bảng tự cuộn đến vùng liên quan nếu
vùng đó đang ngoài khung nhìn; chuyển động tôn trọng tùy chọn giảm chuyển động
của hệ điều hành.

Chi tiết cách tải dữ liệu và quy ước bố trí nguyên tố được mô tả trong
[periodic-table.md](./periodic-table.md).

## Quy ước mở rộng giao diện

- Tạo thành phần dùng chung trong `src/components/` nếu nó có ý nghĩa ở nhiều
  trang; nếu chỉ thuộc một trang, giữ logic tại `src/pages/`.
- Đặt CSS component cạnh nhóm `components` và CSS trang dưới `pages`.
- Dùng SVG từ danh mục trong `private/svg/` qua `SvgIcon` thay vì nhúng đường dẫn
  file riêng lẻ khi cần icon có thể tải/cache tập trung.
- Duy trì thuộc tính trợ năng như `aria-label`, `aria-current`, `aria-pressed`
  và vai trò trạng thái cho tương tác mới.
