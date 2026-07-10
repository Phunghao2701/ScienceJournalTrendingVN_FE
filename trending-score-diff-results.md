# Trending Score Formula — Diff & Verification Report

Generated: 2026-07-10 (Asia/Bangkok)

Scope:
- BE repo: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_BE` — branch `hao/fix/trendy`
- FE repo: `E:\Science_Journal_Trending_VN\ScienceJournalTrendingVN_FE` — branch `hao/feat/trending-score-formula`
- Spec: `trending-score-formula-spec.md` (Additive/Laplace smoothing + z-score normalization for `growth_rate` → `trending_score`)

---

## 1. Backend diff (`hao/fix/trendy`)

Changed files:

```text
 src/routes/keyword.route.js                    |  5 +-
 src/services/articleAnalysis.service.js        | 153 ++++++++++++++++++++-----
 src/services/keyword.service.js                |  8 +-
 src/tests/unit/service/articleAnalysis.test.js | 61 +++++++++-
 4 files changed, 195 insertions(+), 32 deletions(-)
```

*(`.ai/harness/handoff/current.md` also shows as modified in git status — that's the repo-harness session file auto-updated by tooling, not a hand-edited part of this feature.)*

### `src/services/articleAnalysis.service.js`

- Added `RATE_WEIGHT` / `ABS_WEIGHT` (default `0.5`/`0.5`), configurable via `TRENDING_RATE_WEIGHT` / `TRENDING_ABS_WEIGHT` env vars — no code change needed to retune later.
- `entityQuery`: growth ranking now `ORDER BY "trending_score" DESC NULLS LAST, "absolute_growth" DESC, "display_name" ASC` (was `absolute_growth` only). `top` ranking unchanged.
- Added CTE pipeline: `counts` → `filtered_counts` → `smoothing_stats` (median `previous_count` = Laplace constant `C`) → `smoothed` (keeps legacy `growth_rate`, adds `smoothed_growth_rate`) → `agg_stats` (mean/stddev of smoothed rate and absolute growth) → final `SELECT` computing `trending_score`.
- Legacy `growth_rate` field is unchanged/kept for backward compatibility.
- Same 4-step pipeline applied to the citation-based `trending_articles` query (`citation_activity` → `citation_growth` → `citation_smoothing_stats` → `citation_smoothed` → `citation_agg_stats`), now sorted by `trending_score DESC NULLS LAST`.
- All divisions guarded with `NULLIF(..., 0)` to avoid divide-by-zero when `stddev = 0` or `previous_count + C = 0`.

Key excerpt (entity growth ranking):

```diff
   const orderSql = ranking === 'growth'
-    ? 'ORDER BY "absolute_growth" DESC, "current_count" DESC, "display_name" ASC'
+    ? 'ORDER BY "trending_score" DESC NULLS LAST, "absolute_growth" DESC, "display_name" ASC'
     : 'ORDER BY "current_count" DESC, "absolute_growth" DESC, "display_name" ASC';
```

```diff
+    filtered_counts AS (
+      SELECT "entity_id", "display_name", "current_count", "previous_count",
+        ("current_count" - "previous_count")::integer AS "absolute_growth"
+      FROM counts
+      WHERE "current_count" > 0 OR "previous_count" > 0
+    ),
+    smoothing_stats AS (
+      SELECT (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "previous_count"))::numeric AS "median_previous"
+      FROM filtered_counts
+    ),
+    smoothed AS (
+      SELECT fc.*,
+        CASE WHEN fc."previous_count" = 0 THEN NULL
+          ELSE ROUND((fc."current_count" - fc."previous_count")::numeric / fc."previous_count", 4)::float
+        END AS "growth_rate",
+        ROUND(
+          (fc."current_count" - fc."previous_count")::numeric
+            / NULLIF(fc."previous_count" + (SELECT "median_previous" FROM smoothing_stats), 0),
+          4
+        )::float AS "smoothed_growth_rate"
+      FROM filtered_counts fc
+    ),
+    agg_stats AS (
+      SELECT AVG("smoothed_growth_rate") AS "mean_rate", STDDEV("smoothed_growth_rate") AS "stddev_rate",
+        AVG("absolute_growth") AS "mean_abs", STDDEV("absolute_growth") AS "stddev_abs"
+      FROM smoothed
+    )
     SELECT
