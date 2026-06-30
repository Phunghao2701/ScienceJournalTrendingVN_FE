---
title: "Paper VN English UI and Click-to-Filter"
kind: "prd"
created_at: "2026-06-29T07:18:06.163Z"
source: "repo-harness-mcp"
---
# Paper VN English UI and Click-to-Filter

> **Status**: Draft

## Idea

Hoàn thiện toàn bộ Paper VN Article Discovery và Detail flow bằng tiếng Anh, sửa triệt để lỗi encoding/mojibake, đồng thời biến journal, publisher, author, topic và keyword thành các điểm click-to-filter dùng ID. Đồng bộ URL params, list và analytics; loại bỏ frontend keyword/topic fallback sau khi backend hỗ trợ unified search; sửa analytics mapping, pagination limit, stats labels và các request detail/recommended còn thiếu scope.

## Problem

UI hiện trộn tiếng Việt/tiếng Anh và nhiều chuỗi bị lỗi encoding; top authors hiển thị Unknown; access analytics rỗng; list và analytics lệch khi FE fallback; một số request detail không gửi scope; journal/publisher/author/topic/keyword chưa có hành vi drill-down thống nhất; vẫn còn thuật ngữ patent và stats gắn nhãn sai.

## Users

- Người dùng khám phá Paper VN
- Nhóm frontend và UX
- Nhóm kiểm thử sản phẩm

## Goals

- Đặt English là ngôn ngữ mặc định và loại bỏ mọi visible Vietnamese/mojibake trong Paper VN flow cùng shared navigation liên quan
- Thêm click-to-filter bằng ID cho journal, publisher, author, topic và keyword từ card, detail và analytics sidebar
- Bổ sung URL/filter state cho publisher_id, author_id, keyword_id và giữ journal_id/topic_id
- Đảm bảo list và analytics dùng cùng normalized params và fixed scope=vn_universities
- Sửa analytics mapping theo contract mới và không còn Unknown do sai field
- Bỏ frontend fallback keyword/topic sau khi unified search backend sẵn sàng
- Thay toàn bộ patent terminology/stats bằng article-specific English labels và số liệu thật
- Sửa pagination limit, detail/recommended requests và non-clickable Unknown entities

## Non-goals

- Không triển khai core Trending VN dashboard
- Không cài dependency mới
- Không thực hiện redesign toàn bộ hệ thống
- Không tạo backend bookmark persistence

## Acceptance Criteria

- [ ] Paper VN list/detail/shared controls hiển thị English sạch, không còn mojibake
- [ ] Click journal/publisher/author/topic/keyword cập nhật URL bằng ID, reset page=1 và lọc đồng thời list + analytics
- [ ] Unknown/null analytics entities không click được
- [ ] Không còn frontend keyword/topic fallback gây lệch stats
- [ ] Top Authors và Access Distribution hiển thị đúng
- [ ] Mọi discovery/recommended request dùng scope=vn_universities
- [ ] Không còn Simple Families, Extended Families, Legal Status hay patent labels trong Paper VN flow
- [ ] Build và targeted lint pass; manual interaction checklist được ghi lại

## Workflow Contract

- PRD is the source of product intent.
- Sprint must be generated as ordered checklist task cards.
- Codex execution must happen through a host-native `/goal` prompt or local Codex session, not through remote MCP execution.

## Handoff Notes

Ưu tiên khôi phục UTF-8 từ version sạch rồi reapply logic, không sửa mojibake thủ công từng ký tự. Giữ URL là source of truth. Dùng ID filter, chỉ fallback text search nếu entity không có ID.
