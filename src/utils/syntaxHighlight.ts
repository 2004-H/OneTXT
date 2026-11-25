function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LANG_COLORS: Record<string, string> = {
  typescript: '#38BDF8',
  ts: '#38BDF8',
  tsx: '#38BDF8',
  javascript: '#FACC15',
  js: '#FACC15',
  jsx: '#FACC15',
  css: '#C084FC',
  scss: '#F472B6',
  html: '#FB923C',
  xml: '#FB923C',
  svg: '#FB923C',
  json: '#34D399',
  bash: '#4ADE80',
  sh: '#4ADE80',
  shell: '#4ADE80',
  zsh: '#4ADE80',
  python: '#60A5FA',
  py: '#60A5FA',
  sql: '#F472B6',
  yaml: '#FBBF24',
  yml: '#FBBF24',
  markdown: '#A3E635',
  md: '#A3E635',
  rust: '#F97316',
  rs: '#F97316',
  go: '#22D3EE',
};

export function getLanguageAccentColor(lang: string): string {
  const key = lang.trim().toLowerCase();
  return LANG_COLORS[key] || '#94A3B8';
}

interface TokenRule {
  pattern: RegExp;
  className: string;
}

const CODE_KEYWORDS =
  /\b(abstract|as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|readonly|return|set|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield|def|elif|except|lambda|pass|raise|None|True|False|SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|ON|GROUP|BY|ORDER|LIMIT|CREATE|TABLE|AS|AND|OR|NOT)\b/g;

function highlightByRegexList(code: string, rules: TokenRule[]): string {
  let result = '';
  let index = 0;

  while (index < code.length) {
    let bestMatch: RegExpExecArray | null = null;
    let bestRule: TokenRule | null = null;

    for (const rule of rules) {
      rule.pattern.lastIndex = index;
      const match = rule.pattern.exec(code);
      if (match && (!bestMatch || match.index < bestMatch.index)) {
        bestMatch = match;
        bestRule = rule;
      }
    }

    if (!bestMatch || !bestRule) {
      result += escapeHtml(code.slice(index));
      break;
    }

    if (bestMatch.index > index) {
      result += escapeHtml(code.slice(index, bestMatch.index));
    }

    result += `<span class="${bestRule.className}">${escapeHtml(bestMatch[0])}</span>`;
    index = bestMatch.index + bestMatch[0].length;
    if (bestMatch[0].length === 0) {
      index++;
    }
  }

  return result;
}

