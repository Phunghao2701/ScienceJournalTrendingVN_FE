# FRONTEND STRUCTURE REVIEW GUIDE

> Dành cho team Frontend dự án **Scientific Journal Publication Trend Tracking System**.  
> Sau khi mỗi thành viên vibe code xong một feature, hãy dùng file này để tự check cấu trúc trước, sau đó đưa file này kèm code cho AI agent review lại.

---

## 1. Mục đích của file này

File này dùng để thống nhất cách tổ chức code Frontend, tránh tình trạng mỗi thành viên code một kiểu.

Sau khi code xong, thành viên cần dùng file này để kiểm tra:

- File có đặt đúng thư mục không.
- Component có bị quá dài hoặc ôm quá nhiều logic không.
- API/service/hook/page có tách đúng vai trò không.
- Code có dùng chung được không hay bị lặp lại.
- Có làm sai cấu trúc chuẩn của dự án không.
- Có tuân thủ yêu cầu mới về Zustand, token, storage key và comment hàm không.
- Có thể nhờ AI agent review lại dựa trên checklist này.

---

## 2. Cấu trúc chuẩn của dự án

Cấu trúc đề xuất:

```txt
src/
├── app/
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   └── AuthLayout.jsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── routePaths.js
│   │
│   ├── providers/
│   │   └── AppProvider.jsx
│   │
│   └── store/
│       ├── authStore.js
│       ├── uiStore.js
│       └── sidebarStore.js
│
├── features/
│   ├── auth/
│   ├── journals/
│   ├── publishers/
│   ├── subject-areas/
│   ├── subject-categories/
│   ├── articles/
│   ├── rankings/
│   └── users/
│
├── shared/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── assets/
├── App.jsx
├── main.jsx
├── App.css
└── index.css
```

---

## 3. Ý nghĩa từng thư mục

### 3.1. `src/app/`

Thư mục `app` chứa phần khung lõi của toàn bộ ứng dụng.

Dùng cho:

- Layout tổng.
- Router chính.
- Protected route.
- Provider tổng nếu thật sự cần.
- Global store bằng Zustand.
- Cấu hình cấp app.

Không dùng `app` để chứa:

- Component riêng của một feature.
- API riêng của một feature.
- Form CRUD của một module cụ thể.
- Logic nghiệp vụ của Journal, Article, Subject Area...

Ví dụ đúng:

```txt
src/app/routes/AppRoutes.jsx
src/app/routes/ProtectedRoute.jsx
src/app/layouts/AdminLayout.jsx
src/app/store/authStore.js
```

Ví dụ sai:

```txt
src/app/SubjectAreaTable.jsx
src/app/journalApi.js
src/app/LoginForm.jsx
```

---

### 3.2. `src/features/`

Thư mục `features` chứa các chức năng chính của hệ thống.

Mỗi module nghiệp vụ nên có một folder riêng:

```txt
features/
├── auth/
├── journals/
├── publishers/
├── subject-areas/
├── subject-categories/
├── articles/
├── rankings/
└── users/
```

Mỗi feature nên có cấu trúc thống nhất:

```txt
features/ten-feature/
├── api/
│   └── featureApi.js
├── components/
│   ├── FeatureForm.jsx
│   └── FeatureTable.jsx
├── hooks/
│   └── useFeatures.js
├── pages/
│   ├── FeatureListPage.jsx
│   ├── FeatureCreatePage.jsx
│   └── FeatureEditPage.jsx
├── services/
│   └── featureService.js
├── store/
│   └── featureStore.js
├── validations/
│   └── featureValidation.js
└── index.js
```

Không phải feature nào cũng bắt buộc có đủ tất cả thư mục. Nhưng nếu có phần nào thì nên đặt đúng vai trò.

---

### 3.3. `src/shared/`

Thư mục `shared` chứa code dùng chung cho nhiều feature.

Dùng cho:

- Button, Input, Modal, Table, Pagination.
- Loading, EmptyState, ConfirmDialog.
- Axios client.
- Constant dùng chung như storage key.
- Format ngày tháng, format số liệu.
- Custom hook dùng chung.
- Style dùng chung.

Ví dụ:

```txt
shared/components/Button/Button.jsx
shared/components/Table/DataTable.jsx
shared/components/Loading/LoadingSpinner.jsx
shared/constants/storageKeys.js
shared/services/httpClient.js
shared/utils/formatDate.js
shared/hooks/useDebounce.js
```

Không dùng `shared` để chứa logic quá riêng của một feature.

Ví dụ sai:

```txt
shared/components/SubjectAreaForm.jsx
shared/services/journalRankingService.js
shared/utils/validateLoginPassword.js
```

Nếu một file chỉ dùng cho `subject-areas`, hãy để trong `features/subject-areas/`.

---

### 3.4. `src/assets/`

Dùng để chứa tài nguyên tĩnh:

```txt
assets/
├── images/
├── icons/
├── logos/
└── illustrations/
```

Không nên để ảnh lung tung ở root hoặc trong `src/` nếu ảnh đó là tài nguyên tĩnh dùng lâu dài.

---

## 4. Quy tắc đặt tên file

### 4.1. Component

Component dùng PascalCase:

```txt
LoginForm.jsx
SubjectAreaTable.jsx
JournalCard.jsx
AdminSidebar.jsx
```

Không dùng:

```txt
loginform.jsx
subject_area_table.jsx
journal-card.jsx
```

---

### 4.2. Hook

