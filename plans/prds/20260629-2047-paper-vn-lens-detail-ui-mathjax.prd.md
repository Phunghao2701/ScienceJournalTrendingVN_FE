---
title: "Paper VN Lens Detail UI and MathJax Rendering"
kind: "prd"
created_at: "2026-06-29T13:47:06.708Z"
source: "repo-harness-mcp"
---
# Paper VN Lens Detail UI and MathJax Rendering

> **Status**: Draft

## Idea

Hoàn thiện Paper VN list/detail theo hướng Lens: filter chips hiển thị tên thay vì #ID, topic chip chỉ hiện tên, metadata detail sạch và không lặp, author hiển thị kèm affiliation/institutions, Citation Count và Reference Count dùng đúng semantics, detail sidebar có citing works chart và publication metadata, list sidebar ưu tiên institutions/year/authors/topics, đồng thời tích hợp better-react-mathjax để render MathML trong title thay vì hiển thị raw tags.

## Problem

Filter chips hiện Publisher #4 và Author #124; topic chip còn tiền tố Research Topics; detail vẫn còn mojibake â€”, metadata lặp, Volume/Issue null vẫn bị render, E-Published dùng dữ liệu giả, title/abstract có raw MathML, authors chưa có affiliation/institutions, tab Citation Count đang thực chất là Citing Works, sidebar detail thiếu citation-year chart và sidebar list chưa phù hợp với Paper VN.

## Users

- Người dùng khám phá và xem chi tiết Paper VN
- Nhóm frontend và UX
- Nhóm kiểm thử sản phẩm

## Goals

- Resolve tên journal/publisher/author/topic/keyword từ ID để filter chips luôn hiển thị tên sau refresh
- Topic chip chỉ hiện display_name, không có tiền tố Research Topics
- Tích hợp better-react-mathjax với một MathJaxContext và component ScientificMathText dùng lại cho title
- Làm sạch metadata detail: ẩn field null, bỏ metadata lặp, không giả E-Published/Pages/License
- Trình bày authors kèm affiliation markers và Institutions section giống Lens ở mức dữ liệu cho phép
- Tách Citation Count khỏi Citing Works và Reference Count khỏi Available References
- Thêm citing works year chart ở sidebar detail
- Cải thiện sidebar list theo Paper VN: institutions, publication year, top authors, top topics
- Loại mojibake còn lại và giữ toàn bộ UI tiếng Anh

## Non-goals

- Không sao chép pixel-perfect toàn bộ Lens
- Không tạo dữ liệu giả khi API không có
- Không triển khai Collections, Notes, Tags hoặc bookmark persistence
- Không sửa core Trending VN
- Không dùng unsanitized dangerouslySetInnerHTML
- Không cài thêm dependency ngoài better-react-mathjax và dependency bắt buộc của nó nếu package yêu cầu

## Acceptance Criteria

- [ ] Filter chips hiển thị display_name và không còn #ID; topic chip chỉ hiện tên
- [ ] Raw MathML không còn xuất hiện trong title list/detail/recommended/citing/reference
- [ ] MathJax render được inline MathML và fallback an toàn khi malformed
- [ ] Detail metadata không lặp, không còn â€”, không render Volume/Issue/E-Published khi thiếu
- [ ] Authors có affiliation superscript và Institutions section khi API trả dữ liệu
- [ ] Citation Count/Reference Count giữ metric Article; tabs dùng Citing Works/Available References relation totals
- [ ] Sidebar detail có chart theo năm và metadata card sạch
- [ ] Build, targeted lint và tests liên quan pass

## Workflow Contract

- PRD is the source of product intent.
- Sprint must be generated as ordered checklist task cards.
- Codex execution must happen through a host-native `/goal` prompt or local Codex session, not through remote MCP execution.

## Handoff Notes

Khôi phục UTF-8 trước khi chỉnh UI. Dùng ID làm URL filter, query entity endpoints để resolve label. MathJax content phải được parse/sanitize theo allowlist; không render raw DB HTML trực tiếp.
