import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import {
  hasScientificMath,
  normalizeMathMlPrefixes,
  sanitizeScientificMathHtml,
  toScientificPlainText,
} from '../src/shared/utils/scientificMath.js';

class TestNode {
  constructor({ nodeType, localName = '', textContent = '', attributes = [] }) {
    this.nodeType = nodeType;
    this.localName = localName;
    this.attributes = attributes;
    this.childNodes = [];
    this._textContent = textContent;
  }

  appendChild(child) {
    this.childNodes.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes.push({ localName: name, value });
  }

  getAttribute(name) {
    return this.attributes.find((attr) => attr.localName === name)?.value ?? null;
  }

  get textContent() {
    if (this.nodeType === 3 || this.nodeType === 4) return this._textContent;
    return this.childNodes.map((child) => child.textContent).join('');
  }
}

const createTextNode = (textContent) => new TestNode({ nodeType: 3, textContent });
const createElement = (localName, attributes = []) => new TestNode({ nodeType: 1, localName, attributes });

const parseAttributes = (rawAttributes = '') => {
  const attrs = [];
  rawAttributes.replace(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g, (_, rawName, __, value) => {
    attrs.push({ localName: rawName.split(':').pop().toLowerCase(), value });
    return '';
  });
  return attrs;
};

const parseXmlFragment = (source) => {
  const root = createElement('root');
  const stack = [root];
  const tokenPattern = /<([^>]+)>|([^<]+)/g;
  let match;
  let parserError = false;

  while ((match = tokenPattern.exec(source))) {
    const tag = match[1];
    const text = match[2];
    if (text) {
      stack.at(-1).appendChild(createTextNode(text));
      continue;
    }

    const trimmedTag = tag.trim();
    if (!trimmedTag || trimmedTag.startsWith('?') || trimmedTag.startsWith('!')) continue;

    if (trimmedTag.startsWith('/')) {
      const closingName = trimmedTag.slice(1).split(/\s+/)[0].split(':').pop().toLowerCase();
      if (stack.length === 1 || stack.at(-1).localName !== closingName) {
        parserError = true;
        break;
      }
      stack.pop();
      continue;
    }

    const selfClosing = trimmedTag.endsWith('/');
    const withoutSlash = selfClosing ? trimmedTag.slice(0, -1).trim() : trimmedTag;
    const [rawName, ...attributeParts] = withoutSlash.split(/\s+/);
    const node = createElement(rawName.split(':').pop().toLowerCase(), parseAttributes(attributeParts.join(' ')));
    stack.at(-1).appendChild(node);
    if (!selfClosing) stack.push(node);
  }

  return { root, parserError: parserError || stack.length !== 1 };
};

class TestDOMParser {
  parseFromString(source) {
    const inner = String(source).replace(/^<root>/, '').replace(/<\/root>$/, '');
    const { root, parserError } = parseXmlFragment(inner);
    return {
      documentElement: root,
      querySelector: (selector) => (selector === 'parsererror' && parserError ? createElement('parsererror') : null),
    };
  }
}

class TestXMLSerializer {
  serializeToString(node) {
    if (node.nodeType === 3 || node.nodeType === 4) return node.textContent;
    const attrs = node.attributes.map((attr) => ` ${attr.localName}="${attr.value}"`).join('');
    const children = node.childNodes.map((child) => this.serializeToString(child)).join('');
    return `<${node.localName}${attrs}>${children}</${node.localName}>`;
  }
}

globalThis.DOMParser = TestDOMParser;
globalThis.XMLSerializer = TestXMLSerializer;
globalThis.document = {
  implementation: {
    createDocument: (_namespace, rootName) => ({
      documentElement: createElement(rootName),
      createElementNS: (_ns, tagName) => createElement(tagName),
      createTextNode,
    }),
  },
};

const plainTitle = 'A plain scientific title';
assert.equal(hasScientificMath(plainTitle), false);
assert.equal(sanitizeScientificMathHtml(plainTitle), plainTitle);
assert.equal(toScientificPlainText(plainTitle), plainTitle);

const prefixed = 'Signal <mml:math><mml:mi>x</mml:mi><mml:mo>+</mml:mo><mml:mn>1</mml:mn></mml:math>';
assert.equal(hasScientificMath(prefixed), true);
assert.equal(normalizeMathMlPrefixes(prefixed).includes('mml:'), false);
assert.match(sanitizeScientificMathHtml(prefixed), /<math/);
assert.equal(toScientificPlainText(prefixed), 'Signal x + 1');

const fraction = '<math><mfrac><mi>a</mi><msub><mi>b</mi><mn>2</mn></msub></mfrac></math>';
assert.match(sanitizeScientificMathHtml(fraction), /<mfrac>/);
assert.equal(toScientificPlainText(fraction), 'a b 2');

const unsafe = '<math onclick="alert(1)"><mi>x</mi><script>alert(1)</script><mtext onmouseover="bad()">ok</mtext></math>';
const sanitizedUnsafe = sanitizeScientificMathHtml(unsafe);
assert.equal(sanitizedUnsafe.includes('onclick'), false);
assert.equal(sanitizedUnsafe.includes('onmouseover'), false);
assert.equal(sanitizedUnsafe.includes('<script'), false);
assert.equal(sanitizedUnsafe.includes('alert(1)'), false);
assert.match(sanitizedUnsafe, /<mtext>ok<\/mtext>/);

const unknownTag = '<math><mi>E</mi><annotation><unknown-tag>mc2</unknown-tag></annotation></math>';
const sanitizedUnknown = sanitizeScientificMathHtml(unknownTag);
assert.equal(sanitizedUnknown.includes('unknown-tag'), false);
assert.equal(sanitizedUnknown.includes('mc2'), true);

const malformed = 'Bad <math><mfrac><mi>x</math>';
assert.equal(sanitizeScientificMathHtml(malformed), 'Bad x');
assert.equal(toScientificPlainText(malformed), 'Bad x');

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true },
  resolve: {
    alias: {
      'better-react-mathjax': fileURLToPath(new URL('./mathJaxSsrStub.mjs', import.meta.url)),
    },
  },
});

try {
  const { default: ScientificMathText } = await server.ssrLoadModule('/src/shared/components/ScientificMathText.jsx');
  const firstRender = renderToStaticMarkup(
    React.createElement(ScientificMathText, { as: 'div' }, 'First <math><msup><mi>x</mi><mn>2</mn></msup></math>')
  );
  const secondRender = renderToStaticMarkup(
    React.createElement(ScientificMathText, { as: 'div' }, 'Second <math><msub><mi>y</mi><mn>1</mn></msub></math>')
  );

  assert.match(firstRender, /First/);
  assert.match(firstRender, /<msup>/);
  assert.doesNotMatch(firstRender, /Second/);
  assert.match(secondRender, /Second/);
  assert.match(secondRender, /<msub>/);
  assert.doesNotMatch(secondRender, /First/);
} finally {
  await server.close();
}

console.log('scientificMath DOM and component tests passed');
