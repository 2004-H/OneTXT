import {
  BorderSide,
  DocumentTheme,
  HeadingLevel,
  HeadingStyleConfig,
} from '../types/onetxt';

function formatBorderRule(
  side: BorderSide,
  width: string,
  style: string,
  color: string
): string {
  if (side === 'none' || width === '0' || width === '0px') {
    return 'border: none;';
  }
  const value = `${width} ${style} ${color}`;
  switch (side) {
    case 'bottom':
      return `border: none; border-bottom: ${value};`;
    case 'left':
      return `border: none; border-left: ${value};`;
    case 'top':
      return `border: none; border-top: ${value};`;
    case 'all':
      return `border: ${value};`;
  }
}

function buildHeadingRule(level: HeadingLevel, h: HeadingStyleConfig): string {
  const borderCss = formatBorderRule(h.borderSide, h.borderWidth, h.borderStyle, h.borderColor);
  const custom = h.customCss.trim() ? `\n  ${h.customCss.trim()}` : '';
  return `.onetxt-prose ${level} {
  font-family: ${h.fontFamily};
  font-size: ${h.fontSize};
  font-weight: ${h.fontWeight};
  line-height: ${h.lineHeight};
  letter-spacing: ${h.letterSpacing};
  text-transform: ${h.textTransform};
  font-style: ${h.fontStyle};
  text-align: ${h.textAlign};
  color: ${h.color};
  background-color: ${h.backgroundColor};
  padding: ${h.paddingTop} ${h.paddingRight} ${h.paddingBottom} ${h.paddingLeft};
  margin-top: ${h.marginTop};
  margin-bottom: ${h.marginBottom};
  ${borderCss}
  border-radius: ${h.borderRadius};
  text-wrap: balance;${custom}
}`;
}

/**
 * Safely scopes user-authored raw CSS rules inside `.onetxt-prose`
 * so custom stylesheets never leak into the app chrome.
 */
