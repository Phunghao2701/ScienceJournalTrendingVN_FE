---
title: "Lens-Style Detail, Sidebar and MathJax Rendering"
kind: "prd"
created_at: "2026-06-29T13:40:54.587Z"
source: "repo-harness-mcp"
---
# Lens-Style Detail, Sidebar and MathJax Rendering

> **Status**: Draft

## Idea

Hoàn thiện Paper VN Article Discovery/Detail theo phong cách Lens: filter chip hiện tên thật, topic chip không có tiền tố thừa, detail metadata không lặp và chỉ hiển thị field có dữ liệu, authors có superscript affiliation và Institutions section, Citation/Reference hiển thị đúng nghĩa, detail sidebar có citing works chart và metadata card chuẩn, list sidebar ưu tiên Top Vietnamese Institutions/Publication Year/Top Authors/Top Topics, đồng thời tích hợp better-react-mathjax để render MathML trong title và các title liên quan an toàn.

## Problem

UI hiện còn Publisher #ID/Author #ID; topic chip ghi Research Topics; volume/issue dùng mojibake dash; metadata Published/E-Published lặp; authors chưa gắn institutions; Citation Count bị thay bằng citingWorksTotal và Reference Count bị thay bằng referencesTotal; detail sidebar thiếu chart; list sidebar chưa phù hợp sản phẩm; raw MathML xuất hiện trong title.

## Users

- Người dùng khám phá Paper VN
- Nhóm frontend/UX
- Nhóm kiểm thử sản phẩm

## Goals

- Resolve filter chip ID thành display name sau refresh và hiển thị topic chip chỉ bằng tên topic
- Tích hợp đúng một MathJaxContext và reusable ScientificMathText bằng better-react-mathjax để render mixed text + MathML an toàn
- Áp dụng ScientificMathText cho list/detail/recommended/citing works/references titles và giữ plain-text helper cho export/search
- Trình bày article detail header/summary giống Lens hơn với metadata có điều kiện, không duplicate và không mojibake
- Trình bày authors với affiliation superscripts, author action popover và Institutions section
- Tách Citation Count/Reference Count khỏi Citing Works/Available References counts trong header và tabs
- Thêm citing works by year chart và metadata card đúng dữ liệu ở detail sidebar
- Cải tiến list sidebar thành Top Vietnamese Institutions, Publication Year histogram, Top Authors và Top Topics bar charts có click-to-filter
- Giữ toàn bộ click filters, URL state, accessibility và responsive behavior

## Non-goals

- Không dựng dữ liệu Lens giả
- Không triển khai Collections, Notes hoặc Tags nếu backend chưa có
- Không render unsanitized database HTML bằng dangerouslySetInnerHTML
- Không redesign toàn bộ app ngoài Paper VN flow
- Không cài dependency mới ngoài better-react-mathjax nếu không được yêu cầu thêm

## Acceptance Criteria

- [ ] Filter chips hiển thị tên thật; topic chip không có Research Topics prefix
- [ ] Không còn raw mml:math hoặc mojibake trong visible titles/metadata
- [ ] MathML fraction/subscript/superscript render đúng và malformed/unsafe input fallback an toàn
- [ ] Authors hiển thị affiliation superscripts và Institutions section từ API thật
- [ ] Header metric và tab counts dùng đúng nguồn semantic
- [ ] Detail sidebar có citing works year chart và một metadata card không lặp
- [ ] List sidebar ưu tiên institution ranking và các chart tương tác đúng filter ID
- [ ] Targeted lint/build/tests pass và manual Lens comparison checklist được ghi lại

## Workflow Contract

- PRD is the source of product intent.
- Sprint must be generated as ordered checklist task cards.
- Codex execution must happen through a host-native `/goal` prompt or local Codex session, not through remote MCP execution.

## Handoff Notes

Cho phép cài duy nhất better-react-mathjax. Khuyến nghị parse MathML bằng DOMParser + allowlist React nodes, không dùng unsanitized innerHTML. FE goal phụ thuộc final BE handoff.
