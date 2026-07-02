import { MathJax } from 'better-react-mathjax';
import { sanitizeScientificMathHtml, hasScientificMath } from '../utils/scientificMath';

export default function ScientificMathText({
  children,
  as: Component = 'span',
  className,
  title,
  ...props
}) {
  const rawValue = String(children ?? '');
  const safeHtml = sanitizeScientificMathHtml(rawValue);
  const content = (
    <Component
      className={className}
      title={title}
      {...props}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );

  if (!hasScientificMath(rawValue)) {
    return content;
  }

  return (
    <MathJax dynamic inline hideUntilTypeset="first">
      {content}
    </MathJax>
  );
}
