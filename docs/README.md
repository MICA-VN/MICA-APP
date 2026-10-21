# Tài liệu dự án MICA Chemistry

Tài liệu trong thư mục này mô tả cấu trúc, các thành phần và cách phát triển
MICA Chemistry. Tên file dùng tiếng Anh để dễ tham chiếu trong mã nguồn; nội
dung được viết bằng tiếng Việt.

## Danh mục

- [architecture.md](./architecture.md) — Tổng quan kiến trúc và luồng dữ liệu.
- [frontend.md](./frontend.md) — Ứng dụng React, điều hướng, trang và giao diện.
- [periodic-table.md](./periodic-table.md) — Bảng tuần hoàn, tải dữ liệu, bộ lọc
  và API mà giao diện sử dụng.
- [cloudflare-worker.md](./cloudflare-worker.md) — Cloudflare Worker, D1, các
  endpoint và triển khai.
- [offline-pwa.md](./offline-pwa.md) — Service Worker, PWA, lưu dữ liệu offline
  và trạng thái kết nối.
- [assets-and-styling.md](./assets-and-styling.md) — SVG, hình ảnh, CSS và
  thiết kế giao diện.
- [development.md](./development.md) — Cài đặt, chạy, kiểm tra và quy trình phát
  triển.

## Cấu trúc thư mục chính

```text
cloudflare/                 Worker và các endpoint API
  api/assets/               Xử lý tài nguyên SVG
  api/contents/             API manifest và dữ liệu bảng tuần hoàn
    periodic-table-data.js  Truy vấn dữ liệu từ D1
  index.js                  Điểm vào Worker
  wrangler.toml             Cấu hình Worker, D1 và Assets
docs/                       Tài liệu dự án bằng tiếng Việt
private/svg/                SVG được phục vụ qua API tài nguyên
public/                     Tài nguyên web tĩnh, manifest và Service Worker
src/
  components/               Thành phần giao diện dùng chung
  pages/                    Các trang Home và PeriodicTable
  services/                 Kết nối API, lưu offline và máy chủ Express
  styles/                   CSS toàn cục, theo trang và theo thành phần
vite.config.js              Cấu hình Vite và API SVG local
package.json                Thông tin ứng dụng, script và dependencies
```

Thư mục `dist/` là đầu ra được sinh bởi lệnh build; không chỉnh sửa trực tiếp.
