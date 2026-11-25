import DOMPurify from 'dompurify';
import { marked, Renderer } from 'marked';
import { DocumentStats, TocItem } from '../types/onetxt';
import { getLanguageAccentColor, highlightCodeBlock } from './syntaxHighlight';
import { parseYamlFrontmatter, YamlProperty } from './yamlFrontmatter';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Extracts ATX headings (`#` .. `######`) with exact 1-based line numbers,
 * skipping YAML frontmatter and fenced code blocks.
 */
export function extractTocFromMarkdown(markdown: string): TocItem[] {
  const { frontmatterLineCount } = parseYamlFrontmatter(markdown);
  const lines = markdown.split(/\r?\n/);
  const items: TocItem[] = [];
  let inFence = false;
  let fenceChar = '';
  let headingCounter = 0;

  for (let i = frontmatterLineCount; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = marker;
      } else if (marker === fenceChar) {
        inFence = false;
        fenceChar = '';
      }
      continue;
    }

    if (inFence) continue;

    const headingMatch = /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = stripInlineMarkdown(headingMatch[2]);
      if (text) {
        items.push({
          id: `onetxt-h-${headingCounter}`,
          level,
          text,
          line: i + 1,
        });
        headingCounter++;
      }
    }
  }

  return items;
}

/**
 * Toggles the Nth GFM task list checkbox (`- [ ]` <-> `- [x]`) outside YAML frontmatter and fenced code blocks.
 */
export function toggleMarkdownTaskAtIndex(markdown: string, targetIndex: number): string {
  const { frontmatterLineCount } = parseYamlFrontmatter(markdown);
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  let fenceChar = '';
  let taskCounter = 0;

  for (let i = frontmatterLineCount; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = marker;
      } else if (marker === fenceChar) {
        inFence = false;
        fenceChar = '';
      }
      continue;
    }

    if (inFence) continue;

    const taskMatch = /^(\s*(?:[-*+]|\d+\.)\s+\[)([ xX])(\]\s*.*)$/.exec(line);
    if (taskMatch) {
      if (taskCounter === targetIndex) {
        const nextMark = taskMatch[2].toLowerCase() === 'x' ? ' ' : 'x';
        lines[i] = `${taskMatch[1]}${nextMark}${taskMatch[3]}`;
        return lines.join('\n');
      }
      taskCounter++;
    }
  }

  return markdown;
}

export function computeDocumentStats(markdown: string): DocumentStats {
  const { body } = parseYamlFrontmatter(markdown);
  const trimmed = body.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = body.length;
  const lines = markdown ? markdown.split(/\r?\n/).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(words / 225));
  return { words, characters, lines, readingMinutes };
}

const COPY_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECKBOX_TICK_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

export function renderMarkdownToHtml(markdown: string): {
  html: string;
  toc: TocItem[];
  properties: YamlProperty[];
} {
  const { body, properties } = parseYamlFrontmatter(markdown);
  const lineToc = extractTocFromMarkdown(markdown);
  const renderedToc: TocItem[] = [];
  let headingIdx = 0;
  let taskIdx = 0;

  const renderer = new Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const innerHtml = this.parser.parseInline(tokens);
    const plainText = stripInlineMarkdown(innerHtml);
    const id = `onetxt-h-${headingIdx}`;
    const matchingLineItem = lineToc[headingIdx];
    renderedToc.push({
      id,
      level: depth,
      text: plainText || matchingLineItem?.text || `Heading ${headingIdx + 1}`,
      line: matchingLineItem?.line ?? 1,
    });
    headingIdx++;
    return `<h${depth} id="${id}">${innerHtml}</h${depth}>\n`;
  };

  renderer.code = function ({ text, lang }) {
    const language = (lang || '').trim().split(/\s+/)[0] || 'text';
    const langColor = getLanguageAccentColor(language);
    const highlightedCode = highlightCodeBlock(text, language);
    const escapedLang = escapeHtml(language);
    return `<div class="onetxt-code-wrap" data-code-block="true">
  <div class="onetxt-code-header">
    <span class="onetxt-code-lang" style="color:${langColor}">${escapedLang}</span>
    <button type="button" class="onetxt-copy-btn" data-copy-code="true" aria-label="Copy code block to clipboard">${COPY_ICON_SVG}<span>Copy</span></button>
  </div>
  <pre><code>${highlightedCode}</code></pre>
</div>\n`;
  };

  renderer.table = function (token) {
    let headerHtml = '';
    for (const cell of token.header) {
      const alignAttr = cell.align ? ` style="text-align:${cell.align}"` : '';
      headerHtml += `<th${alignAttr}>${this.parser.parseInline(cell.tokens)}</th>`;
    }

    let bodyHtml = '';
    for (const row of token.rows) {
      let rowCells = '';
      for (const cell of row) {
        const alignAttr = cell.align ? ` style="text-align:${cell.align}"` : '';
        rowCells += `<td${alignAttr}>${this.parser.parseInline(cell.tokens)}</td>`;
      }
      bodyHtml += `<tr>${rowCells}</tr>`;
    }

    return `<div class="onetxt-table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>\n`;
  };

  renderer.checkbox = function ({ checked }) {
    const currentIndex = taskIdx++;
    return `<span class="onetxt-checkbox" data-task-index="${currentIndex}" data-checked="${checked ? 'true' : 'false'}" role="checkbox" tabindex="0" aria-checked="${checked ? 'true' : 'false'}" aria-label="${checked ? 'Completed task' : 'Incomplete task'}">${checked ? CHECKBOX_TICK_SVG : ''}</span>`;
  };

  renderer.listitem = function (item) {
    const itemBody = this.parser.parse(item.tokens);
    if (item.task) {
      return `<li class="task-list-item" data-task-checked="${item.checked ? 'true' : 'false'}">${itemBody}</li>\n`;
    }
    return `<li>${itemBody}</li>\n`;
  };

  renderer.list = function (token) {
    const tag = token.ordered ? 'ol' : 'ul';
    const startAttr = token.ordered && token.start !== 1 ? ` start="${token.start}"` : '';
    const hasTasks = token.items.some((i) => i.task);
    const clsAttr = hasTasks ? ' class="contains-task-list"' : '';
    let body = '';
    for (const item of token.items) {
      body += this.listitem(item);
    }
    return `<${tag}${startAttr}${clsAttr}>\n${body}</${tag}>\n`;
  };

  const rawHtml = marked.parse(body, {
    renderer,
    gfm: true,
    breaks: false,
  }) as string;

  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['button', 'svg', 'rect', 'path', 'input'],
    ADD_ATTR: [
      'data-code-block',
      'data-copy-code',
      'data-task-index',
      'data-task-checked',
      'data-checked',
      'aria-label',
      'aria-checked',
      'role',
      'tabindex',
      'type',
      'viewBox',
      'width',
      'height',
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'x',
      'y',
      'rx',
      'ry',
      'd',
      'aria-hidden',
      'checked',
      'disabled',
      'start',
    ],
  });

  return {
    html: cleanHtml,
    toc: renderedToc.length > 0 ? renderedToc : lineToc,
    properties,
  };
}