Custom hook bắt đầu bằng `use`:

```txt
useAuth.js
useSubjectAreas.js
useDebounce.js
useJournals.js
```

---

### 4.3. API file

File gọi API đặt theo tên feature:

```txt
authApi.js
subjectAreaApi.js
journalApi.js
publisherApi.js
```

---

### 4.4. Service file

Service xử lý logic nghiệp vụ nhẹ, format dữ liệu, điều phối API:

```txt
authService.js
subjectAreaService.js
journalService.js
```

---

### 4.5. Store file

Store Zustand đặt tên rõ nghĩa:

```txt
authStore.js
uiStore.js
sidebarStore.js
journalFilterStore.js
articleSearchStore.js
```

---

### 4.6. Page

Page là màn hình được route tới:

```txt
LoginPage.jsx
DashboardPage.jsx
SubjectAreaListPage.jsx
SubjectAreaCreatePage.jsx
SubjectAreaEditPage.jsx
```

Không đặt page quá chung chung:

```txt
List.jsx
Create.jsx
Edit.jsx
Page.jsx
```

---

## 5. Quy tắc tách vai trò file

### 5.1. Page làm gì?

Page dùng để ghép layout của một màn hình.

Page được phép:

- Gọi custom hook.
- Render component chính.
- Truyền props xuống component con.
- Điều hướng bằng router.
- Hiển thị loading/error ở cấp page.

Page không nên:

- Viết quá nhiều JSX chi tiết.
- Gọi Axios trực tiếp.
- Chứa logic validate form phức tạp.
- Chứa nhiều hàm xử lý dữ liệu dài.

Ví dụ đúng:

```jsx
import SubjectAreaTable from "../components/SubjectAreaTable";
import { useSubjectAreas } from "../hooks/useSubjectAreas";

export default function SubjectAreaListPage() {
  const { subjectAreas, loading, error } = useSubjectAreas();

  return (
    <SubjectAreaTable
      data={subjectAreas}
      loading={loading}
      error={error}
    />
  );
}
```

---

### 5.2. Component làm gì?

Component dùng để hiển thị UI hoặc nhận input từ người dùng.

Component được phép:

- Nhận props.
- Hiển thị dữ liệu.
- Gọi event handler từ props.
- Quản lý state nhỏ chỉ phục vụ UI.

Component không nên:

- Gọi API trực tiếp.
- Biết quá nhiều về route.
- Biết token/user global nếu không cần.
- Chứa logic nghiệp vụ dài.

Ví dụ đúng:

```jsx
export default function SubjectAreaTable({ data, loading, onEdit, onDelete }) {
  if (loading) return <p>Loading...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.subject_area_id}>
            <td>{item.display_name}</td>
            <td>{item.description}</td>
            <td>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.subject_area_id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 5.3. Hook làm gì?

Hook dùng để gom logic React của một feature.

Hook được phép:

- Gọi service.
- Quản lý loading/error/data.
- Gom logic fetch data.
- Gom logic submit form.
- Dùng `useEffect`, `useState`, `useNavigate`.

Ví dụ:

```jsx
import { useEffect, useState } from "react";
import subjectAreaService from "../services/subjectAreaService";

