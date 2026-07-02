---
title: "Paper VN URL-Synced List Table Analysis Views"
kind: "prd"
created_at: "2026-06-30T06:37:51.838Z"
source: "repo-harness-mcp"
---
# Paper VN URL-Synced List Table Analysis Views

> **Status**: Draft

## Idea

Triển khai trang Paper VN với ba chế độ đồng bộ URL: `/articles` mặc định List, `/articles?view=table` là Table, và `/articles?view=analysis` là Analysis. Analysis dùng endpoint mới `GET /api/v1/articles/analysis`, giữ nguyên toàn bộ discovery filters, chỉ tải query nặng khi view=analysis, và hiển thị summary, time series, top/growth entities, trending articles cùng citation-history coverage một cách trung thực.

## Problem

TrendingVNPage hiện giữ viewMode bằng local state nên refresh/back/forward/copy-link không giữ chế độ. Nút Analysis chỉ bật/tắt sidebar, chưa có dashboard. Trang luôn gọi article list và lightweight analytics; chưa có wrapper/hook cho `/articles/analysis`. Một số mapping sidebar cũ vẫn hardcode năm 2019–2026 và đọc sai access key. FE cần contract rõ ràng, responsive và không gọi analysis endpoint ở List/Table.

## Users

- Người dùng khám phá Paper VN
- Nhóm frontend ResearchPulse
- Nhóm backend và dữ liệu ScienceJournalTrendingVN

## Goals

- Đồng bộ view bằng query parameter với canonical List URL không có view param
- Giữ filters/search/entity/access trong URL khi chuyển List, Table và Analysis
- Hỗ trợ browser back/forward, refresh và copy link đúng view
- Chỉ bật `/articles/analysis` query khi view=analysis
- Không tải `/articles` list và `/articles/analytics` khi chỉ hiển thị Analysis
- Thêm API wrapper, mapper và TanStack Query hook cho analysis contract
- Hiển thị summary cards và OA unknown rõ ràng
- Hiển thị works_over_time và citations_over_time bằng component SVG/CSS responsive không cần thư viện chart mới
- Hiển thị Top và Growth riêng cho institutions, authors, journals, topics và keywords
- Hiển thị trending articles với current/previous citations, absolute growth và growth rate
- Hiển thị citation/trending coverage, không diễn giải dữ liệu thiếu là 0 coverage
- Cho phép click entity trong Analysis để áp dụng filter hiện có và giữ view=analysis
- Giữ detail navigation/returnTo quay về đúng URL results view
- Sửa lightweight analytics mapping access/year và bỏ hardcode năm
- Thêm loading, error, empty và partial-coverage states accessible
- Bổ sung pure utility tests, scoped ESLint, build và HTTP smoke

## Non-goals

- Không sửa backend
- Không sửa crawler hoặc schema
- Không dùng legacy `/trending-vn/*` ranking endpoints
- Không thêm chart dependency mới nếu SVG/CSS hiện có đủ
- Không tạo metric hoặc score ngoài response BE
- Không triển khai export dashboard nâng cao trong sprint này
- Không sửa repo-wide lint debt ngoài touched files
- Không commit hoặc push

## Acceptance Criteria

- [ ] `/articles` render List và URL không cần `view=list`
- [ ] `/articles?view=table` render Table; `/articles?view=analysis` render Analysis
- [ ] Invalid view được canonicalize về List mà không mất filters
- [ ] View switch bảo toàn search/year/journal/publisher/author/topic/keyword/access/from_year/to_year và reset/remove page khi phù hợp
- [ ] TanStack analysis query có `enabled: view === 'analysis'`; list/light analytics queries bị disable trong Analysis
- [ ] Analysis params luôn gửi `scope=vn_universities`, bỏ page/sort và hỗ trợ publication_year/from_year/to_year
- [ ] Summary hiển thị scholarly works, citations, references, authors, institutions, journals, OA open/closed/unavailable và available relation counts với nhãn đúng
- [ ] Time-series charts dùng toàn bộ window.years, zero rows đúng và hiển thị coverage denominator
- [ ] Top và Growth là hai chế độ/danh sách riêng; growth_rate nhân 100 khi format và null hiển thị New/N/A
- [ ] Trending articles chỉ render dữ liệu BE trả, có coverage eligible/total và link detail
- [ ] Entity click cập nhật ID filter, page=1 và giữ analysis view
- [ ] List/Table sidebar year/access dùng dynamic API rows và item.key, bao gồm Unknown access
- [ ] Detail returnTo giữ pathname, filters và view hiện tại
- [ ] Targeted utility tests pass; touched-file ESLint pass; npm build pass; dev HTTP smoke cho cả ba URL trả 200

## Workflow Contract

- PRD is the source of product intent.
- Sprint must be generated as ordered checklist task cards.
- Codex execution must happen through a host-native `/goal` prompt or local Codex session, not through remote MCP execution.

## Handoff Notes

Current FE branch is `ngoc/feature/trending-lens-style`. Reference backend branch is `hao/refactor/BE`. Backend contract is `docs/researches/paper-vn-trending-analysis-api-contract.md` and `/api/v1/articles/analysis` has read-only Supabase smoke verification. Existing page is large; extract Analysis into focused components/hooks instead of adding the dashboard inline. Preserve unrelated dirty/staged changes. Current package has no general test script and no chart library; prefer dependency-free SVG/CSS plus a small Node test script for pure URL/mapper utilities.
