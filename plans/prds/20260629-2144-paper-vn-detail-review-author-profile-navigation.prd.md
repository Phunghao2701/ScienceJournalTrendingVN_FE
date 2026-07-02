---
title: "Paper VN Detail Review Fixes and Author Profile Navigation"
kind: "prd"
created_at: "2026-06-29T14:44:59.049Z"
source: "repo-harness-mcp"
---
# Paper VN Detail Review Fixes and Author Profile Navigation

> **Status**: Draft

## Idea

Hoàn thiện các điểm còn thiếu sau sprint Lens-style Article Detail và thay đổi hành vi click tác giả trong trang chi tiết bài báo. Tên tác giả có author_id phải điều hướng tới hồ sơ công khai theo route /authors/:id. Hành vi lọc bài theo tác giả phải là action riêng tới /articles?author_id=:id&page=1, không dùng click tên tác giả để lọc. Đồng thời sửa các lỗi review còn lại: loại metadata publication type bị tự tạo, giữ relation counts đúng khi request phụ lỗi, tăng độ tin cậy của test MathML trong môi trường DOM/component, và chuẩn hóa các chuỗi UI thuộc file đã chạm sang tiếng Anh hoặc i18n.

## Problem

Hiện tên tác giả trong Article Detail gọi navigateEntityFilter và đưa người dùng về danh sách bài thay vì mở Author Detail dù route /authors/:id đã tồn tại. Một số metadata vẫn fallback thành Journal Article khi backend không trả dữ liệu, relation totals có thể hiển thị 0 sai khi API citing works/references lỗi, test MathML chủ yếu chạy utility fallback trong Node thay vì kiểm tra sanitizer/component trong DOM, và một số file đã chạm vẫn có chuỗi tiếng Việt không đồng nhất với Paper VN English UI.

## Users

- Người dùng xem chi tiết bài báo Paper VN
- Người dùng muốn mở hồ sơ tác giả từ bài báo
- Nhóm frontend và kiểm thử

## Goals

- Dùng route chuẩn /authors/:id cho author profile navigation từ cả /articles/:id và /trending/articles/:id
- Dùng semantic Link hoặc navigation có khả năng keyboard/open-new-tab cho tên tác giả có ID
- Giữ action lọc bài theo author_id tách biệt và có nhãn rõ ràng
- Không điều hướng hoặc search fallback khi tác giả thiếu author_id; hiển thị plain text
- Loại mọi fallback Journal Article hoặc publication metadata không có nguồn dữ liệu thật trong Paper VN detail flow
- Không ghi đè citing works/reference relation counts đúng bằng 0 khi request phụ thất bại hoặc chưa có response
- Bổ sung test DOM/component cho sanitizer MathML, unsafe attributes và dynamic rerender
- Chuẩn hóa chuỗi UI trong các file thuộc sprint sang English/i18n
- Chạy targeted lint, math tests, build và browser smoke cho author navigation

## Non-goals

- Không đổi route hiện tại sang /author/:id hoặc tạo route trùng lặp
- Không sửa backend nếu author detail endpoint hiện tại đã nhận author_id và trả dữ liệu đúng contract
- Không thay đổi core Trending VN ranking/trending logic
- Không tạo dữ liệu publication type, affiliation hoặc external link giả
- Không tự commit hoặc push

## Acceptance Criteria

- [ ] Click tên tác giả có ID trong main article detail, citing/reference/recommended cards liên quan mở /authors/{id}
- [ ] Route /authors/:id tiếp tục dùng AuthorDetailPage hiện có và hỗ trợ refresh trực tiếp
- [ ] Author thiếu ID không clickable và không fallback sang text search
- [ ] Có action riêng View articles by this author hoặc tương đương để mở /articles?author_id={id}&page=1 khi UI phù hợp
- [ ] Không còn hardcoded Journal Article dùng thay dữ liệu thiếu trong Paper VN detail flow
- [ ] Citing works và available references ưu tiên response relation API khi thành công, fallback về detail count khi response chưa có/lỗi, không hiển thị 0 giả
- [ ] Test xác nhận sanitizer loại script/event attributes trong DOM và component rerender khi prop thay đổi
- [ ] Các chuỗi thuộc ArticleTable/ArticleTableRow và detail flow đã chạm dùng English hoặc i18n
- [ ] Targeted ESLint, npm run test:scientific-math và npm run build pass; browser smoke xác nhận author link hoạt động

## Workflow Contract

- PRD is the source of product intent.
- Sprint must be generated as ordered checklist task cards.
- Codex execution must happen through a host-native `/goal` prompt or local Codex session, not through remote MCP execution.

## Handoff Notes

Route đề xuất chính thức: /authors/:id vì dự án đã có Route path="/authors/:id" và các trang author list/leaderboard đang dùng cùng convention plural collection. Ưu tiên React Router Link cho tên tác giả để hỗ trợ keyboard, copy link và open in new tab. Giữ /articles?author_id=:id&page=1 cho filter action riêng. Preserve unrelated dirty worktree changes and do not fabricate metadata.
