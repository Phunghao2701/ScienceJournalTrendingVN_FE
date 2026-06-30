import React from 'react';

export function MathJax({ children }) {
  return React.createElement('span', { 'data-mathjax': 'test' }, children);
}