export function scopeCustomCss(rawCss: string): string {
  const trimmed = rawCss.trim();
  if (!trimmed) return '';

  // Strip comments for clean rule splitting while preserving inner declarations
  const cleaned = trimmed.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    current += ch;
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth <= 0) {
        depth = 0;
        const block = current.trim();
        if (block) blocks.push(block);
        current = '';
      }
    }
  }

  return blocks
    .map((block) => {
      const openIdx = block.indexOf('{');
      if (openIdx === -1) return '';
      const selectorPart = block.slice(0, openIdx).trim();
      const bodyPart = block.slice(openIdx);
      if (!selectorPart) return '';

      if (selectorPart.startsWith('@')) {
        // Keep @media / @supports / @keyframes intact, scoping nested selectors inside @media/@supports
        if (selectorPart.startsWith('@media') || selectorPart.startsWith('@supports')) {
          const inner = bodyPart.slice(1, -1);
          return `${selectorPart} {\n${scopeCustomCss(inner)}\n}`;
        }
        return block;
      }

      const scopedSelectors = selectorPart
        .split(',')
        .map((sel) => sel.trim())
        .filter(Boolean)
        .map((sel) => {
          if (sel.startsWith('.onetxt-prose')) return sel;
          if (sel === ':root' || sel === 'body' || sel === 'html') return '.onetxt-prose';
          return `.onetxt-prose ${sel}`;
        })
        .join(', ');

      return `${scopedSelectors} ${bodyPart}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

export function generateThemeCss(theme: DocumentTheme): string {
  const { elements, headings } = theme;

  const headingLevels: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const headingRules = headingLevels
    .map((lvl) => buildHeadingRule(lvl, headings[lvl]))
    .join('\n\n');

  const linkDecoration =
    elements.link.underlineMode === 'always'
      ? 'underline'
      : 'none';
  const linkHoverDecoration =
    elements.link.underlineMode === 'none' ? 'none' : 'underline';

  const bqBorder = formatBorderRule(
    elements.blockquote.borderSide,
    elements.blockquote.borderWidth,
    'solid',
    elements.blockquote.borderColor
  );

  const imgShadow =
    elements.image.shadow === 'medium'
      ? '0 12px 32px -8px rgba(0, 0, 0, 0.22)'
      : elements.image.shadow === 'subtle'
      ? '0 4px 16px -4px rgba(0, 0, 0, 0.1)'
      : 'none';

  const scopedRaw = scopeCustomCss(theme.rawCustomCss);

  return `.onetxt-prose {
  font-family: ${theme.bodyFont};
  font-size: ${theme.baseFontSize}px;
  line-height: ${theme.baseLineHeight};
  color: ${theme.textColor};
  max-width: ${theme.maxWidth}px;
  margin-left: auto;
  margin-right: auto;
  word-wrap: break-word;
}

.onetxt-prose > *:first-child {
  margin-top: 0;
}

${headingRules}

.onetxt-prose p {
  font-size: ${elements.paragraph.fontSize};
  line-height: ${elements.paragraph.lineHeight};
  color: ${elements.paragraph.color};
  margin-top: 0;
  margin-bottom: ${elements.paragraph.marginBottom};
  text-indent: ${elements.paragraph.textIndent};
  ${elements.paragraph.customCss}
}

.onetxt-prose blockquote {
  color: ${elements.blockquote.color};
  background-color: ${elements.blockquote.backgroundColor};
  ${bqBorder}
  border-radius: ${elements.blockquote.borderRadius};
  padding: ${elements.blockquote.padding};
  margin: ${elements.blockquote.marginY} 0;
  font-style: ${elements.blockquote.fontStyle};
  ${elements.blockquote.customCss}
}

.onetxt-prose blockquote > p:last-child {
  margin-bottom: 0;
}

.onetxt-prose :not(pre) > code {
  font-family: ${theme.monoFont};
  color: ${elements.inlineCode.color};
  background-color: ${elements.inlineCode.backgroundColor};
  border-radius: ${elements.inlineCode.borderRadius};
  padding: ${elements.inlineCode.paddingY} ${elements.inlineCode.paddingX};
  font-size: ${elements.inlineCode.fontSize};
  border: 1px solid ${elements.inlineCode.borderColor};
  ${elements.inlineCode.customCss}
}

.onetxt-prose .onetxt-code-wrap {
  background-color: ${elements.codeBlock.backgroundColor};
  border: 1px solid ${elements.codeBlock.borderColor};
  border-radius: ${elements.codeBlock.borderRadius};
  ${elements.codeBlock.customCss}
}

.onetxt-prose .onetxt-code-header {
  background-color: ${elements.codeBlock.headerBg};
  border-bottom: 1px solid ${elements.codeBlock.borderColor};
  color: ${elements.codeBlock.color};
}

.onetxt-prose .onetxt-copy-btn {
  color: ${elements.codeBlock.copyBtnColor};
  background-color: ${elements.codeBlock.copyBtnBg};
}

.onetxt-prose .onetxt-copy-btn:hover {
  filter: brightness(1.12);
}

.onetxt-prose pre {
  font-family: ${theme.monoFont};
  color: ${elements.codeBlock.color};
  background-color: ${elements.codeBlock.backgroundColor};
  font-size: ${elements.codeBlock.fontSize};
  line-height: ${elements.codeBlock.lineHeight};
  padding: ${elements.codeBlock.padding};
}

.onetxt-prose a {
  color: ${elements.link.color};
  text-decoration: ${linkDecoration};
  text-underline-offset: ${elements.link.underlineOffset};
  font-weight: ${elements.link.fontWeight};
  transition: opacity 150ms ease;
  ${elements.link.customCss}
}

.onetxt-prose a:hover {
  text-decoration: ${linkHoverDecoration};
  opacity: 0.85;
}

.onetxt-prose ul,
.onetxt-prose ol {
  padding-left: ${elements.list.indent};
  margin: 0 0 1.15em 0;
  ${elements.list.customCss}
}

.onetxt-prose ul {
  list-style-type: disc;
}

.onetxt-prose ol {
  list-style-type: decimal;
}

.onetxt-prose li {
  margin-bottom: ${elements.list.itemSpacing};
}

.onetxt-prose li::marker {
  color: ${elements.list.markerColor};
}

.onetxt-prose li > ul,
.onetxt-prose li > ol {
  margin-top: ${elements.list.itemSpacing};
  margin-bottom: 0.25em;
}

.onetxt-prose .onetxt-table-wrap {
  border: 1px solid ${elements.table.borderColor};
  border-radius: ${elements.table.borderRadius};
}

.onetxt-prose table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.94em;
  font-variant-numeric: tabular-nums;
  ${elements.table.customCss}
}

.onetxt-prose th {
  background-color: ${elements.table.headerBg};
  color: ${elements.table.headerColor};
  font-weight: 600;
  text-align: left;
  padding: ${elements.table.cellPadding};
  border-bottom: 1px solid ${elements.table.borderColor};
}

.onetxt-prose td {
  padding: ${elements.table.cellPadding};
  border-bottom: 1px solid ${elements.table.borderColor};
}

.onetxt-prose tr:last-child td {
  border-bottom: none;
}

${
  elements.table.striped
    ? `.onetxt-prose tbody tr:nth-child(even) td {
  background-color: ${elements.table.rowAltBg};
}`
    : ''
}

.onetxt-prose hr {
  border: none;
  border-top: ${elements.hr.thickness} ${elements.hr.style} ${elements.hr.color};
  margin-top: ${elements.hr.marginY};
  margin-bottom: ${elements.hr.marginY};
  width: ${elements.hr.width};
  ${elements.hr.customCss}
}

.onetxt-prose img {
  display: block;
  max-width: ${elements.image.maxWidth};
  height: auto;
  border-radius: ${elements.image.borderRadius};
  box-shadow: ${imgShadow};
  margin: 1.5em auto;
  ${elements.image.customCss}
}

${scopedRaw ? `/* Custom User CSS */\n${scopedRaw}` : ''}`;
}
