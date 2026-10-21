# Bảng tuần hoàn

Trang bảng tuần hoàn được triển khai trong `src/pages/PeriodicTable.jsx`. Dữ
liệu chính thức được truy vấn từ Cloudflare D1 qua Worker; giao diện không còn
đọc database SQLite cục bộ.

## Dữ liệu hiển thị

Mỗi nguyên tố được xác định bằng số hiệu nguyên tử `number`. Giao diện cần các
trường `number`, `name`, `symbol`, `category`, `group` và `period`. Kết quả từ
các cột riêng được ghép thành object theo `number`; cột `group` được đổi thành
`elementGroup` trong state để phân biệt rõ với các khái niệm nhóm khác trong
giao diện.

Dữ liệu chính được bố trí trong lưới CSS theo chu kỳ và nhóm. Hai họ
Lanthanide (57–71) và Actinide (89–103) được đặt thành hai hàng riêng. Khi áp
dụng bộ lọc Nhóm IIIB (nhóm 3), các nguyên tố hai họ này cũng được tính cùng
nhóm chuyển tiếp tương ứng theo quy ước giao diện hiện tại.

## Tải dữ liệu

Frontend gửi một yêu cầu POST cho toàn bộ khoảng số hiệu nguyên tử 1–118, với
các trường cần cho giao diện: `name`, `symbol`, `category`, `group` và `period`.
API luôn bổ sung `number` làm khóa định danh. Một lần tải mới vì vậy chỉ cần một
request và một câu truy vấn D1 thay vì 144 request/câu truy vấn như trước.

Phản hồi được kiểm tra mã HTTP, JSON, danh sách trường, range, số lượng bản ghi,
khóa nguyên tử và các trường cần thiết trước khi dùng. Các nguyên tố hợp lệ được
hiển thị và lưu vào IndexedDB.

URL API cố định là
`https://mica-app-api.mica-vn.workers.dev/api/contents/periodic_table`, kể cả
khi chạy frontend local.

## Hợp đồng API

Yêu cầu:

```http
POST /api/contents/periodic_table
Content-Type: application/json
```

```json
{
  "fields": ["name", "symbol", "category", "group", "period"],
  "from": 1,
  "to": 118
}
```

`fields` là danh sách không rỗng, không trùng lặp gồm các tên cột được API cho
phép. API luôn trả thêm `number`. `from` và `to` là cận số hiệu nguyên tử, tính
từ 1 và bao gồm cả hai đầu; khoảng tối đa 500 nguyên tố.

Phản hồi thành công có dạng:

```json
{
  "fields": ["number", "name", "symbol", "category", "group", "period"],
  "from": 1,
  "to": 118,
  "rows": [
    {
      "number": 1,
      "name": "Hydrogen",
      "symbol": "H",
      "category": "nonmetal",
      "group": 1,
      "period": 1
    }
  ]
}
```

`rows` có thể ngắn hơn khoảng yêu cầu nếu database không có đủ bản ghi.

## Tối ưu số dòng D1 đọc

`periodic-table-data.js` truy vấn bằng điều kiện `pt.number BETWEEN ? AND ?`,
không dùng `OFFSET`. Vì `number` là khóa chính, D1 có thể tìm đúng khoảng bằng
chỉ mục thay vì quét rồi bỏ qua mọi dòng đứng trước. Cột được chọn lấy từ
allowlist; bảng `properties` chỉ được `JOIN` khi request thực sự yêu cầu thuộc
tính từ bảng này. Request của giao diện chỉ cần `periodic_table` và `elements`,
không đọc các thuộc tính hóa lý chưa dùng.

Với schema chuẩn hóa hiện tại, một khoảng đầy đủ 118 nguyên tố cần đọc bản ghi
gốc từ `periodic_table` và bản ghi liên quan từ `elements` (xấp xỉ 236 dòng
bảng được đọc nếu mỗi phép tra chỉ mục tìm đúng một bản ghi). Không lặp lại
đọc cùng khoảng sáu lần cho sáu cột. Không thể lấy `name` và các trường của
`elements` mà không đọc cả hai bảng nếu không thay đổi schema/denormalize dữ
liệu.

IndexedDB chỉ giữ `number`, `name`, `symbol`, `category`, `elementGroup` và
`period` — đúng các trường giao diện hiện dùng. Những cột hóa lý vẫn được cho
phép trong API để dùng sau, nhưng không được tải hoặc cache cho trang hiện tại.

## Bộ lọc và cuộn

Có thể lọc theo phân loại nguyên tố, chu kỳ hoặc nhóm. Bộ lọc hỗ trợ chọn nhiều
giá trị; rê chuột lên trục hoặc chú giải làm nổi bật nguyên tố tương ứng. Khi
chọn một phân loại, giao diện xác định vùng chứa các nguyên tố đó và cuộn bảng
đến vùng này nếu cần. Chuyển động kéo dài khoảng 380 ms với easing ease-out và
bị tắt khi `prefers-reduced-motion` được bật.

## Lỗi và trạng thái mạng

- Khi không có cache và đang tải mạng, giao diện hiển thị trạng thái đang tải.
- Nếu API không tải được và có dữ liệu IndexedDB, giao diện dùng dữ liệu đã lưu
  và báo rằng dữ liệu trực tuyến chưa cập nhật.
- Nếu đang offline, tác vụ đang chạy được hủy. Có cache thì bảng vẫn hiển thị;
  chưa từng tải dữ liệu thì giao diện thông báo cần có mạng cho lần đầu.
- Khi kết nối mạng trở lại, bảng gọi lại API và cập nhật dữ liệu/cache.
- Lỗi đọc hoặc ghi IndexedDB được ghi log và hiện thông báo riêng; không giả
  định dữ liệu đã được lưu thành công.

## Kiểm thử endpoint

`cloudflare/api/contents/periodic-table.js` xử lý request HTTP; phần truy vấn và
allowlist cột được tách tại `cloudflare/api/contents/periodic-table-data.js`.
`cloudflare/api/contents/periodic-table-data.js` có bộ tự kiểm tra truy vấn D1
tích hợp, không cần file test riêng. Chạy kiểm thử bằng:

```powershell
node --input-type=module -e "import('./cloudflare/api/contents/periodic-table-data.js').then(({ runPeriodicTableDataTests }) => runPeriodicTableDataTests())"
```

Test xác nhận một truy vấn theo range, không dùng `OFFSET`, chỉ join bảng cần
thiết, cùng kiểm tra tham số bind, đầu vào và phản hồi D1.
