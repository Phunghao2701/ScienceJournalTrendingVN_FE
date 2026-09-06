import React from 'react';
import { MathJaxContext } from 'better-react-mathjax';

const mathJaxConfig = {
  loader: { load: ['input/mml', 'output/chtml'] },
  options: {
    enableMenu: false,
    renderActions: {
      addMenu: [],
    },
  },
};

/**
 * Provides MathJax context only to trees that render scientific articles/math formulas.
 * Avoids initializing the heavy MathJax engine on login, register, profile, and project views.
 */
export default function ScientificMathProvider({ children }) {
  return (
    <MathJaxContext version={3} config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  );
}
