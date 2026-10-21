# PWA và hỗ trợ ngoại tuyến

MICA đăng ký Service Worker để cung cấp app shell offline và lưu dữ liệu bảng
tuần hoàn trên thiết bị. Hai cơ chế lưu này tách biệt: Cache API phục vụ tài
nguyên web, IndexedDB lưu bản ghi nguyên tố.

## Khai báo cài đặt

`private/contents/manifest.webmanifest` khai báo tên ứng dụng, ngôn ngữ, màu
giao diện, chế độ hiển thị standalone và icon. Worker phục vụ file tại
`/api/contents/manifest`; `index.html` tham chiếu trực tiếp domain Worker để
tránh máy chủ hosting sửa nội dung manifest. Icon manifest trỏ tới SVG logo
trên Cloudflare Worker.

`src/main.jsx` đăng ký `/sw.js` sau khi trang tải xong. Nếu đăng ký thất bại,
lỗi được ghi vào console.

## Cache app shell và tài nguyên

`public/sw.js` sử dụng tên cache có version (`mica-app-shell-v9`). Khi cài đặt,
Service Worker:

1. Lưu trang gốc.
2. Lưu text logo và các bundle JS/CSS được tham chiếu trong HTML.
3. Thử cache manifest từ Worker và danh sách icon SVG cùng các kích thước sử
   dụng trong giao diện.
4. Kích hoạt worker mới và xóa các cache cũ có tiền tố `mica-app-shell-`.

Khi có yêu cầu GET thuộc ứng dụng, manifest hoặc SVG, Service Worker ưu tiên
mạng. Nếu fetch thất bại, nó tìm phản hồi trong Cache API; với navigation, nó
có thể trả app shell đã lưu. POST không được Service Worker cache hoặc thay
thế.

## Lưu dữ liệu bảng tuần hoàn

`src/services/periodicTableCache.js` dùng IndexedDB database
`mica-chemistry-offline`, phiên bản 1, object store `elements` với `number` là
keyPath. Dữ liệu được ghi bằng `put`, nên bản cập nhật của một nguyên tố thay
thế bản cũ cùng số hiệu nguyên tử.

Khi mở trang bảng tuần hoàn, giao diện đọc cache trước rồi thử lấy dữ liệu mới
nếu mạng sẵn sàng. Dữ liệu tải được ghi vào IndexedDB theo từng batch. Nếu mạng
mất, bảng có thể tiếp tục hiển thị dữ liệu đã lưu. Nếu thiết bị chưa có dữ liệu
cache, lần tải đầu tiên cần kết nối mạng.

## Chỉ báo trạng thái kết nối

`Header.jsx` nghe các sự kiện `online` và `offline`:

- Khi mất mạng, hiện chỉ báo offline.
- Khi có mạng trở lại, chuyển sang trạng thái online.
- Chỉ báo online được giữ 2 giây; nếu mạng vẫn ổn định thì chạy hiệu ứng biến
  mất. Nếu mạng mất lại trong khoảng chờ, chỉ báo chuyển về offline.
- Text logo và các SVG được yêu cầu làm mới khi kết nối trở lại.

Việc tải mới dữ liệu bảng tuần hoàn được `PeriodicTable.jsx` xử lý riêng bằng
việc hủy request cũ và gọi lại API. Để thao tác này thành công, Worker Cloudflare
cần truy cập được.

## Kiểm thử thủ công

1. Mở ứng dụng khi online và vào Bảng tuần hoàn để nạp dữ liệu.
2. Ngắt mạng hoặc bật chế độ offline của trình duyệt.
3. Tải lại trang; app shell và bảng đã cache có thể tiếp tục hiển thị.
4. Bật mạng trở lại; quan sát chỉ báo trạng thái và việc làm mới dữ liệu.

Service Worker hoạt động trên HTTPS hoặc localhost theo quy tắc của trình
duyệt. Khi thay đổi danh sách cache, cần cân nhắc tăng `CACHE_NAME` trong
`public/sw.js` để người dùng nhận phiên cache mới.
