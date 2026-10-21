# Tài nguyên và giao diện

## Tài nguyên hình ảnh

Ảnh raster dùng trong giao diện nằm dưới `public/images/`; trình duyệt phục vụ
chúng theo đường dẫn web như `/images/MICA-TextLogo.png`.

SVG nguồn nằm trong `private/svg/`, bao gồm logo, biểu tượng điều hướng, trạng
thái offline/online và các icon chức năng. Worker phục vụ chúng từ Cloudflare
Assets. Khi chạy local bằng Vite hoặc Express, `src/services/svgAssets.js` đọc
file trực tiếp từ thư mục này.

Không tham chiếu trực tiếp đường dẫn filesystem từ giao diện. Dùng `SvgIcon`
hoặc `Logo` để tải SVG qua endpoint `/api/assets/svg`.

## API SVG

Ví dụ URL:

```text
/api/assets/svg?name=home&size=24
/api/assets/svg?name=MICA-Logo&w=40&h=40
```

Chỉ dùng một trong hai cách chỉ định kích thước: `size`, hoặc cả `w` và `h`.
Nếu không chỉ định, kích thước mặc định là 24 × 24. Handler kiểm tra tên, số
lượng tham số và giới hạn kích thước, sau đó chuẩn hóa thuộc tính `width` và
`height` của phần tử `<svg>` gốc.

`SvgIcon.jsx` tải SVG dưới dạng text rồi gắn vào phần tử span. Các tên SVG phải
được kiểm tra trước khi sử dụng; không truyền nội dung SVG do người dùng cung
cấp vào giao diện.

## CSS

- `src/styles/main.css`: reset, font và kiểu toàn cục.
- `src/styles/App.css`: bố cục vỏ ứng dụng.
- `src/styles/components/`: kiểu của Header, Sidebar, Logo, Footer và icon.
- `src/styles/pages/`: kiểu trang chủ và bảng tuần hoàn.

CSS được import từ component/page tương ứng để quan hệ giữa phần trình bày và
logic dễ tìm. Bố cục bảng tuần hoàn dùng CSS Grid và có vùng cuộn riêng để hỗ
trợ màn hình nhỏ.

## Quy trình thêm icon

1. Thêm file SVG vào `private/svg/` với tên phù hợp.
2. Dùng `SvgIcon name="ten-file"` trong component.
3. Nếu icon cần được tải trước khi offline, thêm tên/kích thước tương ứng vào
   danh sách cache trong `public/sw.js`.
4. Kiểm tra cả môi trường local lẫn Worker sau deploy; danh sách cache của
   Service Worker không tự tìm mọi file mới.
