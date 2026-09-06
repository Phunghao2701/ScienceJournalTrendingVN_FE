import { MathJax } from 'better-react-mathjax';
import {
  sanitizeScientificMathHtml,
  hasMathML,
  hasLatexMath,
  normalizeScientificLatex,
} from '../utils/scientificMath';

/**
 * Renders scientific text that may contain MathML or LaTeX math expressions.
 *
 * - MathML  (<math>…</math>): sanitized then passed via dangerouslySetInnerHTML + MathJax
 * - LaTeX   (\\cmd, $…$, $$…$$, \(…\)): normalized backslashes, passed as text children so MathJax typesets it
 * - Plain text: HTML-escaped, no MathJax overhead
 */
export default function ScientificMathText({
  children,
  as: Component = 'span',
  className,
  title,
  ...props
}) {
  const rawValue = String(children ?? '');

  // ── Path 1: MathML ────────────────────────────────────────────────────────
  if (hasMathML(rawValue)) {
    const safeHtml = sanitizeScientificMathHtml(rawValue);
    return (
      <MathJax dynamic inline hideUntilTypeset="first">
        <Component
          className={className}
          title={title}
          {...props}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </MathJax>
    );
  }

  // ── Path 2: LaTeX ─────────────────────────────────────────────────────────
  // Pass normalized string (resolving double-escaped backslashes) as text children.
  // MathJax will scan for $, $$, \(, \[ delimiters configured in ScientificMathProvider.
  if (hasLatexMath(rawValue)) {
    const prepared = normalizeScientificLatex(rawValue);
    return (
      <MathJax dynamic inline hideUntilTypeset="first">
        <Component className={className} title={title} {...props}>
          {prepared}
        </Component>
      </MathJax>
    );
  }

  // ── Path 3: Plain text ────────────────────────────────────────────────────
  const safeHtml = sanitizeScientificMathHtml(rawValue);
  return (
    <Component
      className={className}
      title={title}
      {...props}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