export function useSubjectAreas() {
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchSubjectAreas() {
    try {
      setLoading(true);
      const data = await subjectAreaService.getAll();
      setSubjectAreas(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load subject areas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjectAreas();
  }, []);

  return {
    subjectAreas,
    loading,
    error,
    refetch: fetchSubjectAreas,
  };
}
```

---

### 5.4. API file làm gì?

API file chỉ nên gọi HTTP, không xử lý UI.

Ví dụ:

```js
import httpClient from "../../../shared/services/httpClient";

/**
 * API làm việc với Subject Area.
 * Tất cả request phải đi qua httpClient để tự động gắn baseURL và token.
 */
const subjectAreaApi = {
  /**
   * Lấy danh sách Subject Areas có hỗ trợ phân trang và tìm kiếm.
   *
   * @param {Object} params - Query params gửi lên backend.
   * @returns {Promise} Axios response từ backend.
   */
  getAll(params) {
    return httpClient.get("/subject-areas", { params });
  },

  /**
   * Lấy chi tiết một Subject Area theo ID.
   *
   * @param {string|number} id - ID của Subject Area.
   * @returns {Promise} Axios response từ backend.
   */
  getById(id) {
    return httpClient.get(`/subject-areas/${id}`);
  },

  /**
   * Tạo mới Subject Area.
   *
   * @param {Object} payload - Dữ liệu cần tạo.
   * @returns {Promise} Axios response từ backend.
   */
  create(payload) {
    return httpClient.post("/subject-areas", payload);
  },

  /**
   * Cập nhật Subject Area.
   *
   * @param {string|number} id - ID của Subject Area.
   * @param {Object} payload - Dữ liệu cần cập nhật.
   * @returns {Promise} Axios response từ backend.
   */
  update(id, payload) {
    return httpClient.put(`/subject-areas/${id}`, payload);
  },

  /**
   * Xóa Subject Area theo ID.
   *
   * @param {string|number} id - ID của Subject Area.
   * @returns {Promise} Axios response từ backend.
   */
  remove(id) {
    return httpClient.delete(`/subject-areas/${id}`);
  },
};

export default subjectAreaApi;
```

Không viết kiểu này trong component:

```jsx
axios.get("http://localhost:8082/api/v1/subject-areas");
```

---

### 5.5. Service làm gì?

Service xử lý logic nhẹ giữa API và UI.

Ví dụ:

```js
import subjectAreaApi from "../api/subjectAreaApi";

/**
 * Service xử lý dữ liệu Subject Area trước khi trả về cho hook/page.
 */
const subjectAreaService = {
  /**
   * Lấy danh sách Subject Areas từ backend.
   *
   * @param {Object} params - Tham số phân trang/tìm kiếm.
   * @returns {Promise<Object>} Danh sách Subject Areas và pagination.
   */
  async getAll(params) {
    const response = await subjectAreaApi.getAll(params);
    return response.data.data;
  },

  /**
   * Tạo mới Subject Area.
   *
   * @param {Object} payload - Dữ liệu form cần gửi lên backend.
   * @returns {Promise<Object>} Subject Area vừa được tạo.
   */
  async create(payload) {
    const response = await subjectAreaApi.create(payload);
    return response.data.data;
  },
};

export default subjectAreaService;
```

Không để service chứa JSX hoặc logic giao diện.

---

## 6. Chuẩn gọi API

Tất cả API phải đi qua `shared/services/httpClient.js`.

Ví dụ:

```js
import axios from "axios";
import { STORAGE_KEYS } from "../constants/storageKeys";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default httpClient;
```

File `.env.example` nên có:

```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
```

Quy tắc:

- Không hard-code base URL trong từng component.
- Không commit file `.env`.
- Có thể commit `.env.example`.
- Token nên được gắn ở interceptor.
- Nếu API trả lỗi thống nhất từ BE, nên xử lý lỗi ở service hoặc hook.

---

## 7. Quy định mới từ người hướng dẫn

Người hướng dẫn yêu cầu cả nhóm thống nhất các tiêu chuẩn mới sau:

- Sử dụng **Zustand** để quản lý trạng thái thay vì các phương pháp bao bọc lớp truyền thống.
- Chỉ lưu trữ **token**, không lưu thông tin người dùng nhạy cảm.
- Đặt tên khóa lưu trữ đơn giản, rõ nghĩa.
- Bắt buộc viết chú thích cho các hàm quan trọng.
- Tái cấu trúc các yêu cầu/code hiện có để toàn bộ hệ thống đồng bộ theo tiêu chuẩn mới.

---

## 8. Bắt buộc dùng Zustand để quản lý trạng thái

Dự án sử dụng **Zustand** để quản lý trạng thái thay vì các phương pháp bao bọc lớp truyền thống như tự tạo nhiều Context Provider lồng nhau.

Mục tiêu:

- Giữ code gọn hơn.
- Tránh tình trạng nhiều Provider bọc nhau gây khó đọc.
- Dễ tách logic theo từng store.
- Dễ bảo trì khi project có nhiều module.
- Giúp component không phải truyền props qua quá nhiều tầng.

Không khuyến khích dùng kiểu:

```jsx
<AuthProvider>
  <ThemeProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </ThemeProvider>
</AuthProvider>
```

Nên dùng Zustand store:

```txt
src/app/store/
├── authStore.js
├── uiStore.js
└── sidebarStore.js
```

Hoặc nếu store thuộc riêng một feature:

```txt
features/journals/store/journalFilterStore.js
features/articles/store/articleSearchStore.js
```

Quy tắc:

- Global state dùng chung toàn app đặt trong `src/app/store/`.
- State riêng của một feature có thể đặt trong `features/ten-feature/store/`.
- Không lạm dụng Zustand cho mọi thứ.
- State chỉ dùng trong một component nhỏ thì vẫn dùng `useState`.
- State form tạm thời thì ưu tiên giữ trong component hoặc custom hook.
- State dùng chung nhiều page/component thì mới đưa vào Zustand.

---

## 9. Khi nào dùng Zustand?

Nên dùng Zustand cho:

- Trạng thái đăng nhập.
- token.
- Trạng thái sidebar mở/đóng.
- Thông tin phân quyền cần dùng nhiều nơi.
- Bộ lọc tìm kiếm dùng chung giữa nhiều component.
- State cần giữ khi chuyển page.
- Global loading hoặc toast notification nếu cần.

Không cần dùng Zustand cho:

- Input form chỉ dùng trong một form.
- Modal chỉ dùng trong một component.
- Loading riêng của một API call nhỏ.
- State chỉ dùng trong một page đơn giản.
- Dữ liệu có thể lấy lại trực tiếp từ API và không cần dùng chung.

Ví dụ đúng:

```js
import { create } from "zustand";

/**
 * Store quản lý trạng thái đóng/mở sidebar.
 */
export const useSidebarStore = create((set) => ({
  isOpen: true,

  /**
   * Đảo trạng thái sidebar giữa mở và đóng.
   */
  toggleSidebar: () => {
    set((state) => ({
      isOpen: !state.isOpen,
    }));
  },

  /**
   * Đóng sidebar.
   */
  closeSidebar: () => {
    set({
      isOpen: false,
    });
  },
}));
```

---

## 10. Bảo mật: chỉ lưu token, không lưu thông tin nhạy cảm

Về bảo mật, nhóm cần tuân thủ nguyên tắc:

```txt
Chỉ lưu token cần thiết.
Không lưu thông tin người dùng nhạy cảm ở localStorage/sessionStorage.
```

Không nên lưu:

- Password.
- Full user profile.
- Số điện thoại nếu không cần.
- Ngày sinh nếu không cần.
- Role chi tiết nếu backend đã kiểm soát bằng token.
- Bất kỳ dữ liệu cá nhân nhạy cảm nào.

Không làm:

```js
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("password", password);
localStorage.setItem("fullProfile", JSON.stringify(profile));
```

Nên làm:

```js
localStorage.setItem("token", token);
```

Nếu cần thông tin user để hiển thị UI, nên gọi API `/me` hoặc endpoint tương đương từ backend sau khi có token.

Luồng đề xuất:

```txt
Login thành công
 ↓
Lưu token
 ↓
Lấy thông tin user
Gọi API lấy thông tin user nếu cần
 ↓
Chỉ giữ user ở memory store nếu cần hiển thị
 ↓
Không persist thông tin nhạy cảm xuống localStorage
```

---

<!-- ## 11. Chuẩn Auth Store với Zustand

Auth store nên đặt tại:

```txt
src/app/store/authStore.js
```

Ví dụ tham khảo:

```js
import { create } from "zustand";
/**
 * Store quản lý trạng thái xác thực của người dùng.
 * Chỉ lưu access token để hạn chế rủi ro rò rỉ dữ liệu nhạy cảm.
 */
export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),

  /**
   * Lưu token sau khi đăng nhập thành công.
   * Không lưu password hoặc thông tin user nhạy cảm vào localStorage.
   *
   * @param {string} accessToken - Token xác thực được trả về từ backend.
   */
  loginSuccess: (accessToken) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    set({
      accessToken,
      isAuthenticated: true,
    });
  },

  /**
   * Xóa token và reset trạng thái đăng nhập khi người dùng đăng xuất.
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

    set({
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
```

Lưu ý:

- Không đặt key quá dài hoặc khó hiểu.
- Không đặt key chứa thông tin nhạy cảm.
- Không lưu toàn bộ object user vào localStorage.
- Nếu cần user info, tạo API `getCurrentUser()` và chỉ giữ trong memory state khi cần.

--- -->

## 12. Quy tắc đặt tên khóa lưu trữ

Các key lưu trong `localStorage` hoặc `sessionStorage` phải đơn giản, rõ nghĩa và thống nhất.

Nên dùng:

```txt
token
refreshToken
theme
language
sidebarState
```

Không nên dùng:

```txt
scientific_journal_publication_trend_tracking_system_current_logged_in_user_access_token_value
token_user_login_data_final
abc123
data
userInfoFull
```

Quy tắc:

- Tên key ngắn gọn.
- Đọc vào hiểu ngay.
- Dùng camelCase.
- Không chứa dữ liệu nhạy cảm trong tên key.
- Không tạo nhiều key trùng ý nghĩa.
- Nếu dùng nhiều nơi, nên khai báo thành constant.

Ví dụ:

```js
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  THEME: "theme",
};
```

Có thể đặt tại:

```txt
src/shared/constants/storageKeys.js
```

---

## 13. Bắt buộc viết chú thích cho hàm

Các hàm quan trọng cần có chú thích để hỗ trợ quá trình review code.

Bắt buộc comment cho:

- Hàm trong store Zustand.
- Hàm gọi API.
- Hàm service xử lý dữ liệu.
- Hàm submit form.
- Hàm validate dữ liệu.
- Hàm có logic nghiệp vụ.
- Hàm có xử lý token, permission hoặc role.

Không nhất thiết comment cho:

- Component quá đơn giản.
- Hàm inline rất ngắn.
- Biến tạm thời dễ hiểu.
- JSX hiển thị thông thường.

Ví dụ đúng:

```js
/**
 * Lấy danh sách subject areas từ backend.
 *
 * @param {Object} params - Tham số phân trang và tìm kiếm.
 * @param {number} params.page - Trang hiện tại.
 * @param {number} params.limit - Số bản ghi trên mỗi trang.
 * @returns {Promise<Object>} Danh sách subject areas và thông tin phân trang.
 */
