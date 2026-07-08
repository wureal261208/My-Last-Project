# Role & Data Flow

## Account model

He thong tach 2 lop quyen:

- `role`: `admin`, `manager`, `employee`, `anonymous`
- `accountType`: `vip`, `normal`

`role` quyet dinh quyen quan tri. `accountType` quyet dinh quyen doc/mua sach cua nguoi dung.

## Seed admin

Admin mac dinh:

- UID: `eAeLVTMuloQpm9UVoUPeHGLsIVG2`
- Email: `phugaming261208@gmail.com`

Doi admin bang cach sua `.env.local`:

```env
NEXT_PUBLIC_ADMIN_UID=your-new-admin-uid
NEXT_PUBLIC_ADMIN_EMAIL=your-new-admin-email@example.com
```

## Flow theo role

- Admin:
  - Quan ly manager, employee, user, books, orders.
  - Set Firebase Custom Claims cho manager/employee.
  - Import metadata tu Kaggle Gutenberg vao Firestore.

- Co-op Admin / Manager:
  - Quan ly employee trong cung `coopId`.
  - Upload/chinh sua sach cua team.
  - Xem doanh thu va sach thuoc team.

- Employee:
  - Upload/chinh sua sach duoc giao.
  - Khong duoc tao manager.

- Anonymous:
  - Xem catalog.
  - Doc preview/free book.
  - Can dang nhap de luu tien trinh, mua sach, binh luan.

## Kaggle Gutenberg

Kaggle dataset chi nen dung cho metadata sach, khong phai user database. User phai luu trong Firebase Auth + Firestore.

Du lieu import vao:

```txt
books/{bookId}
```

User luu vao:

```txt
users/{uid}
```

Manager/employee relationship:

```txt
coops/{coopId}/members/{uid}
```

## Them manager / employee bang Firebase UID va email

Goi API server:

```txt
POST /api/admin/set-claims
Authorization: Bearer <admin-firebase-id-token>
```

Body tao manager:

```json
{
  "uid": "firebase-manager-uid",
  "email": "manager@example.com",
  "role": "manager",
  "accountType": "normal",
  "coopId": "coop-main"
}
```

Body tao employee duoi manager:

```json
{
  "uid": "firebase-employee-uid",
  "email": "employee@example.com",
  "role": "employee",
  "accountType": "normal",
  "coopId": "coop-main",
  "managerUid": "firebase-manager-uid"
}
```
