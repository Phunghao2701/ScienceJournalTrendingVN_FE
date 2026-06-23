# Design System v1.0

## Research & Patent Analytics Platform

---

# 1. Brand Foundation

## Brand Personality

* Professional
* Academic
* Data-driven
* Trustworthy
* Analytical

## Design Principles

1. Clarity over decoration
2. Data-first interface
3. Consistent hierarchy
4. Accessible by default
5. Efficient information scanning

---

# 2. Color System

## Primary Palette

| Token       | Color   |
| ----------- | ------- |
| Primary-50  | #EAF4FF |
| Primary-100 | #D6E9FF |
| Primary-200 | #ADD3FF |
| Primary-300 | #84BDFF |
| Primary-400 | #5BA7FF |
| Primary-500 | #1976D2 |
| Primary-600 | #1565C0 |
| Primary-700 | #0F4FA3 |
| Primary-800 | #0A3A78 |
| Primary-900 | #06264D |

---

## Neutral Palette

| Token    | Color   |
| -------- | ------- |
| Gray-50  | #F8FAFC |
| Gray-100 | #F1F5F9 |
| Gray-200 | #E2E8F0 |
| Gray-300 | #CBD5E1 |
| Gray-400 | #94A3B8 |
| Gray-500 | #64748B |
| Gray-600 | #475569 |
| Gray-700 | #334155 |
| Gray-800 | #1E293B |
| Gray-900 | #0F172A |

---

## Semantic Colors

| Purpose | Color   |
| ------- | ------- |
| Success | #16A34A |
| Warning | #F59E0B |
| Danger  | #DC2626 |
| Info    | #0284C7 |

---

# 3. Typography

## Font Family

```css
font-family:
  Inter,
  Roboto,
  "Open Sans",
  sans-serif;
```

---

## Type Scale

| Style      | Size | Weight | Line Height |
| ---------- | ---- | ------ | ----------- |
| Display    | 40px | 700    | 48px        |
| H1         | 32px | 700    | 40px        |
| H2         | 24px | 600    | 32px        |
| H3         | 20px | 600    | 28px        |
| H4         | 18px | 600    | 26px        |
| Body Large | 16px | 400    | 24px        |
| Body       | 14px | 400    | 22px        |
| Caption    | 12px | 400    | 18px        |

---

# 4. Spacing System

Base Unit = 8px

| Token | Value |
| ----- | ----- |
| XS    | 4px   |
| SM    | 8px   |
| MD    | 16px  |
| LG    | 24px  |
| XL    | 32px  |
| 2XL   | 48px  |
| 3XL   | 64px  |

---

# 5. Border Radius

| Token       | Value |
| ----------- | ----- |
| Radius-SM   | 4px   |
| Radius-MD   | 8px   |
| Radius-LG   | 12px  |
| Radius-XL   | 16px  |
| Radius-Pill | 999px |

---

# 6. Elevation & Shadow

## Small

```css
box-shadow: 0 1px 2px rgba(0,0,0,.06);
```

## Medium

```css
box-shadow: 0 4px 8px rgba(0,0,0,.08);
```

## Large

```css
box-shadow: 0 8px 24px rgba(0,0,0,.10);
```

### Usage

| Component   | Shadow |
| ----------- | ------ |
| Card        | Small  |
| Dropdown    | Small  |
| Modal       | Medium |
| Hover State | Medium |

---

# 7. Layout Grid

## Desktop

```yaml
Container Width: 1440px
Columns: 12
Gutter: 24px
Padding: 24px
```

## Tablet

```yaml
Columns: 8
Gutter: 16px
Padding: 16px
```

## Mobile

```yaml
Columns: 4
Gutter: 16px
Padding: 16px
```

---

# 8. Component Specifications

## Primary Button

```yaml
Height: 40px
Background: #1976D2
Text Color: #FFFFFF
Border Radius: 8px

Hover:
  Background: #1565C0

Disabled:
  Background: #CBD5E1
```

---

## Secondary Button

```yaml
Height: 40px
Background: #FFFFFF
Border: 1px solid #CBD5E1
Text: #334155
Radius: 8px
```

---

## Search Field

```yaml
Height: 44px
Border: #CBD5E1
Radius: 8px
Padding: 12px 16px

Focus:
  Border: #1976D2
  Ring: rgba(25,118,210,0.15)
```

---

## Card

```yaml
Background: #FFFFFF
Border: 1px solid #E2E8F0
Radius: 12px
Padding: 24px
Shadow: Small
```

---

## Sidebar Filter

```yaml
Width: 280px
Background: #FFFFFF
Border: #E2E8F0
Section Gap: 24px
```

---

## Data Table

```yaml
Header Background: #F8FAFC
Header Weight: 600
Row Height: 52px
Border Color: #E2E8F0

Hover:
  Background: #F1F5F9
```

---

# 9. Data Visualization

## Chart Colors

| Purpose | Color   |
| ------- | ------- |
| Primary | #1976D2 |
| Green   | #16A34A |
| Orange  | #F59E0B |
| Red     | #DC2626 |
| Purple  | #7C3AED |
| Teal    | #0891B2 |

## Rules

* Maximum 6 colors per chart
* White chart background
* Gray grid lines (#E2E8F0)
* Labels use Gray-600
* Avoid gradients
* Prioritize readability

---

# 10. Accessibility

## WCAG Compliance

Target: WCAG 2.1 AA

### Requirements

* Text contrast ≥ 4.5:1
* Large text contrast ≥ 3:1
* Visible focus state
* Full keyboard navigation
* Semantic HTML support
* Screen reader compatibility

---

# 11. Design Tokens

```json
{
  "color": {
    "primary": "#1976D2",
    "primaryHover": "#1565C0",
    "background": "#FFFFFF",
    "surface": "#F8FAFC",
    "textPrimary": "#1E293B",
    "textSecondary": "#64748B",
    "border": "#E2E8F0",
    "success": "#16A34A",
    "warning": "#F59E0B",
    "danger": "#DC2626"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  }
}
```

---

# 12. Visual Style Summary

**Style Type:** Academic SaaS Platform

**Comparable Products:**

* Lens.org
* Google Patents
* Semantic Scholar
* Scopus
* Web of Science

**Visual Characteristics:**

* Minimalistic
* High information density
* Clean white background
* Blue trust-oriented accent color
* Data-centric layouts
* Low visual noise
* Enterprise-grade usability

**Keywords:**

`Research` · `Analytics` · `Patent Intelligence` · `Knowledge Discovery` · `Academic Platform` · `Enterprise SaaS`