async function getSubjectAreas(params) {
  const response = await subjectAreaApi.getAll(params);
  return response.data.data;
}
```

Ví dụ không cần thiết:

```js
// Set loading bằng true
setLoading(true);
```

Comment không nên mô tả lại điều quá hiển nhiên. Comment nên giải thích mục đích, đầu vào, đầu ra, hoặc lý do xử lý.

---

## 14. Chuẩn route

Route chính nên đặt trong:

```txt
src/app/routes/AppRoutes.jsx
```

Ví dụ:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../features/auth/pages/LoginPage";
import SubjectAreaListPage from "../../features/subject-areas/pages/SubjectAreaListPage";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="subject-areas" element={<SubjectAreaListPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/subject-areas" replace />} />
    </Routes>
  );
}
```

`App.jsx` chỉ nên gọn:

```jsx
import AppRoutes from "./app/routes/AppRoutes";

export default function App() {
  return <AppRoutes />;
}
```

Không nên nhét toàn bộ route, layout, page và logic vào `App.jsx`.

---

## 15. Chuẩn cho feature CRUD

Khi làm một CRUD mới, ví dụ `Subject Area`, nên tạo cấu trúc:

```txt
features/subject-areas/
├── api/
│   └── subjectAreaApi.js
├── components/
│   ├── SubjectAreaForm.jsx
│   └── SubjectAreaTable.jsx
├── hooks/
│   ├── useSubjectAreas.js
│   └── useSubjectAreaForm.js
├── pages/
│   ├── SubjectAreaListPage.jsx
│   ├── SubjectAreaCreatePage.jsx
│   └── SubjectAreaEditPage.jsx
├── services/
│   └── subjectAreaService.js
├── store/
│   └── subjectAreaFilterStore.js
├── validations/
│   └── subjectAreaValidation.js
└── index.js
```