export function highlightCodeBlock(code: string, rawLang: string): string {
  const lang = rawLang.trim().toLowerCase();

  if (lang === 'css' || lang === 'scss') {
    return highlightByRegexList(code, [
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'tok-comment' },
      { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, className: 'tok-string' },
      { pattern: /@[a-zA-Z-]+/g, className: 'tok-keyword' },
      { pattern: /#[0-9a-fA-F]{3,8}\b/g, className: 'tok-number' },
      { pattern: /-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg)?\b/g, className: 'tok-number' },
      { pattern: /[a-zA-Z-]+(?=\s*:)/g, className: 'tok-property' },
      { pattern: /[.#][a-zA-Z_-][a-zA-Z0-9_-]*/g, className: 'tok-type' },
    ]);
  }

  if (lang === 'json') {
    return highlightByRegexList(code, [
      { pattern: /"(?:\\.|[^"\\])*"(?=\s*:)/g, className: 'tok-property' },
      { pattern: /"(?:\\.|[^"\\])*"/g, className: 'tok-string' },
      { pattern: /\b(true|false|null)\b/g, className: 'tok-keyword' },
      { pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, className: 'tok-number' },
    ]);
  }

  if (lang === 'html' || lang === 'xml' || lang === 'svg') {
    return highlightByRegexList(code, [
      { pattern: /<!--[\s\S]*?-->/g, className: 'tok-comment' },
      { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, className: 'tok-string' },
      { pattern: /<\/?[a-zA-Z0-9:-]+/g, className: 'tok-tag' },
      { pattern: /\/?>/g, className: 'tok-tag' },
      { pattern: /\b[a-zA-Z_:][-a-zA-Z0-9_:.]*(?==)/g, className: 'tok-attr' },
    ]);
  }

  if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh' || lang === 'yaml' || lang === 'yml') {
    return highlightByRegexList(code, [
      { pattern: /#[^\n]*/g, className: 'tok-comment' },
      { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, className: 'tok-string' },
      { pattern: /\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]+\}/g, className: 'tok-type' },
      { pattern: /\b(if|then|else|elif|fi|for|do|done|while|case|esac|export|echo|cd|npm|npx|git|curl|sudo|true|false)\b/g, className: 'tok-keyword' },
      { pattern: /\s--?[a-zA-Z0-9-]+/g, className: 'tok-attr' },
      { pattern: /\b\d+(?:\.\d+)?\b/g, className: 'tok-number' },
    ]);
  }

  if (lang === 'markdown' || lang === 'md') {
    return highlightByRegexList(code, [
      { pattern: /^#{1,6}\s+[^\n]*/gm, className: 'tok-keyword' },
      { pattern: /`[^`]+`/g, className: 'tok-string' },
      { pattern: /\*\*[^*]+\*\*/g, className: 'tok-type' },
      { pattern: /\[[^\]]+\]\([^)]+\)/g, className: 'tok-function' },
    ]);
  }

  return highlightByRegexList(code, [
    { pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|--[^\n]*/g, className: 'tok-comment' },
    { pattern: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, className: 'tok-string' },
    { pattern: CODE_KEYWORDS, className: 'tok-keyword' },
    { pattern: /\b[A-Z][a-zA-Z0-9_]*\b/g, className: 'tok-type' },
    { pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g, className: 'tok-function' },
    { pattern: /\b\d+(?:\.\d+)?\b/g, className: 'tok-number' },
  ]);
}

function highlightInlineMarkdownSource(line: string): string {
  return highlightByRegexList(line, [
    { pattern: /`[^`]+`/g, className: 'src-md-code' },
    { pattern: /!\[[^\]]*\]\([^)]*\)|\[[^\]]+\]\([^)]+\)/g, className: 'src-md-link' },
    { pattern: /\*\*[^*\n]+\*\*|__[^_\n]+__/g, className: 'src-md-bold' },
    { pattern: /\*[^*\n]+\*|_[^_\n]+_/g, className: 'src-md-italic' },
    { pattern: /~~[^~\n]+~~/g, className: 'src-md-strike' },
  ]);
}

/**
 * Produces character-identical HTML spans for Source Mode color-coding.
 * Never alters font-weight or font-style so textarea cursor alignment stays exact.
 */
