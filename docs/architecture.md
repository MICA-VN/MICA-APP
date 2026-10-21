# Kiến trúc hệ thống

MICA Chemistry là ứng dụng web xây dựng bằng React và Vite. Ứng dụng hiện có
trang chủ giới thiệu nền tảng và trang bảng tuần hoàn. Dữ liệu nguyên tố đến từ
Cloudflare Worker kết nối với Cloudflare D1; tài nguyên SVG được cung cấp qua
API tài nguyên hoặc từ các file trong repo tùy môi trường.

## Các lớp chính

### Ứng dụng giao diện

- `src/main.jsx` khởi tạo React, nạp CSS toàn cục và đăng ký Service Worker.
- `src/App.jsx` giữ trang hiện tại trong React state và hiển thị phần khung ứng
  dụng cùng trang được chọn.
- `src/components/` chứa Header, Sidebar, Footer, Logo, SvgIcon và các thành
  phần dùng chung.
- `src/pages/` chứa nội dung từng trang.
- `src/styles/` chia CSS thành kiểu toàn cục, component và page.

Điều hướng được quản lý bằng state cục bộ trong `App.jsx`; dự án hiện không dùng
React Router. Các nút trong Header và Sidebar truyền `data-page` để chọn `home`
hoặc `periodic-table`.

### Dịch vụ phía trình duyệt

- `src/services/api.js` tạo URL API.
- `src/services/periodicTableCache.js` đọc và ghi dữ liệu bảng tuần hoàn bằng
  IndexedDB.
- `src/services/svgAssets.js` đọc SVG từ `private/svg/` khi chạy máy chủ Node.
- `src/services/server.js` phục vụ build tĩnh, endpoint SVG local và chuyển tiếp
  yêu cầu bảng tuần hoàn tới Cloudflare.

### Cloudflare Worker

`cloudflare/index.js` định tuyến yêu cầu đến handler tài nguyên SVG hoặc handler
bảng tuần hoàn. `cloudflare/wrangler.toml` khai báo D1 binding `DB` và Assets
binding `ASSETS`. Chi tiết endpoint và dữ liệu nằm trong
[cloudflare-worker.md](./cloudflare-worker.md).

## Luồng yêu cầu bảng tuần hoàn

1. `PeriodicTable.jsx` tạo các yêu cầu POST với tên cột và khoảng số hàng.
2. Trình duyệt gọi Worker tại
   `https://mica-app-api.mica-vn.workers.dev/api/contents/periodic_table`.
   URL này cũng được sử dụng khi ứng dụng chạy trên localhost.
3. Worker kiểm tra phương thức, JSON, tên cột và khoảng hàng.
4. Handler truy vấn D1 bằng prepared statement, nối các bảng theo `number`.
5. Giao diện ghép các kết quả cột thành bản ghi nguyên tố theo số hiệu nguyên tử.
6. Các bản ghi nhận được được lưu vào IndexedDB để sử dụng khi ngoại tuyến.

Khi chạy giao diện local, endpoint dữ liệu vẫn phụ thuộc vào Worker đã triển
khai trên Cloudflare. Nếu bản Worker mới chưa được triển khai, ứng dụng sẽ tiếp
tục nhận hành vi từ bản đang chạy trên Cloudflare.

## Luồng tài nguyên SVG

Trong bản Worker, `cloudflare/index.js` lấy file qua Assets binding rồi dùng
`cloudflare/api/assets/svg.js` kiểm tra tham số và chuẩn hóa kích thước SVG.
Trong môi trường Vite và Express local, endpoint SVG dùng `loadSvgAsset` để đọc
từ `private/svg/`. `SvgIcon.jsx` gọi endpoint SVG và chèn markup SVG vào giao
diện sau khi tải thành công.

## Luồng ngoại tuyến

Service Worker phục vụ app shell, các file build và tài nguyên SVG đã cache.
Dữ liệu nguyên tố được lưu riêng bằng IndexedDB; các yêu cầu POST tới API không
được Service Worker cache. Xem [offline-pwa.md](./offline-pwa.md).
