# Cloudflare Worker và D1

Worker nằm trong thư mục `cloudflare/`; cấu hình Wrangler là
`cloudflare/wrangler.toml`. Worker cung cấp API dữ liệu và tài nguyên SVG.

## Cấu hình binding

`wrangler.toml` khai báo:

- Tên Worker: `mica-app-api`.
- Điểm vào: `index.js`.
- D1 binding `DB`, trỏ tới database `contents`.
- Assets binding `ASSETS`, phục vụ thư mục `../private`.
- `remote = true` để môi trường Worker local có thể dùng D1 từ xa khi chạy
  `wrangler dev`.

Database D1 hiện có các bảng:

| Bảng | Trường sở hữu |
|---|---|
| `periodic_table` | `number`, `name` |
| `elements` | `number`, `symbol`, `mass`, `category`, `group`, `period` |
| `properties` | `number`, cấu hình electron và các thuộc tính hóa lý |

Các bảng liên kết qua `number`. Tên nguyên tố lấy từ `periodic_table.name`; không
giả định `elements` có cột `name`. Truy vấn dùng `LEFT JOIN` để vẫn trả bản ghi
chính khi bảng liên quan thiếu dữ liệu. Cột `"group"` được đặt trong dấu ngoặc
kép vì đây là tên cột đặc biệt trong SQL.

Database đã được tạo và nạp dữ liệu trước đó; repository không chứa migration
hay seed data. Không chạy lệnh tạo/xóa bảng khi chỉ cần triển khai mã Worker.

## Endpoint dữ liệu

`cloudflare/index.js` định tuyến `POST /api/contents/periodic_table` đến
`createPeriodicTableResponse()` trong
`cloudflare/api/contents/periodic-table.js`. Module này kiểm tra request và
định dạng response; `cloudflare/api/contents/periodic-table-data.js` giữ
allowlist cột và thực hiện truy vấn D1. Frontend gửi một danh sách trường cần
lấy cùng một khoảng số hiệu nguyên tử trong một request.

Các cột được cho phép:

```text
number, name, symbol, mass, category, group, period,
electron_configuration, electronegativity, atomic_radius,
ionization_energy, electron_affinity, melting_point, boiling_point,
density, year_discovered
```

Trình đọc D1 chỉ nội suy tên cột lấy từ allowlist cố định; `from` và `to` là
cận số hiệu nguyên tử 1-based, bao gồm hai đầu và tối đa 500 bản ghi. SQL lọc
trực tiếp bằng `WHERE pt.number BETWEEN ? AND ?` trên khóa chính, không dùng
`OFFSET`, và chỉ join bảng `elements`/`properties` khi các trường được yêu cầu
cần đến chúng. Tất cả giá trị đều truyền bằng tham số bind. Body tối đa 16 KiB.
API từ chối phương thức khác POST (ngoại trừ OPTIONS cho CORS), JSON sai định
dạng, fields không hợp lệ và range không hợp lệ.

Các mã lỗi đáng chú ý:

- `400`: JSON, tên cột hoặc range không hợp lệ.
- `405`: phương thức không được hỗ trợ.
- `413`: body quá lớn.
- `503`: binding D1 không khả dụng.
- `500`: lỗi truy vấn D1; chi tiết nội bộ chỉ ghi log server.

## Endpoint SVG

`GET /api/assets/svg?name=home&size=24` lấy SVG từ Assets binding. Có thể dùng
`size` hoặc cặp `w` và `h`; mỗi kích thước phải là số nguyên dương không quá
2048. Tên asset phải phù hợp với định dạng ký tự cho phép. Endpoint trả loại
nội dung SVG, cache-control và các header bảo vệ cơ bản.

## Endpoint manifest

`GET /api/contents/manifest` phục vụ nguyên nội dung file
`private/contents/manifest.webmanifest` qua Assets binding. Endpoint trả
`application/manifest+json`, cho phép CORS để trang MICA tải manifest từ domain
Worker, và đặt cache-control một giờ. Request method khác GET (ngoại trừ OPTIONS)
bị từ chối.

`index.html` tham chiếu endpoint Cloudflare trực tiếp. Nhờ vậy InfinityFree chỉ
phục vụ HTML, không thể chèn nội dung kiểm tra bot vào response của
`manifest.webmanifest`.

## Chạy Worker local

Từ thư mục `cloudflare/`:

```powershell
npx wrangler dev --port 8787
```

Đây là môi trường kiểm thử Worker, không phải endpoint mà frontend local mặc
định sử dụng. Frontend gọi URL Worker đã triển khai trên Cloudflare.

## Triển khai

Để cập nhật API công khai, cần triển khai Worker lên Cloudflare. Ví dụ từ thư
mục Worker:

```powershell
npx wrangler deploy
```

Wrangler cần được xác thực với tài khoản Cloudflare. Cấu hình token trong môi
trường local hoặc CI phù hợp; không đưa token vào mã nguồn, tài liệu công khai
hoặc chat. Trước khi deploy có thể chạy dry-run:

```powershell
npx wrangler deploy --dry-run
```

Deploy ứng dụng frontend tĩnh không tự triển khai Worker; hai phần có quy trình
phát hành riêng.