-      "entity_id", "display_name", "current_count", "previous_count",
-      ("current_count" - "previous_count")::integer AS "absolute_growth",
-      CASE WHEN "previous_count" = 0 THEN NULL
-        ELSE ROUND((("current_count" - "previous_count")::numeric / "previous_count"), 4)::float
-      END AS "growth_rate"
-    FROM counts
-    WHERE "current_count" > 0 OR "previous_count" > 0
+      s."entity_id", s."display_name", s."current_count", s."previous_count",
+      s."absolute_growth", s."growth_rate", s."smoothed_growth_rate",
+      ROUND((
+        (${RATE_WEIGHT} * ((s."smoothed_growth_rate" - a."mean_rate") / NULLIF(a."stddev_rate", 0)))
+          + (${ABS_WEIGHT} * ((s."absolute_growth" - a."mean_abs") / NULLIF(a."stddev_abs", 0)))
+      )::numeric, 4)::float AS "trending_score"
+    FROM smoothed s
+    CROSS JOIN agg_stats a
     ${orderSql}
     LIMIT $${prepared.limitIndex};
```

The same pipeline (renamed `citation_*`) was applied to `trending_articles`, using `current_citations`/`previous_citations` instead of `current_count`/`previous_count`.

### `src/services/keyword.service.js` + `src/routes/keyword.route.js`

- Documentation-only change (no contract break): clarified that `GET /projects/:id/keywords/trending?sort_by=score` sorts by a static `avg_score` (relevance), not a time-windowed `trending_score`. Did **not** rename the `sort_by` param, since that would be a breaking API change requiring separate FE coordination (spec section 6 explicitly frames this as optional).

### `src/tests/unit/service/articleAnalysis.test.js`

- Updated the growth-query `ORDER BY` assertion to the new `trending_score`-based clause.
- Added a SQL-shape test asserting the smoothing/z-score CTEs exist (`PERCENTILE_CONT`, `smoothed_growth_rate`, `trending_score`, `NULLIF(a."stddev_rate", 0)`).
- Added a contract test: an entity with `previous_count=1` / `growth_rate=100%` (small-sample) must rank **below** an entity with real absolute growth (`previous_count=50`, `growth_rate=40%`) once trending_score is applied.

**BE test run:**

```text
$ node --test src/tests/unit/service/articleAnalysis.test.js
tests 15
suites 3
pass 15
fail 0
duration_ms ~1090
```

Pre-existing failures in `keyword.test.js` (mock redefinition) and `subjectCategory.test.js` (error-code mismatch) were confirmed present on `hao/fix/trendy` **before** this change (checked via `git stash`) — unrelated to this feature.

---

## 2. Frontend diff (`hao/feat/trending-score-formula`, based off `main`)

Changed files:

```text
 scripts/paperVnAnalysis.test.mjs                                          | 34 +++++++++
 src/features/trendingVN/components/analysis/AnalysisEntityPanel.jsx       |  4 +-
 src/features/trendingVN/components/analysis/AnalysisTrendingArticles.jsx  |  4 +-
 src/features/trendingVN/utils/paperVnAnalysis.js                          | 18 ++++-
 4 files changed, 56 insertions(+), 4 deletions(-)
```

- `paperVnAnalysis.js`: `normalizeEntityRows` / `normalizeTrendingArticles` now pass through `smoothed_growth_rate` and `trending_score` (nullable numeric, same null-safety pattern as `growth_rate`). Added `formatTrendingScore` (signed decimal, e.g. `+1.82`, not a percentage — it's a z-score blend, not a rate).
- `AnalysisEntityPanel.jsx`: added a "Trending score" column, shown only in **growth** mode, so the new sort key driving the ranking is visible to users (not just silently applied server-side).
- `AnalysisTrendingArticles.jsx`: added the same "Trending score" column (this table's whole purpose is trending, so it's shown unconditionally).
- `scripts/paperVnAnalysis.test.mjs`: added normalization + formatting tests.

```diff
+const normalizeNullableNumber = (value) => (value === null || value === undefined ? null : toNumber(value));
...
-    growth_rate: item.growth_rate === null || item.growth_rate === undefined ? null : toNumber(item.growth_rate),
+    growth_rate: normalizeNullableNumber(item.growth_rate),
+    smoothed_growth_rate: normalizeNullableNumber(item.smoothed_growth_rate),
+    trending_score: normalizeNullableNumber(item.trending_score),