Luồng đúng:

```txt
Page
 ↓
Hook
 ↓
Service
 ↓
API
 ↓
httpClient
 ↓
Backend
```

Không đi tắt kiểu:

```txt
Page
 ↓
Axios trực tiếp
 ↓
Backend
```

---

## 16. Checklist tự review sau khi vibe code

Sau khi code xong, thành viên tự tick checklist này.

### 16.1. Cấu trúc thư mục

- [ ] Feature mới nằm trong `src/features/ten-feature/`.
- [ ] Page nằm trong `pages/`.
- [ ] Component riêng của feature nằm trong `components/`.
- [ ] API nằm trong `api/`.
- [ ] Service nằm trong `services/`.
- [ ] Hook nằm trong `hooks/`.
- [ ] Store riêng của feature nằm trong `store/` nếu có.
- [ ] Validation nằm trong `validations/` nếu có.
- [ ] Component dùng chung mới đưa vào `shared/components/`.
- [ ] Constant dùng chung đưa vào `shared/constants/`.
- [ ] Không tạo file lung tung trực tiếp trong `src/` nếu không cần.

### 16.2. Component

- [ ] Component có tên PascalCase.
- [ ] Component không gọi API trực tiếp.
- [ ] Component không quá dài.
- [ ] Component nhận dữ liệu qua props.
- [ ] Component không chứa quá nhiều logic nghiệp vụ.
- [ ] Component có xử lý trạng thái rỗng/loading/error nếu cần.

### 16.3. Page

- [ ] Page chỉ đóng vai trò ghép màn hình.
- [ ] Page không chứa quá nhiều JSX chi tiết.
- [ ] Page không gọi Axios trực tiếp.
- [ ] Page dùng hook/service phù hợp.
- [ ] Tên page rõ nghĩa, ví dụ `JournalListPage.jsx`.

### 16.4. API và Service

- [ ] API file chỉ gọi HTTP.
- [ ] API dùng `httpClient`, không dùng `axios` trực tiếp.
- [ ] Không hard-code `localhost` trong API file.
- [ ] Service xử lý dữ liệu trả về từ API.
- [ ] Service không chứa JSX.
- [ ] Các endpoint đúng với BE đã thống nhất.
- [ ] Hàm API quan trọng có comment.
- [ ] Hàm service quan trọng có comment.

### 16.5. Hook

- [ ] Hook bắt đầu bằng `use`.
- [ ] Hook gom logic fetch/submit rõ ràng.
- [ ] Hook có xử lý `loading`.
- [ ] Hook có xử lý `error`.
- [ ] Hook không bị quá dài.
- [ ] Hook không làm thay vai trò của service.

### 16.6. Zustand và state management

- [ ] State dùng chung đã được quản lý bằng Zustand nếu phù hợp.
- [ ] Không tạo nhiều Context Provider lồng nhau nếu không thật sự cần.
- [ ] Store global nằm trong `src/app/store/`.
- [ ] Store riêng của feature nằm trong `features/ten-feature/store/` nếu có.
- [ ] Hàm trong Zustand store có comment.
- [ ] Không đưa state nhỏ, chỉ dùng một component, vào Zustand một cách không cần thiết.
- [ ] Không dùng Zustand để thay thế toàn bộ local state của form nếu không cần.

### 16.7. Route

- [ ] Route được khai báo trong `app/routes/`.
- [ ] Page mới đã được add route.
- [ ] Route cần đăng nhập đã bọc `ProtectedRoute`.
- [ ] Không nhét toàn bộ route vào `App.jsx`.
- [ ] Path đặt rõ nghĩa và nhất quán.

### 16.8. Env và bảo mật

- [ ] Không commit file `.env`.
- [ ] Có `.env.example`.
- [ ] API base URL lấy từ `import.meta.env.VITE_API_BASE_URL`.
- [ ] Không hard-code token.
- [ ] Không commit tài khoản, mật khẩu, secret.
- [ ] Không log token/user nhạy cảm ra console.
- [ ] Không lưu password vào localStorage/sessionStorage.
- [ ] Không lưu full user profile vào localStorage/sessionStorage.
- [ ] Chỉ lưu token cần thiết.
- [ ] Token key đặt đơn giản, ví dụ `accessToken`.
- [ ] Key lưu trữ được khai báo thành constant nếu dùng nhiều nơi.
- [ ] Khi logout có xóa token khỏi storage.
- [ ] Khi refresh page, app đọc lại token từ storage đúng cách.

### 16.9. Code quality

- [ ] Chạy được `npm run dev`.
- [ ] Chạy được `npm run build`.
- [ ] Chạy được `npm run lint` nếu project có script lint.
- [ ] Không còn console.log debug thừa.
- [ ] Không còn import không dùng.
- [ ] Không còn file rỗng không cần thiết.
- [ ] Không duplicate component/service quá nhiều.
- [ ] Không đặt tên file/tên biến mơ hồ.
- [ ] Hàm quan trọng đã có comment.

---

## 17. Checklist tái cấu trúc theo tiêu chuẩn mới

Trưởng nhóm đề nghị tái cấu trúc các yêu cầu hiện có để đảm bảo toàn bộ hệ thống hoạt động đồng bộ theo tiêu chuẩn mới.

