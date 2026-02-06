# Shopping Online

Dự án E-commerce với Node.js, Express, MongoDB và React.

## Cấu trúc dự án

```
Shopping_online/
├── server/                 # Backend (Express + MongoDB)
│   ├── api/               # API routes
│   ├── models/            # MongoDB models & DAOs
│   ├── views/             # EJS templates
│   └── utils/             # Utilities
├── client-admin/          # Admin panel (React)
└── client-customer/       # Customer website (React)
```

## Cài đặt

### 1. Server

```bash
cd server
npm install
```

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Điền thông tin MongoDB và các credentials vào file `.env`.

### 2. Client Admin

```bash
cd client-admin
npm install
```

### 3. Client Customer

```bash
cd client-customer
npm install
```

## Chạy ứng dụng

### Server (Port 5000)
```bash
cd server
node index.js
```

### Admin Panel (Port 3001)
```bash
cd client-admin
npm start
```

### Customer Website (Port 3000)
```bash
cd client-customer
npm start
```

## URLs

| Ứng dụng | URL |
|----------|-----|
| Server API | http://localhost:5000 |
| EJS Shop | http://localhost:5000/shop |
| Admin Panel | http://localhost:3001 |
| Customer (React) | http://localhost:3000 |

## API Endpoints

### Admin APIs (cần token)
- `POST /api/admin/login` - Đăng nhập
- `GET /api/admin/products?page=1` - Lấy danh sách sản phẩm
- `POST /api/admin/products` - Thêm sản phẩm
- `PUT /api/admin/products/:id` - Sửa sản phẩm
- `DELETE /api/admin/products/:id` - Xóa sản phẩm
- `GET /api/admin/categories` - Lấy danh mục

### Customer APIs
- `GET /api/customer/categories` - Danh mục
- `GET /api/customer/products/new` - Sản phẩm mới
- `GET /api/customer/products/hot` - Sản phẩm hot
- `GET /api/customer/products/category/:cid` - Sản phẩm theo danh mục
- `GET /api/customer/products/search/:keyword` - Tìm kiếm
- `GET /api/customer/products/:id` - Chi tiết sản phẩm

### EJS Routes (Server-side rendering)
- `GET /shop` - Danh sách sản phẩm
- `GET /shop/product/:id` - Chi tiết sản phẩm
- `GET /shop/cart` - Giỏ hàng
- `POST /shop/cart/add` - Thêm vào giỏ
- `POST /shop/cart/remove/:id` - Xóa khỏi giỏ

## Công nghệ sử dụng

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React, React Router
- **View Engine:** EJS
- **Session:** express-session + connect-mongo
- **Authentication:** JWT

## Tác giả

KTB - 2026
