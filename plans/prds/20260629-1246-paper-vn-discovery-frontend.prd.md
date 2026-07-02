---
title: "Paper VN Discovery Frontend Integration"
kind: "prd"
created_at: "2026-06-29T05:46:55.171Z"
source: "repo-harness-mcp"
---
# Paper VN Discovery Frontend Integration

> **Status**: Draft

## Idea

Hoàn thiện frontend trang Paper VN Article Discovery/Search để luôn dùng scope=vn_universities, gọi đúng API contract mới, sửa Open Access, loại bỏ N+1 detail enrichment, chuyển article list sang TanStack Query, dùng analytics API cho sidebar, bỏ nội dung patent không phù hợp, xử lý MathML title, sửa export và bookmark hỏng. Không triển khai core Trending VN.

## Problem

Trang hiện tại gọi /articles toàn database, gửi sai key/value Open Access, enrich từng bài bằng detail request, sidebar tính từ 10 bài trên page hoặc gọi publishers toàn hệ thống, bookmark gọi endpoint không tồn tại, còn nhiều thuật ngữ patent và export mô tả sai phạm vi.

## Users

- Người dùng khám phá Paper VN của các trường đại học Việt Nam
- Nhóm phát triển frontend
- Nhóm kiểm thử sản phẩm

## Goals

- Mọi request article discovery luôn dùng scope=vn_universities
- Sửa filter Open Access theo contract access=oa|closed
- Loại bỏ N+1 và dùng list metadata trực tiếp
- Chuyển useArticleList sang TanStack Query với query key đầy đủ
- Dùng article analytics API cho sidebar và stats
- Bỏ nội dung patent, xử lý MathML an toàn, sửa citation label và export
- Không gọi endpoint bookmark không tồn tại

## Non-goals

- Không triển khai dashboard core Trending VN
- Không đổi toàn bộ routing hoặc rename toàn bộ feature nếu gây merge conflict lớn
- Không cài dependency mới
- Không thay đổi schema database từ FE

## Acceptance Criteria

- [ ] GET /articles luôn có scope=vn_universities kể cả sau reset filter
- [ ] Open Access gửi access=oa và Closed Access gửi access=closed
- [ ] Không còn request /articles/:id cho từng card ở trang list
- [ ] Sidebar dùng analytics của toàn bộ result set đã lọc
- [ ] Không còn raw MathML/XML hoặc thuật ngữ patent trên UI
- [ ] Bookmark không gọi endpoint 404
- [ ] Export mô tả đúng phạm vi dữ liệu và CSV escaping đúng
- [ ] Build, lint và tests liên quan pass

## Workflow Contract

- PRD is the source of product intent.
- Sprint must be generated as ordered checklist task cards.
- Codex execution must happen through a host-native `/goal` prompt or local Codex session, not through remote MCP execution.

## Handoff Notes

Giữ structure page -> hook -> api. Dùng React-Bootstrap, Zustand chỉ khi cần global state, không cài dependency mới, không sửa core Trending VN.
