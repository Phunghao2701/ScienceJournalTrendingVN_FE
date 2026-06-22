# ⚛️ HƯỚNG DẪN BẮT ĐẦU DỰ ÁN FRONTEND (REACT + VITE)

Chào mừng bạn đến với **Frontend của dự án ScientificJournalSystem** 🎉  
Tài liệu này giúp các thành viên trong team nhanh chóng **cài đặt, chạy và làm việc với dự án React Frontend**.

---

## 🧰 CÔNG NGHỆ SỬ DỤNG

- **React** – Thư viện xây dựng giao diện người dùng
- **Vite** – Công cụ build & dev server tốc độ cao
- **ESLint** – Kiểm soát chất lượng code
- **Node.js** – Môi trường chạy JavaScript

---

## 🛠️ BƯỚC 1: CHUẨN BỊ MÔI TRƯỜNG

Đảm bảo máy bạn đã cài:

- **Node.js**: LTS **v20+** (khuyên dùng v22+)
- **Git**

Kiểm tra nhanh:
```bash
node -v
npm -v
git --version
```

---

## 📥 BƯỚC 2: CLONE SOURCE CODE

```bash
# Clone repository frontend
git clone <GITHUB_REPOSITORY_FRONTEND>

# Di chuyển vào thư mục dự án
cd ScientificJournalSystem_FE
```

---

## 📦 BƯỚC 3: CÀI ĐẶT DEPENDENCIES

Thư mục `node_modules` không được commit lên GitHub.

```bash
npm install
```

---

## 🚀 BƯỚC 4: CHẠY DỰ ÁN

### 🔹 Development Mode (Khuyên dùng)

```bash
npm run dev
```

Sau khi chạy thành công:
```text
Local: http://localhost:5173
```

Vite hỗ trợ **Hot Module Replacement (HMR)** – tự động reload khi sửa code.

---

## 🏗️ BƯỚC 5: BUILD PROJECT (PRODUCTION)

```bash
npm run build
```

- Output nằm trong thư mục `dist/`
- Dùng để deploy lên server hoặc hosting (Nginx, Vercel, Netlify…)

---

## 📁 CẤU TRÚC THƯ MỤC THAM KHẢO

```text
src/
├── assets/        # Ảnh, icon, file tĩnh
├── components/    # Component dùng chung
├── pages/         # Các trang (route)
├── services/      # Gọi API
├── hooks/         # Custom hooks
├── utils/         # Hàm tiện ích
├── App.jsx
├── main.jsx
```

---

## 🔌 PLUGIN REACT TRONG VITE

Vite hỗ trợ 2 plugin React chính:

- `@vitejs/plugin-react` – dùng **Oxc** (ổn định, mặc định)
- `@vitejs/plugin-react-swc` – dùng **SWC** (build nhanh hơn)

👉 Project hiện dùng **plugin mặc định**.

---

## ⚠️ REACT COMPILER

React Compiler **chưa được bật** vì có thể ảnh hưởng performance khi dev/build.

Tham khảo:
https://react.dev/learn/react-compiler/installation

---

## ⚠️ QUY TẮC LÀM VIỆC NHÓM (GIT WORKFLOW)

### ❌ Không được:
- Code trực tiếp trên nhánh `main`

### ✅ Quy trình chuẩn:
```bash
git checkout -b feature/ten-chuc-nang
```

### 📌 Khi cài thêm thư viện:
```bash
npm install <ten-thu-vien>
```

👉 **Bắt buộc commit:**
- `package.json`
- `package-lock.json`

---

## 📌 GHI CHÚ

- Không commit file `.env`
- Luôn `git pull` trước khi code
- FE gọi API theo base URL backend đã thống nhất

---

🎯 **Happy Coding & Chúc team làm Frontend hiệu quả!**
