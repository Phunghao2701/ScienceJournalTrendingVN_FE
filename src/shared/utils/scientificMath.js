const MATHML_TAGS = new Set([
  'math',
  'mrow',
  'mi',
  'mn',
  'mo',
  'mtext',
  'ms',
  'mspace',
  'msup',
  'msub',
  'msubsup',
  'mfrac',
  'msqrt',
  'mroot',
  'mfenced',
  'mtable',
  'mtr',
  'mtd',
  'munderover',
  'munder',
  'mover',
  'mmultiscripts',
  'mprescripts',
  'none',
  'semantics',
  'annotation',
  'annotation-xml',
]);

const ALLOWED_ATTRS = new Set([
  'accent',
  'accentunder',
  'align',
  'alttext',
  'class',
  'close',
  'columnalign',
  'denomalign',
  'dir',
  'display',
  'displaystyle',
  'encoding',
  'fence',
  'form',
  'id',
  'largeop',
  'lspace',
  'mathbackground',
  'mathcolor',
  'mathsize',
  'mathvariant',
  'movablelimits',
  'notation',
  'numalign',
  'open',
  'rowalign',
  'rspace',
  'separator',
  'separators',
  'stretchy',
  'subscriptshift',
  'supscriptshift',
  'symmetric',
  'xmlns',
]);

const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

export const normalizeMathMlPrefixes = (value = '') => String(value || '')
  .replace(/<\/?mml:/gi, (match) => match.replace('mml:', ''))
  .replace(/\sxmlns:mml=(["'])http:\/\/www\.w3\.org\/1998\/Math\/MathML\1/gi, '');

export const hasScientificMath = (value = '') => /<\/?(?:mml:)?math[\s>]/i.test(String(value || ''));

export const stripScientificMarkup = (value = '') => normalizeMathMlPrefixes(value)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeBareAmpersands = (value = '') => String(value).replace(/&(?!#?\w+;)/g, '&amp;');

const sanitizeElement = (node, documentRef) => {
  const tagName = node.localName?.toLowerCase();
  if (tagName === 'script' || tagName === 'style') {
    return documentRef.createTextNode('');
  }

  if (!MATHML_TAGS.has(tagName)) {
    return documentRef.createTextNode(node.textContent || '');
  }

  const clean = documentRef.createElementNS(MATHML_NAMESPACE, tagName);
  Array.from(node.attributes || []).forEach((attr) => {
    const attrName = attr.localName?.toLowerCase();
    if (!attrName || attrName.startsWith('on') || !ALLOWED_ATTRS.has(attrName)) return;
    clean.setAttribute(attrName, attr.value);
  });

  if (tagName === 'math' && !clean.getAttribute('xmlns')) {
    clean.setAttribute('xmlns', MATHML_NAMESPACE);
  }

  Array.from(node.childNodes || []).forEach((child) => {
    if (child.nodeType === 1) {
      clean.appendChild(sanitizeElement(child, documentRef));
    } else if (child.nodeType === 3 || child.nodeType === 4) {
      clean.appendChild(documentRef.createTextNode(child.textContent || ''));
    }
  });

  return clean;
};

export const sanitizeScientificMathHtml = (value = '') => {
  const rawValue = String(value || '');
  if (!rawValue.trim()) return '';
  if (!hasScientificMath(rawValue)) return escapeHtml(rawValue);
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return escapeHtml(stripScientificMarkup(rawValue));
  }

  const normalized = escapeBareAmpersands(normalizeMathMlPrefixes(rawValue));
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(`<root>${normalized}</root>`, 'application/xml');
  if (xmlDoc.querySelector('parsererror')) {
    return escapeHtml(stripScientificMarkup(rawValue));
  }

  const outputDoc = document.implementation.createDocument('', 'root', null);
  const root = outputDoc.documentElement;
  Array.from(xmlDoc.documentElement.childNodes || []).forEach((child) => {
    if (child.nodeType === 1) {
      root.appendChild(sanitizeElement(child, outputDoc));
    } else if (child.nodeType === 3 || child.nodeType === 4) {
      root.appendChild(outputDoc.createTextNode(child.textContent || ''));
    }
  });

  return Array.from(root.childNodes)
    .map((child) => new XMLSerializer().serializeToString(child))
    .join('');
};

export const toScientificPlainText = stripScientificMarkup;