Khi refactor code cũ, kiểm tra:

- [ ] Code cũ có đang dùng Context Provider không cần thiết không?
- [ ] Có thể chuyển state global sang Zustand không?
- [ ] Auth hiện tại có đang lưu user object vào localStorage không?
- [ ] Có đang lưu dữ liệu nhạy cảm không?
- [ ] Có nhiều key storage bị trùng ý nghĩa không?
- [ ] Key storage có quá dài hoặc khó hiểu không?
- [ ] Các hàm store đã có comment chưa?
- [ ] Các hàm API/service đã có comment chưa?
- [ ] Có component nào gọi API trực tiếp cần chuyển sang service không?
- [ ] Có feature nào đi lệch luồng `Page -> Hook -> Service -> API -> httpClient` không?
- [ ] Có route hoặc protected route nào đang phụ thuộc vào dữ liệu user lưu dưới localStorage không?
- [ ] Có cần cập nhật `.env.example` không?
- [ ] Có cần cập nhật README hoặc tài liệu hướng dẫn team không?

---

## 18. Prompt mẫu để AI agent review toàn bộ code

Copy prompt này vào AI agent:

```txt
Bạn là Senior Frontend Reviewer cho dự án React + Vite tên Scientific Journal Publication Trend Tracking System.

Hãy review code hiện tại dựa trên file FRONTEND_STRUCTURE_REVIEW_GUIDE.md này.

Yêu cầu review:
1. Kiểm tra cấu trúc thư mục có đúng chuẩn không.
2. Kiểm tra file nào đang đặt sai vị trí.
3. Kiểm tra Page, Component, Hook, Service, API đã đúng vai trò chưa.
4. Kiểm tra có component nào gọi API trực tiếp không.
5. Kiểm tra có hard-code API URL, token, secret, localhost không.
6. Kiểm tra route có được tách đúng trong app/routes không.
7. Kiểm tra auth/protected route/store có hợp lý không.
8. Kiểm tra code có duplicate hoặc quá dài không.
9. Kiểm tra naming convention.
10. Kiểm tra có dùng Zustand đúng với yêu cầu của người hướng dẫn không.
11. Kiểm tra có Context Provider lồng nhau không cần thiết không.
12. Kiểm tra localStorage/sessionStorage có đang lưu dữ liệu nhạy cảm không.
13. Kiểm tra tên key lưu trữ có đơn giản và thống nhất không.
14. Kiểm tra hàm quan trọng đã có comment chưa.
15. Đề xuất refactor cụ thể theo từng file.

Output mong muốn:
- Tổng quan: Đạt / Chưa đạt.
- Danh sách vấn đề theo mức độ: Critical, Major, Minor.
- Với mỗi vấn đề, ghi rõ:
  - File liên quan.
  - Vấn đề là gì.
  - Vì sao sai hoặc chưa tối ưu.
  - Cách sửa cụ thể.
- Cuối cùng cho checklist những việc cần sửa trước khi merge.
```

---

## 19. Prompt mẫu để review một feature cụ thể

Dùng khi một thành viên vừa code xong một feature, ví dụ `subject-areas`.

```txt
Bạn là Senior Frontend Reviewer.

Hãy review riêng feature sau: src/features/subject-areas

Dựa trên file FRONTEND_STRUCTURE_REVIEW_GUIDE.md, hãy kiểm tra:
1. Cấu trúc feature có đúng không.
2. API, service, hook, page, component có tách đúng vai trò không.
3. Có gọi API trực tiếp trong component/page không.
4. Có hard-code URL không.
5. Có xử lý loading/error/empty state không.
6. Có duplicate code không.
7. Có file nào nên chuyển sang shared không.
8. Có vấn đề gì khi tích hợp với Backend API không.
9. Nếu feature có state dùng chung, có dùng Zustand phù hợp không.
10. Có lưu dữ liệu nhạy cảm vào storage không.
11. Hàm quan trọng đã có comment chưa.

Output:
- Feature này đạt bao nhiêu phần trăm so với chuẩn.
- Những điểm đúng.
- Những điểm cần sửa.
- Đề xuất cấu trúc file sau khi refactor.
- Đưa ra patch hoặc code mẫu nếu cần.
```

---

## 20. Prompt refactor Auth theo Zustand và bảo mật token

Dùng prompt này nếu cần yêu cầu AI agent refactor riêng phần Auth:

```txt
Bạn là Senior Frontend Engineer.

Hãy refactor phần Auth của dự án React + Vite theo tiêu chuẩn sau:

1. Dùng Zustand để quản lý trạng thái đăng nhập.
2. Chỉ lưu accessToken vào localStorage.
3. Không lưu password, full user object hoặc thông tin nhạy cảm vào localStorage.
4. Tên key lưu trữ token là accessToken.
5. Tạo constant cho storage key nếu key được dùng nhiều nơi.
6. httpClient phải tự động gắn Authorization Bearer token từ localStorage.
7. Khi logout phải xóa token khỏi localStorage và reset auth store.
8. Các function trong authStore, authApi, authService phải có comment.
9. Không dùng nhiều Context Provider lồng nhau cho Auth.
10. Giữ luồng Page -> Hook -> Service -> API -> httpClient.

Hãy trả về:
- Cấu trúc file đề xuất.
- Code mẫu cho authStore.js.
- Code mẫu cho authApi.js.
- Code mẫu cho authService.js.
- Code mẫu cho useAuth.js.
- Những file cần sửa trong route/protected route.
```