export function highlightMarkdownSource(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];

  let inYaml = false;
  let yamlClosed = false;
  let inFence = false;
  let fenceChar = '';
  let fenceLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check YAML frontmatter at very start of document
    if (i === 0 && /^---\s*$/.test(line)) {
      inYaml = true;
      out.push(`<span class="src-md-yaml-delim">${escapeHtml(line)}</span>`);
      continue;
    }

    if (inYaml && !yamlClosed) {
      if (/^---\s*$/.test(line)) {
        inYaml = false;
        yamlClosed = true;
        out.push(`<span class="src-md-yaml-delim">${escapeHtml(line)}</span>`);
        continue;
      }
      const kv = /^(\s*[A-Za-z0-9_.-]+)(\s*:\s*)(.*)$/.exec(line);
      if (kv) {
        out.push(
          `<span class="src-md-yaml-key">${escapeHtml(kv[1])}</span><span class="src-md-muted">${escapeHtml(kv[2])}</span><span class="src-md-yaml-val">${escapeHtml(kv[3])}</span>`
        );
        continue;
      }
      const yamlList = /^(\s*-\s+)(.*)$/.exec(line);
      if (yamlList) {
        out.push(
          `<span class="src-md-list">${escapeHtml(yamlList[1])}</span><span class="src-md-yaml-val">${escapeHtml(yamlList[2])}</span>`
        );
        continue;
      }
      if (/^\s*#/.test(line)) {
        out.push(`<span class="src-md-muted">${escapeHtml(line)}</span>`);
        continue;
      }
      out.push(escapeHtml(line));
      continue;
    }

    // Fenced code block start/end
    const fenceMatch = /^(\s*)(```+|~~~+)(.*)$/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[2][0];
      if (!inFence) {
        inFence = true;
        fenceChar = marker;
        fenceLang = fenceMatch[3].trim();
        out.push(
          `${escapeHtml(fenceMatch[1])}<span class="src-md-fence">${escapeHtml(fenceMatch[2])}</span><span class="src-md-fence-lang">${escapeHtml(fenceMatch[3])}</span>`
        );
        continue;
      } else if (marker === fenceChar) {
        inFence = false;
        fenceChar = '';
        fenceLang = '';
        out.push(
          `${escapeHtml(fenceMatch[1])}<span class="src-md-fence">${escapeHtml(fenceMatch[2])}${escapeHtml(fenceMatch[3])}</span>`
        );
        continue;
      }
    }

    if (inFence) {
      out.push(`<span class="src-md-codeblock">${highlightCodeBlock(line, fenceLang)}</span>`);
      continue;
    }

    // Headings
    const headingMatch = /^(\s{0,3})(#{1,6})(\s+)(.*)$/.exec(line);
    if (headingMatch) {
      const lvl = headingMatch[2].length;
      out.push(
        `${escapeHtml(headingMatch[1])}<span class="src-md-h-mark">${escapeHtml(headingMatch[2])}</span>${escapeHtml(headingMatch[3])}<span class="src-md-heading src-md-h${lvl}">${escapeHtml(headingMatch[4])}</span>`
      );
      continue;
    }

    // Horizontal rule
    if (/^\s*(?:---+|===+|\*\*\*+|___+)\s*$/.test(line)) {
      out.push(`<span class="src-md-hr">${escapeHtml(line)}</span>`);
      continue;
    }

    // Blockquote
    const quoteMatch = /^(\s*>+\s?)(.*)$/.exec(line);
    if (quoteMatch) {
      out.push(
        `<span class="src-md-quote-mark">${escapeHtml(quoteMatch[1])}</span><span class="src-md-quote">${highlightInlineMarkdownSource(quoteMatch[2])}</span>`
      );
      continue;
    }

    // Task list
    const taskMatch = /^(\s*(?:[-*+]|\d+\.)\s+)(\[[ xX]\])(\s+)(.*)$/.exec(line);
    if (taskMatch) {
      const checked = taskMatch[2].toLowerCase().includes('x');
      out.push(
        `<span class="src-md-list">${escapeHtml(taskMatch[1])}</span><span class="${
          checked ? 'src-md-check-on' : 'src-md-check-off'
        }">${escapeHtml(taskMatch[2])}</span>${escapeHtml(taskMatch[3])}<span class="${
          checked ? 'src-md-muted' : ''
        }">${highlightInlineMarkdownSource(taskMatch[4])}</span>`
      );
      continue;
    }

    // Unordered or ordered list
    const listMatch = /^(\s*(?:[-*+]|\d+\.)\s+)(.*)$/.exec(line);
    if (listMatch) {
      out.push(
        `<span class="src-md-list">${escapeHtml(listMatch[1])}</span>${highlightInlineMarkdownSource(listMatch[2])}`
      );
      continue;
    }

    // Table row
    if (/^\s*\|/.test(line)) {
      const coloredPipes = highlightInlineMarkdownSource(line).replace(
        /\|/g,
        '<span class="src-md-table-pipe">|</span>'
      );
      out.push(coloredPipes);
      continue;
    }

    out.push(highlightInlineMarkdownSource(line));
  }

  // Trailing space/newline ensures mirror height matches textarea when ending with newline
  return out.join('\n') + '\n';
}
