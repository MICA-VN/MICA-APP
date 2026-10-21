# Phát triển và kiểm tra

## Yêu cầu

- Node.js hỗ trợ các phiên bản Vite hiện dùng trong `package.json`.
- npm để cài dependencies và chạy script.
- Tài khoản Cloudflare chỉ cần cho các thao tác xác thực như truy vấn D1 từ xa
  hoặc deploy Worker; không cần token để chạy frontend local.

## Cài dependencies

Tại thư mục gốc:

```powershell
npm install
```

## Chạy frontend local

```powershell
npm run dev
```

Vite phục vụ giao diện; SVG được đọc từ `private/svg/` qua middleware local.
API bảng tuần hoàn luôn gọi Worker Cloudflare đã triển khai, không tự chạy
Worker local và không cần `CLOUDFLARE_WORKER_URL`.

Để chạy máy chủ Express phục vụ build:

```powershell
npm run build
npm start
```

Express phục vụ `dist/`, cung cấp SVG local và chuyển tiếp POST bảng tuần hoàn
tới Cloudflare. Biến môi trường `PORT` có thể dùng để đổi cổng máy chủ.

## Các file cấu hình gốc

- `index.html` là HTML entry của Vite, đặt ngôn ngữ, tiêu đề, metadata, manifest,
  favicon và vùng mount React.
- `vite.config.js` cấu hình plugin React, middleware SVG khi chạy dev và tùy
  chọn minify của build.
- `eslint.config.js` cấu hình ESLint cho JavaScript/JSX, React Hooks và React
  Refresh; thư mục `dist/` được loại khỏi lint.
- `package.json` chứa thông tin/phiên bản ứng dụng, dependencies và các script
  chính.
- `package-lock.json` khóa phiên bản dependencies để cài đặt nhất quán.
- `.gitignore` loại trừ dependencies, build output, file log và `.env` khỏi
  Git.
- `public/.htaccess` là cấu hình fallback cho máy chủ Apache: chuyển các URL
  không khớp file/thư mục thật về `/` để ứng dụng phía client xử lý.
- `dist/` là kết quả build, có thể tạo lại bằng `npm run build`.

## Lệnh kiểm tra

```powershell
npm run lint
npm run build
node --input-type=module -e "import('./cloudflare/api/contents/periodic-table-data.js').then(({ runPeriodicTableDataTests }) => runPeriodicTableDataTests())"
```

Kiểm thử tích hợp trong module dữ liệu dùng D1 giả lập để xác nhận SQL, tham số
bind và xử lý kết quả; nó không chứng minh database Cloudflare thật truy cập
được.

Kiểm tra định dạng diff trước khi gửi thay đổi:

```powershell
git diff --check
```

## Thay đổi Worker và frontend

Thay đổi giao diện được Vite bundle khi build frontend. Thay đổi API cần triển
khai Worker riêng từ thư mục `cloudflare/`; local frontend gọi bản Worker đang
triển khai nên có thể chưa thấy API mới cho đến khi deploy hoàn tất.

Trình tự khuyến nghị:

1. Sửa handler và cập nhật kiểm thử tương ứng.
2. Chạy kiểm thử Node và kiểm tra dry-run Wrangler từ thư mục `cloudflare/`.
3. Triển khai Worker sau khi được xác thực với Cloudflare.
4. Kiểm tra endpoint thật, sau đó build và phát hành frontend nếu giao diện cũng
   thay đổi.

Không lưu credential, API token hoặc dữ liệu nhạy cảm trong repo. Không thêm
migration tạo lại các bảng D1 hiện có trừ khi có yêu cầu thay đổi schema rõ
ràng.