---

## 21. Prompt mẫu để review trước khi tạo Pull Request

```txt
Bạn là Senior Frontend Reviewer.

Tôi chuẩn bị tạo Pull Request. Hãy review toàn bộ thay đổi hiện tại theo checklist sau:

1. Có file nào đặt sai thư mục không?
2. Có phá vỡ cấu trúc app/features/shared không?
3. Có hard-code API URL, token, secret không?
4. Có import thừa hoặc file rỗng không?
5. Có component/page quá dài không?
6. Có duplicate code không?
7. Có route nào sai hoặc thiếu ProtectedRoute không?
8. Có dùng đúng httpClient không?
9. Có dùng Zustand đúng tiêu chuẩn mới không?
10. Có lưu dữ liệu user nhạy cảm vào localStorage/sessionStorage không?
11. Tên key lưu trữ có đơn giản, rõ nghĩa không?
12. Hàm quan trọng đã có comment chưa?
13. Có ảnh hưởng đến các feature khác không?
14. Có cần cập nhật README hoặc .env.example không?

Hãy trả lời theo format:
- Có thể merge không: Có / Không.
- Lý do.
- Danh sách lỗi bắt buộc sửa trước khi merge.
- Danh sách góp ý có thể sửa sau.
```

---

## 22. Quy tắc khi thêm feature mới

Khi thêm feature mới, ví dụ `journals`, làm theo thứ tự:

### Bước 1: Tạo folder feature

```txt
features/journals/
├── api/
├── components/
├── hooks/
├── pages/
├── services/
├── store/
├── validations/
└── index.js
```

### Bước 2: Tạo API file

```txt
features/journals/api/journalApi.js
```

### Bước 3: Tạo service

```txt
features/journals/services/journalService.js
```

### Bước 4: Tạo hook

```txt
features/journals/hooks/useJournals.js
```

### Bước 5: Tạo store nếu có state dùng chung

```txt
features/journals/store/journalFilterStore.js
```

Chỉ tạo store nếu feature có state cần dùng chung giữa nhiều component/page.

### Bước 6: Tạo component

```txt
features/journals/components/JournalTable.jsx
features/journals/components/JournalForm.jsx
```

### Bước 7: Tạo page

```txt
features/journals/pages/JournalListPage.jsx
features/journals/pages/JournalCreatePage.jsx
features/journals/pages/JournalEditPage.jsx
```

### Bước 8: Add route

```txt
app/routes/AppRoutes.jsx
```

### Bước 9: Chạy kiểm tra

```bash
npm run dev
npm run build
npm run lint
```

---

## 23. Quy tắc import

Nên import theo hướng từ ngoài vào trong:

```txt
page -> hook -> service -> api -> httpClient
```

Không nên để feature này import sâu vào feature khác.

Ví dụ không nên:

```js
import JournalForm from "../../journals/components/JournalForm";
```

Nếu cần dùng chung, chuyển component đó vào `shared/components/`.

---

## 24. Quy tắc tránh duplicate code

Nếu cùng một đoạn code xuất hiện từ 2 lần trở lên, cân nhắc đưa vào:

- `shared/components/` nếu là UI.
- `shared/hooks/` nếu là hook.
- `shared/utils/` nếu là hàm xử lý dữ liệu.
- `shared/services/` nếu là service nền tảng như HTTP client.
- `shared/constants/` nếu là constant dùng chung.

Ví dụ nên đưa vào shared:

```txt
Pagination
SearchInput
ConfirmDeleteModal
LoadingSpinner
EmptyState
formatDate
formatNumber
useDebounce
STORAGE_KEYS
```

Không nên mỗi feature tự viết lại một bản `Pagination`.

---

## 25. Quy tắc style

Tạm thời ưu tiên:

- CSS module hoặc CSS thường theo component.
- Không viết style inline quá nhiều.
- Không để class name quá mơ hồ.
- Không copy CSS trùng lặp giữa nhiều component.
- Style global để trong `shared/styles/` hoặc `index.css`.

Ví dụ:

```txt
shared/styles/variables.css
shared/styles/global.css
features/subject-areas/components/SubjectAreaTable.css
```

---

## 26. Những lỗi thường gặp sau khi vibe code

### Lỗi 1: Code hết vào `App.jsx`

Sai vì `App.jsx` chỉ nên là entry component.

Nên sửa:

```jsx
import AppRoutes from "./app/routes/AppRoutes";

export default function App() {
  return <AppRoutes />;
}
```

### Lỗi 2: Component gọi API trực tiếp

Sai:

```jsx
useEffect(() => {
  axios.get("http://localhost:8082/api/v1/subject-areas");
}, []);
```

Đúng:

```jsx
const { subjectAreas, loading, error } = useSubjectAreas();
```

### Lỗi 3: Hard-code base URL

Sai:

```js
axios.get("http://localhost:8082/api/v1/journals");
```

Đúng:

```js
httpClient.get("/journals");
```

### Lỗi 4: Mỗi feature tự viết lại Table

Nếu table có thể dùng chung, nên tạo:

```txt
shared/components/Table/DataTable.jsx
```

### Lỗi 5: Logic form quá dài trong Page

Nếu form dài, tách ra:

```txt
components/SubjectAreaForm.jsx
hooks/useSubjectAreaForm.js
validations/subjectAreaValidation.js
```