+export const formatTrendingScore = (value) => {
+  if (value === null || value === undefined) return '—';
+  if (!Number.isFinite(Number(value))) return 'N/A';
+  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, signDisplay: 'exceptZero' }).format(Number(value));
+};
```

**FE verification:**

```text
$ npm run test:paper-vn-analysis   → 31/31 pass
$ npx eslint <touched files>       → clean
$ npm run build                   → success (610 modules, built in 633ms)
```

Full-repo `npm run lint` fails with 97 **pre-existing** errors elsewhere in the codebase (unused `React` imports, `Math.random` in render, etc.) — unrelated to this feature; touched files are clean.

---

## 3. Real-data verification (production DB, read-only)

Ran `getArticleAnalysis()` directly against the live database via a temporary script (deleted after use — no writes, `SELECT`-only).

### 3.1 Requested params: `scope=vn_universities, fromYear=2023, toYear=2024, limit=15`

| # (rank mới) | display_name | current | previous | growth_rate (cũ) | smoothed_rate | trending_score | rank cũ |
|---|---|---|---|---|---|---|---|
| 1 | Hanoi University of Industry | 3 | 0 | New | 3.00 | 2.55 | 4 |
| 2 | Vietnam National University, Hanoi | 6 | 2 | 200.0% | 1.33 | 1.88 | 1 |
| 3 | Nam Dinh University of Nursing | 2 | 0 | New | 2.00 | 1.60 | 5 |
| 4 | University of Transport and Communications | 2 | 0 | New | 2.00 | 1.60 | 6 |
| 5 | Can Tho University | 3 | 1 | 200.0% | 1.00 | 0.99 | 2 |
| 6 | Le Quy Don Technical University | 16 | 13 | 23.1% | 0.21 | 0.86 | 3 |
| 7–15 | (9 entities, previous_count=0) | 1 | 0 | New | 1.00 | 0.65 | 7–15 |

**Verdict:** this window is too thin (all counts single/low digits) to show a dramatic effect — every entity is "small," so z-scores don't separate much. Expanded below per the fallback instruction.

### 3.2 Expanded: `scope=all, fromYear=2020, toYear=2024, limit=50` (clearest illustration)

| # (rank mới) | display_name | current | previous | growth_rate (cũ) | smoothed_rate | trending_score | rank cũ |
|---|---|---|---|---|---|---|---|
| **1** | **Hanoi University of Science and Technology** | **81** | **42** | **92.9%** | **0.91** | **8.34** | **12** |
| 2 | African Institute for Mathematical Sciences | 10 | 0 | New | 10.00 | 6.63 | 15 |
| **3** | **Satya Wacana Christian University** | **16** | **1** | **1500.0%** | **7.50** | **6.49** | **1** |
| 4 | Université Tunis Carthage | 9 | 0 | New | 9.00 | 5.95 | 16 |
| 5 | VinUniversity | 9 | 0 | New | 9.00 | 5.95 | 17 |
| **6** | **Le Quy Don Technical University** | **56** | **31** | **80.7%** | **0.78** | **5.39** | **13** |
| 7 | University of KwaZulu-Natal | 22 | 5 | 340.0% | 2.83 | 4.71 | 9 |
| ... | ... | | | | | | |
| **15** | Université du Québec à Trois-Rivières | 10 | 1 | 900.0% | 4.50 | 3.84 | **2** |
| ... | | | | | | | |
| **17** | SRM Institute of Science and Technology | 9 | 1 | 800.0% | 4.00 | 3.40 | **3** |
| **18** | University of Carthage | 9 | 1 | 800.0% | 4.00 | 3.40 | **4** |
| **35** | Vietnam National University Ho Chi Minh City | 59 | 46 | 28.3% | 0.28 | 2.68 | 14 |

*(full 50-row output captured during the session; table trimmed here to the rows needed for the two questions below.)*

### Question 1 — entities that dropped from the top of "growth" despite high growth_rate%

Yes, clearly:

- **Satya Wacana Christian University** (`previous_count=1`, `current_count=16` → `growth_rate=1500%`) was old rank **#1**. New `trending_score=6.49` → rank **#3**.
- **Université du Québec à Trois-Rivières** (`previous=1`, rate `900%`) was old rank **#2** → new rank **#15**.
- **SRM Institute of Science and Technology** and **University of Carthage** (`previous=1`, rate `800%`) were old rank **#3, #4** → new rank **#17, #18**.

All of these were overtaken by **Hanoi University of Science and Technology** (`current=81, previous=42, rate only 92.9%`) and **Le Quy Don Technical University** (`current=56, previous=31, rate only 80.7%`) — both have large `previous_count` so their % looks modest, but their absolute growth (+39, +25 articles) is the largest in the dataset.

### Question 2 — real absolute-growth entities that were previously buried, now surfaced

Yes — the flip side of the same two examples:

- **Hanoi University of Science and Technology**: old rank **#12** (buried under 11 entities with small-sample or zero-previous "New" inflated rates) → new rank **#1**.
- **Le Quy Don Technical University**: old rank **#13** → new rank **#6**.

### Conclusion

The new formula behaves exactly as the spec intends: it neutralizes the "inflated % from tiny previous_count" artifact (`previous_count` 0–1 producing 500–1500% `growth_rate`) and surfaces entities with genuinely large absolute growth (but moderate % due to a large base) to the top of the ranking. Confirmed safe to merge `hao/fix/trendy` on this basis.
