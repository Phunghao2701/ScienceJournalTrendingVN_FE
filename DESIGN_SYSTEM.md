# 🎨 Design System — ResearchPulse FE

> Tài liệu này mô tả hệ thống màu sắc và font chữ được áp dụng trong toàn bộ dự án frontend.
> Tất cả token được định nghĩa trong `src/index.css` dưới dạng CSS custom properties (`:root`).

---

## 🎨 Bảng màu (Color Palette)

Phong cách thiết kế tham chiếu theo **SCImago Journal Rank** — giao diện sáng, tối giản, chuyên nghiệp.

### Core Tokens

| CSS Variable       | Hex       | Vai trò                         | Preview           |
|--------------------|-----------|----------------------------------|-------------------|
| `--bg-main`        | `#FFFFFF` | Background chính toàn trang     | ⬜ White          |
| `--bg-section`     | `#ECECEC` | Background section / card nền   | 🔲 Light grey     |
| `--bg-chip`        | `#F2F2F2` | Chip, filter tag, input nền     | ▪️ Very light grey |
| `--bg-card`        | `#FFFFFF` | Surface card (white)            | ⬜ White          |
| `--border`         | `#E6E6E6` | Border / divider line           | ──                |

### Typography Colors

| CSS Variable       | Hex       | Vai trò                         |
|--------------------|-----------|----------------------------------|
| `--text-main`      | `#0D1B1C` | Text chính — heading, body       |
| `--text-muted`     | `#6B6B6B` | Text phụ — label, placeholder    |

### Accent & Action Colors

| CSS Variable       | Hex       | Vai trò                                    |
|--------------------|-----------|---------------------------------------------|
| `--primary`        | `#FF7A33` | Accent chính — link, icon active, border    |
| `--primary-light`  | `#FFF0E8` | Tint cam nhạt — active badge bg, hover bg   |
| `--btn-dark`       | `#071A1C` | Button đen đậm — CTA chính                  |
| `--q1-color`       | `#FF7A33` | Q1 Quartile badge — dùng accent cam         |

### Màu tiêu biểu — Quartile Badge

| Quartile | Background                    | Text Color       | Border                          |
|----------|-------------------------------|------------------|---------------------------------|
| Q1       | `rgba(255, 122, 51, 0.12)`    | `#FF7A33`        | `rgba(255, 122, 51, 0.3)`       |
| Q2       | `#FFF0E8` (`--primary-light`) | `#FF7A33`        | `#E6E6E6`                       |
| Q3 / Q4  | `#ECECEC` (`--bg-section`)    | `#6B6B6B`        | `#E6E6E6`                       |

---

## ✍️ Typography (Font chữ)

Font được import từ **Google Fonts** trong `src/index.css`.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700
  &family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700
  &display=swap');
```

### CSS Variables

| Variable          | Font Family       | Dùng cho                             |
|-------------------|-------------------|--------------------------------------|
| `--font-sans`     | `Inter`           | Body, button, menu, badge, table     |
| `--font-display`  | `Source Serif 4`  | Logo, heading, page title            |
| `--font-serif`    | `Source Serif 4`  | Alias của `--font-display`            |

### Bảng quy tắc font theo khu vực UI

| Khu vực UI            | Font Family       | Font Weight | CSS class / selector                  |
|-----------------------|-------------------|-------------|----------------------------------------|
| Logo / tên hệ thống   | Source Serif 4    | 700         | `.navbar-brand`, `.brand-font`         |
| Page title (h1, h2)   | Source Serif 4    | 600         | `h1`, `h2`, `.page-title`, `.font-display` |
| Section heading (h3)  | Source Serif 4    | 600         | `h3`                                   |
| Body text             | Inter             | 400         | `body`, `p`, `span`, `li`              |
| Menu / sidebar link   | Inter             | 500         | `.nav-link`, `.sidebar-link`           |
| Button                | Inter             | 500–600     | `.btn`, `button`                       |
| Table data (td)       | Inter             | 400         | `td`                                   |
| Table header (th)     | Inter             | 500         | `th`                                   |
| Badge / tag           | Inter             | 500         | `.badge`, `.tag`                       |

---

## 🧩 Utility Classes

| Class               | Tác dụng                                            |
|---------------------|-----------------------------------------------------|
| `.text-main`        | `color: var(--text-main)` — text màu đen chính      |
| `.text-muted-custom`| `color: var(--text-muted)` — text màu xám           |
| `.font-display`     | `font-family: Source Serif 4` — tiêu đề serif       |
| `.btn-primary-glow` | Button cam accent với shadow, hover animation       |
| `.btn-dark-solid`   | Button đen `--btn-dark` (#071A1C) với hover effect  |
| `.glass-card`       | Card glassmorphism, hover border cam + shadow       |
| `.journal-dark-card`| Card tiêu chuẩn — bg white, border #E6E6E6, r=12px |
| `.tab-nav-custom`   | Tab navigation — active màu cam + border-bottom cam |
| `.grid-bg`          | Background lưới nhạt (dùng trên page wrapper)       |
| `.skeleton-shimmer` | Shimmer loading skeleton animation                  |
| `.glow-gradient-text`| Text màu cam với clip gradient                    |

---

## 📁 File tham chiếu

| File                         | Nội dung                                        |
|------------------------------|-------------------------------------------------|
| `src/index.css`              | CSS Variables, base styles, utility classes     |
| `src/features/landing/components/Header.jsx` | Navbar với logo, nav links, auth buttons |
| `src/features/journal/components/JournalHero.jsx` | Quartile badge logic         |
| `src/features/journal/components/RankingTabContent.jsx` | SVG chart + table badge |

---

> **Lưu ý:** Không hardcode màu sắc trực tiếp trong JSX. Luôn dùng CSS variables từ `:root` để đảm bảo nhất quán và dễ thay đổi theme.