### Lỗi 6: Lưu full user vào localStorage

Sai:

```js
localStorage.setItem("user", JSON.stringify(user));
```

Đúng:

```js
localStorage.setItem("accessToken", accessToken);
```

### Lỗi 7: Tạo nhiều Provider lồng nhau không cần thiết

Sai:

```jsx
<AuthProvider>
  <UserProvider>
    <RoleProvider>
      <App />
    </RoleProvider>
  </UserProvider>
</AuthProvider>
```

Đúng hơn:

```js
import { useAuthStore } from "./app/store/authStore";
```

### Lỗi 8: Hàm quan trọng không có comment

Sai:

```js
async function login(data) {
  const response = await authApi.login(data);
  return response.data;
}
```

Đúng:

```js
/**
 * Gửi thông tin đăng nhập lên backend và trả về dữ liệu xác thực.
 *
 * @param {Object} data - Email và password người dùng nhập.
 * @returns {Promise<Object>} Dữ liệu đăng nhập từ backend.
 */
async function login(data) {
  const response = await authApi.login(data);
  return response.data;
}
```

---

## 27. Definition of Done cho một feature

Một feature chỉ được xem là xong khi:

- [ ] Có cấu trúc đúng trong `src/features/`.
- [ ] Có API/service/hook/page/component tách rõ.
- [ ] Không gọi Axios trực tiếp trong component/page.
- [ ] Không hard-code API base URL.
- [ ] Có loading/error/empty state.
- [ ] Có route truy cập được.
- [ ] Có xử lý trường hợp API lỗi.
- [ ] Nếu có state dùng chung, đã dùng Zustand đúng cách.
- [ ] Không lạm dụng Context Provider.
- [ ] Không lưu thông tin người dùng nhạy cảm vào localStorage/sessionStorage.
- [ ] Chỉ lưu token cần thiết.
- [ ] Key lưu trữ đặt đơn giản và rõ nghĩa.
- [ ] Hàm quan trọng đã có comment.
- [ ] Hàm trong store đã có comment.
- [ ] Hàm API/service đã có comment.
- [ ] Auth/logout/token flow đã được kiểm tra nếu feature liên quan auth.
- [ ] Build không lỗi.
- [ ] Lint không lỗi nghiêm trọng.
- [ ] Đã dùng AI agent review theo prompt ở trên.
- [ ] Đã sửa các lỗi Critical và Major trước khi merge.

---

## 28. Gợi ý thứ tự làm cho team

Nên làm theo thứ tự:

```txt
1. shared/constants/storageKeys.js
2. shared/services/httpClient.js
3. app/store/authStore.js
4. app/routes/AppRoutes.jsx
5. app/routes/ProtectedRoute.jsx
6. app/layouts/AuthLayout.jsx
7. app/layouts/AdminLayout.jsx
8. features/auth
9. features/subject-areas
10. features/subject-categories
11. features/publishers
12. features/journals
13. features/rankings
14. features/articles
15. features/users
```

Lý do:

- Storage key và httpClient cần làm trước để thống nhất cách gọi API.
- Auth store bằng Zustand cần làm sớm để route/protected route dùng chung.
- Auth cần làm trước để có login/protected route.
- Subject Area đơn giản, phù hợp làm CRUD mẫu.
- Subject Category phụ thuộc Subject Area.
- Journal, Ranking, Article phức tạp hơn nên làm sau.
- User/role có thể làm sau khi auth ổn.

---

## 29. Ghi chú cho reviewer

Khi review code của thành viên khác, không chỉ xem giao diện chạy được hay không.

Cần kiểm tra thêm:

- Code có dễ bảo trì không.
- File có đúng vị trí không.
- Sau này thêm feature khác có bị rối không.
- Có làm sai kiến trúc chung không.
- Có làm ảnh hưởng đến thành viên khác không.
- Có tuân thủ luồng `Page -> Hook -> Service -> API -> httpClient` không.
- Có dùng Zustand đúng với yêu cầu mới không.
- Có lưu dữ liệu nhạy cảm vào storage không.
- Có đặt key storage rõ nghĩa không.
- Có comment cho hàm quan trọng không.

---

## 30. Tóm tắt tiêu chuẩn mới cho team

```txt
State dùng chung       -> Zustand
Auth token             -> Chỉ lưu token
Sensitive user data    -> Không lưu vào localStorage
Storage key            -> Ngắn gọn, rõ nghĩa
Function quan trọng    -> Phải có comment
Refactor code cũ       -> Đồng bộ lại theo chuẩn mới
Review bằng AI agent   -> Dùng prompt trong file này
```

Nguyên tắc cần nhớ:

```txt
Dùng Zustand để code gọn.
Chỉ lưu token để giảm rủi ro bảo mật.
Đặt key đơn giản để dễ kiểm soát.
Comment hàm để reviewer hiểu nhanh.
Refactor đồng bộ để cả hệ thống không bị lệch chuẩn.
```

---

## 31. Kết luận

Mục tiêu của cấu trúc này không phải làm project phức tạp hơn, mà là để team code nhanh nhưng vẫn kiểm soát được chất lượng.

Mỗi thành viên có thể vibe code, nhưng trước khi merge cần dùng file này để kéo code về đúng chuẩn chung.

Nguyên tắc quan trọng nhất:

```txt
Code chạy được là chưa đủ.
Code phải đúng cấu trúc để cả team còn phát triển tiếp được.
```
