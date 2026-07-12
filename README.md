# BookWorm Online Library Rental System

**Icon library:** the project uses `lucide-react` for new rental/status icons and Bootstrap Icons for the existing legacy UI icon set.

## Giới thiệu

BookWorm là hệ thống thư viện online cho thuê và đọc sách. Người dùng có thể đọc sách miễn phí, gửi yêu cầu thuê sách, chờ nhân sự duyệt, và theo dõi tiến trình giao sách trong dashboard cá nhân.

Project hiện dùng Next.js + React cho frontend, Firebase Auth cho đăng nhập, Firestore cho lưu dữ liệu realtime, và Next API routes làm backend routing cho các request quan trọng.

## Chức năng

- Thuê sách: người dùng chọn sách thuê, gửi request, trạng thái ban đầu là `Pending`.
- Giới hạn thuê sách: tài khoản Normal có giới hạn tiêu chuẩn, tài khoản Worm được thuê nhiều sách hơn.
- Duyệt thuê sách: Admin, Manager, hoặc Employee duyệt request trước khi sách được gửi.
- Dashboard thuê sách: hiển thị ngày giao và trạng thái `Pending`, `Đã giao`, hoặc `Đã nhận`.
- Quản lý sách đọc và sách thuê: Admin/Manager quản lý sách `free-to-read` và `for-rent`.
- Icon UI: Account, Settings, Rent, Pending, Delivered, Received, Admin, Manager, Employee, và Worm đều có icon trực quan đồng bộ theme.
- Backend routing: `/api/rentals` xử lý `GET`, `POST`, `PATCH` cho dashboard, tạo request thuê, và cập nhật trạng thái giao.

## Phân quyền

- Admin: toàn quyền quản lý sách đọc và sách thuê; thêm, xóa, chỉnh sửa, duyệt; đứng đầu hệ thống.
- Manager: quản lý sách đọc và sách thuê; thêm, xóa sách; duyệt sách để gửi cho người dùng; hành động quan trọng tạo thông báo cho Admin.
- Employee: chỉ duyệt sách để gửi cho người dùng; hành động quan trọng tạo thông báo cho Admin.
- Worm: account type dành cho hệ thống thuê/đọc sách; thuê được nhiều sách hơn Normal và có tag Worm riêng.
- Normal: thuê sách theo giới hạn tiêu chuẩn và theo dõi dashboard giao sách.
- Anonymous: xem/preview nội dung giới hạn, cần đăng nhập để thuê sách.

## Cách sử dụng

1. Đăng nhập hoặc tạo tài khoản.
2. Mở trang `Rent` để xem sách có thể thuê.
3. Chọn `Rent` cho sách mong muốn.
4. Gửi rental request và chờ trạng thái `Pending` được duyệt.
5. Vào Account/Profile Settings bằng cách click tên account trên navbar.
6. Theo dõi dashboard thuê sách để xem ngày giao và trạng thái giao.
7. Admin/Manager/Employee vào Admin dashboard để duyệt request và cập nhật `Đã giao` hoặc `Đã nhận`.

## Cài đặt

Install dependencies:

```bash
npm install
```

Run the backend-routed Next server:

```bash
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Type-check:

```bash
npm.cmd run typecheck
```

Build:

```bash
npm.cmd run build
```

## Backend Routing

Rental API:

```text
GET /api/rentals
POST /api/rentals
PATCH /api/rentals
```

Routing responsibilities:

- Auth: request cần Bearer token từ Firebase Auth.
- Rent sách: `POST` tạo rental request với trạng thái `Pending`.
- Duyệt sách: `PATCH` cập nhật trạng thái `delivered` hoặc `received`.
- Dashboard: `GET` trả về request của người thuê hoặc toàn bộ request cho staff.

## Ghi chú dữ liệu

- `free-to-read`: sách đọc online.
- `for-rent`: sách thuê qua approval flow.
- Dữ liệu cũ `for-sale` được normalize về `for-rent`.
- Dữ liệu cũ `vip` được normalize về `worm` ở UI để tránh mất tương thích.
