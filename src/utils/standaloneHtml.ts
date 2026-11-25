import { DocumentTheme, EditorPreferences } from '../types/onetxt';
import { generateThemeCss } from './cssGenerator';

function escapeJsonForHtmlScript(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function escapeHtmlText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generates a self-contained single-file OneTXT.html document containing:
 * - Current Markdown document, title, theme, preferences, and pinned headings
 * - YAML frontmatter stripped from main Reader view and displayed in Outline sidebar
 * - Gray font on ticked checkboxes + interactive Reader mode checkbox toggling
 * - Color-coded Source Mode + condensed 10px code blocks + glass icon pill
 */
export function buildStandaloneOneTxtHtml(params: {
  title: string;
  content: string;
  theme: DocumentTheme;
  preferences: EditorPreferences;
  pinnedHeadings?: string[];
}): string {
  const { title, content, theme, preferences, pinnedHeadings = [] } = params;
  const initialCss = generateThemeCss(theme);
  const payload = escapeJsonForHtmlScript({
    title,
    content,
    theme,
    preferences,
    pinnedHeadings,
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtmlText(title)} — OneTXT</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inconsolata:wdth,wght@75..100,400..700&family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
<style id="onetxt-base-css">
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --ui-bg: ${theme.pageBg};
    --ui-surface: ${theme.surfaceBg};
    --ui-text: ${theme.textColor};
    --ui-muted: ${theme.mutedColor};
    --ui-accent: ${theme.accentColor};
    --ui-border: ${theme.isDarkUI ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)'};
  }
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body {
    margin: 0;
    background: var(--ui-bg);
    color: var(--ui-text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding-bottom: 92px;
  }
  .topbar {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px 24px 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid var(--ui-border);
  }
  .doc-title-input {
    background: transparent;
    border: none;
    color: var(--ui-text);
    font-size: 1.05rem;
    font-weight: 600;
    padding: 4px 0;
    min-width: 220px;
    outline: none;
  }
  .doc-stats {
    font-size: 0.78rem;
    color: var(--ui-muted);
    font-variant-numeric: tabular-nums;
  }
  .main-wrap {
    padding: ${theme.contentPaddingY}px ${theme.contentPaddingX}px;
  }
  .source-wrap {
    max-width: 960px;
    margin: 0 auto;
    padding-bottom: 96px;
    position: relative;
  }
  #source-mirror, #source-editor {
    font-family: 'Ubuntu Mono', 'Inconsolata', ui-monospace, monospace;
    font-size: ${preferences.editorFontSize}px;
    line-height: 1.65;
    padding: 12px 4px;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    tab-size: 2;
    margin: 0;
  }
  #source-mirror {
    min-height: calc(100dvh - 120px);
    pointer-events: none;
    user-select: none;
    color: var(--ui-text);
  }
  #source-editor {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    color: transparent;
    -webkit-text-fill-color: transparent;
    caret-color: var(--ui-text);
    border: none;
    resize: none;
    overflow: hidden;
    outline: none;
  }
  .src-yaml-delim { color: #94A3B8; }
  .src-yaml-key { color: ${theme.isDarkUI ? '#38BDF8' : '#0284C7'}; }
  .src-yaml-val { color: ${theme.isDarkUI ? '#4ADE80' : '#059669'}; }
  .src-h { color: ${theme.isDarkUI ? '#32CD32' : '#2563EB'}; }
  .src-code { color: ${theme.isDarkUI ? '#FDA4AF' : '#BE123C'}; }
  .src-quote { color: ${theme.isDarkUI ? '#94A3B8' : '#475569'}; }
  .src-list { color: ${theme.isDarkUI ? '#38BDF8' : '#0284C7'}; }
  .src-check-on { color: #4ADE80; }
  .src-check-off { color: #FBBF24; }
  .src-link { color: ${theme.isDarkUI ? '#60A5FA' : '#2563EB'}; }
  .onetxt-prose .onetxt-code-wrap { position: relative; margin: 1.5em 0; overflow: hidden; }
  .onetxt-prose .onetxt-code-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 10px 7px 14px; font-size: 12px;
  }
  .onetxt-prose .onetxt-code-lang {
    font-family: 'Ubuntu Mono', 'Inconsolata', ui-monospace, monospace;
    font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  }
  .onetxt-prose .onetxt-copy-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; min-height: 28px; border-radius: 6px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.16);
  }
  .onetxt-prose pre {
    margin: 0 !important; overflow-x: auto; border: none !important;
    font-size: 10px !important;
    font-family: 'Ubuntu Mono', 'Inconsolata', ui-monospace, monospace !important;
    font-stretch: condensed;
  }
  .onetxt-prose pre code {
    background: transparent !important; padding: 0 !important; color: inherit !important;
    font-size: 10px !important;
    font-family: 'Ubuntu Mono', 'Inconsolata', ui-monospace, monospace !important;
    font-stretch: condensed;
  }
  .onetxt-prose pre .tok-keyword { color: #C084FC; font-weight: 600; }
  .onetxt-prose pre .tok-string { color: #86EFAC; }
  .onetxt-prose pre .tok-comment { color: #64748B; font-style: italic; }
  .onetxt-prose pre .tok-number { color: #FB923C; }
  .onetxt-prose pre .tok-function { color: #38BDF8; }
  .onetxt-prose pre .tok-type { color: #FACC15; }
  .onetxt-prose ul.contains-task-list { list-style: none; padding-left: 0.25rem; }
  .onetxt-prose li.task-list-item { list-style: none; position: relative; padding-left: 1.7rem; }
  .onetxt-prose .onetxt-checkbox {
    position: absolute; left: 0; top: 0.28em;
    display: inline-flex; align-items: center; justify-content: center;
    width: 17px; height: 17px; border-radius: 5.5px; cursor: pointer;
  }
  .onetxt-prose .onetxt-table-wrap { width: 100%; max-width: 100%; overflow-x: auto; margin: 1.4em 0; }
  .onetxt-prose table { width: 100%; max-width: 100%; }
  .onetxt-prose th, .onetxt-prose td { overflow-wrap: break-word; word-break: normal; }
  .bottom-dock {
    position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
    height: 50px; padding: 0 6px; z-index: 40;
    background: ${theme.isDarkUI ? 'rgba(24,24,27,0.58)' : 'rgba(255,255,255,0.65)'};
    border: 1px solid ${theme.isDarkUI ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.75)'};
    border-radius: 9999px;
    box-shadow: ${theme.isDarkUI ? '0 12px 36px -6px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.14)' : '0 12px 34px -6px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.7)'};
    backdrop-filter: blur(22px) saturate(150%);
    -webkit-backdrop-filter: blur(22px) saturate(150%);
    display: inline-flex; align-items: center; gap: 4px;
  }
  .dock-btn {
    height: 40px; min-width: 44px; padding: 0 12px; border-radius: 9999px;
    background: transparent; border: none; color: var(--ui-muted);
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; font-size: 11px; font-weight: 600; cursor: pointer;
    white-space: nowrap;
  }
  .dock-btn .dock-label { display: none; }
  .dock-btn.show-label { padding: 0 14px; background: rgba(128,128,128,0.14); color: var(--ui-accent); }
  .dock-btn.show-label .dock-label { display: inline; }
  .drawer-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.42); z-index: 50; display: none;
  }
  .drawer-backdrop.open { display: block; }
  .drawer {
    position: fixed; top: 0; bottom: 0; right: 0; width: min(440px, 100vw);
    background: var(--ui-surface); color: var(--ui-text);
    border-left: 1px solid var(--ui-border); z-index: 60;
    transform: translateX(100%); transition: transform 180ms cubic-bezier(0.16,1,0.3,1);
    display: flex; flex-direction: column;
  }
  .drawer.left { right: auto; left: 0; border-left: none; border-right: 1px solid var(--ui-border); transform: translateX(-100%); width: min(340px, 100vw); }
  .drawer.open { transform: translateX(0); }
  .drawer-head {
    padding: 16px 18px; border-bottom: 1px solid var(--ui-border);
    display: flex; align-items: center; justify-content: space-between; font-weight: 600;
  }
  .drawer-body { padding: 16px 18px; overflow-y: auto; flex: 1; }
  .props-box { border-bottom: 1px solid var(--ui-border); padding-bottom: 10px; margin-bottom: 10px; }
  .prop-row { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; padding: 2px 0; }
  .prop-k { color: var(--ui-muted); font-family: ui-monospace, monospace; }
  .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .ui-btn {
    padding: 8px 12px; border-radius: 7px; border: 1px solid var(--ui-border);
    background: var(--ui-bg); color: var(--ui-text); font-size: 12.5px; font-weight: 500; cursor: pointer;
  }
  .ui-btn.primary { background: var(--ui-accent); color: #050805; border-color: transparent; font-weight: 600; }
  .toc-row { display: flex; align-items: center; gap: 4px; border-radius: 6px; }
  .toc-row:hover { background: var(--ui-bg); }
  .toc-item {
    flex: 1; text-align: left; background: transparent; border: none;
    color: var(--ui-text); padding: 7px 6px; cursor: pointer; font-size: 10px;
  }
  .toc-pin {
    background: transparent; border: none; color: var(--ui-muted); cursor: pointer;
    padding: 6px 8px; font-size: 10px;
  }
  .field-label { display: block; font-size: 12px; color: var(--ui-muted); margin: 10px 0 4px; }
  .field-input, .field-select, .field-textarea {
    width: 100%; padding: 8px 10px; border-radius: 7px;
    border: 1px solid var(--ui-border); background: var(--ui-bg); color: var(--ui-text);
    font-size: 13px;
  }
  .field-textarea { min-height: 120px; font-family: ui-monospace, monospace; font-size: 12px; }
  .hidden { display: none !important; }
</style>
<style id="onetxt-theme-css">${initialCss}</style>
</head>
<body>
  <header class="topbar">
    <input id="doc-title" class="doc-title-input" type="text" value="${escapeHtmlText(title)}" aria-label="Document title" />
    <div id="doc-stats" class="doc-stats"></div>
  </header>

  <main class="main-wrap">
    <article id="read-view" class="onetxt-prose"></article>
    <div id="source-view" class="source-wrap hidden">
      <pre id="source-mirror" aria-hidden="true"></pre>
      <textarea id="source-editor" spellcheck="true" aria-label="Markdown source editor"></textarea>
    </div>
  </main>

  <div id="backdrop" class="drawer-backdrop"></div>

  <aside id="outline-drawer" class="drawer left" aria-label="Outline and Properties">
    <div class="drawer-head">
      <span>Outline &amp; Info</span>
      <button class="ui-btn" id="close-outline" type="button">Close</button>
    </div>
    <div id="toc-list" class="drawer-body"></div>
  </aside>

  <aside id="settings-drawer" class="drawer" aria-label="Settings and Theme Studio">
    <div class="drawer-head">
      <span>Settings &amp; Theme</span>
      <button class="ui-btn" id="close-settings" type="button">Close</button>
    </div>
    <div class="drawer-body">
      <label class="field-label" for="heading-select">Header Level to Style</label>
      <select id="heading-select" class="field-select">
        <option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option>
        <option value="h4">H4</option><option value="h5">H5</option><option value="h6">H6</option>
      </select>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div><label class="field-label">Font Size</label><input id="h-size" class="field-input" /></div>
        <div><label class="field-label">Color</label><input id="h-color" class="field-input" type="color" style="height:36px;padding:2px;" /></div>
      </div>
      <label class="field-label">Custom CSS for Selected Header</label>
      <textarea id="h-custom-css" class="field-textarea" style="min-height:72px;"></textarea>
      <label class="field-label">Global Scoped Custom CSS</label>
      <textarea id="raw-custom-css" class="field-textarea"></textarea>
      <div class="btn-row" style="margin-top:14px;">
        <button id="btn-export-md" class="ui-btn" type="button">Backup Text (.md)</button>
        <button id="btn-export-theme" class="ui-btn" type="button">Backup Theme (.json)</button>
        <button id="btn-export-full" class="ui-btn primary" type="button">Full Backup (.json)</button>
        <button id="btn-export-html" class="ui-btn" type="button">Save OneTXT.html</button>
      </div>
      <label class="field-label">Restore Backup (.md / .txt / .json)</label>
      <input id="import-file" type="file" accept=".md,.txt,.json" class="field-input" />
    </div>
  </aside>

  <nav class="bottom-dock" aria-label="Document Navigation">
    <button id="nav-mode" class="dock-btn" type="button" aria-label="Switch Source or Read Mode">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span class="dock-label" id="nav-mode-label">Source</span>
    </button>
    <button id="nav-outline" class="dock-btn" type="button" aria-label="Outline">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12h-8"/><path d="M21 6H8"/><path d="M21 18h-8"/><path d="M3 6v4c0 1.1.9 2 2 2h3"/><path d="M3 10v6c0 1.1.9 2 2 2h3"/></svg>
      <span class="dock-label">Outline</span>
    </button>
    <button id="nav-settings" class="dock-btn" type="button" aria-label="Settings">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
      <span class="dock-label">Settings</span>
    </button>
  </nav>

  <script id="onetxt-state" type="application/json">${payload}</script>
  <script>
    (function() {
      var STORAGE_KEY = 'onetxt_standalone_' + (document.title || 'doc');
      var initial = JSON.parse(document.getElementById('onetxt-state').textContent);
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch(e) {}
      var state = saved && saved.content !== undefined ? saved : initial;
      if (!Array.isArray(state.pinnedHeadings)) state.pinnedHeadings = [];
      var mode = 'read';
      var modeTimer = null;

      var readEl = document.getElementById('read-view');
      var sourceWrap = document.getElementById('source-view');
      var mirrorEl = document.getElementById('source-mirror');
      var editorEl = document.getElementById('source-editor');
      var titleEl = document.getElementById('doc-title');
      var statsEl = document.getElementById('doc-stats');
      var tocEl = document.getElementById('toc-list');
      var themeStyleEl = document.getElementById('onetxt-theme-css');

      var LANG_COLORS = {
        typescript: '#38BDF8', ts: '#38BDF8', javascript: '#FACC15', js: '#FACC15',
        css: '#C084FC', html: '#FB923C', json: '#34D399', bash: '#4ADE80', sh: '#4ADE80',
        python: '#60A5FA', py: '#60A5FA', sql: '#F472B6'
      };

      function esc(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }

      function parseYaml(md) {
        var m = /^---\\r?\\n([\\s\\S]*?)\\r?\\n---(?:\\r?\\n|$)/.exec(md);
        if (!m) return { props: [], body: md, fmLines: 0 };
        var props = [];
        m[1].split(/\\r?\\n/).forEach(function(l) {
          var kv = /^([A-Za-z0-9_.-]+)\\s*:\\s*(.+)$/.exec(l.trim());
          if (kv) props.push({ key: kv[1], value: kv[2].replace(/^\\[|\\]$/g, '') });
        });
        return { props: props, body: md.slice(m[0].length), fmLines: m[0].split(/\\r?\\n/).length - 1 };
      }

      function highlightSource(md) {
        var lines = md.split(/\\r?\\n/), inYaml = false, yamlDone = false, inFence = false;
        return lines.map(function(line, idx) {
          if (idx === 0 && /^---\\s*$/.test(line)) { inYaml = true; return '<span class="src-yaml-delim">' + esc(line) + '</span>'; }
          if (inYaml && !yamlDone) {
            if (/^---\\s*$/.test(line)) { inYaml = false; yamlDone = true; return '<span class="src-yaml-delim">' + esc(line) + '</span>'; }
            var kv = /^(\\s*[A-Za-z0-9_.-]+)(\\s*:\\s*)(.*)$/.exec(line);
            if (kv) return '<span class="src-yaml-key">' + esc(kv[1]) + '</span>' + esc(kv[2]) + '<span class="src-yaml-val">' + esc(kv[3]) + '</span>';
            return esc(line);
          }
          if (/^\\s*\`\`\`/.test(line)) { inFence = !inFence; return '<span class="src-yaml-delim">' + esc(line) + '</span>'; }
          if (inFence) return highlightCode(line);
          if (/^\\s{0,3}#{1,6}\\s+/.test(line)) return '<span class="src-h">' + esc(line) + '</span>';
          if (/^\\s*>/.test(line)) return '<span class="src-quote">' + esc(line) + '</span>';
          var tm = /^(\\s*(?:[-*+]|\\d+\\.)\\s+)(\\[[ xX]\\])(.*)$/.exec(line);
          if (tm) {
            var chk = tm[2].toLowerCase().indexOf('x') !== -1;
            return '<span class="src-list">' + esc(tm[1]) + '</span><span class="' + (chk ? 'src-check-on' : 'src-check-off') + '">' + esc(tm[2]) + '</span>' + esc(tm[3]);
          }
          return esc(line).replace(/\`([^\`]+)\`/g, '<span class="src-code">\`$1\`</span>');
        }).join('\\n') + '\\n';
      }

      function highlightCode(code) {
        var out = esc(code);
        out = out.replace(/(\\/\\/[^\\n]*|#[^\\n]*)/g, '<span class="tok-comment">$1</span>');
        out = out.replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, '<span class="tok-string">$1</span>');
        out = out.replace(/\\b(const|let|var|function|return|interface|type|export|import|from|if|else|for|while|class|true|false|null)\\b/g, '<span class="tok-keyword">$1</span>');
        out = out.replace(/\\b(\\d+)\\b/g, '<span class="tok-number">$1</span>');
        return out;
      }

      function inlineMd(s) {
        var out = esc(s);
        out = out.replace(/\`([^\`]+)\`/g, function(_, c){ return '<code>' + c + '</code>'; });
        out = out.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
        out = out.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
        out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        out = out.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return out;
      }

      var CHECK_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

      function renderMd(md) {
        var parsed = parseYaml(md);
        var lines = parsed.body.split(/\\r?\\n/);
        var html = [], toc = [], i = 0, hCount = 0, taskIdx = 0;
        while (i < lines.length) {
          var line = lines[i];
          var fence = /^\\s*\`\`\`(.*)$/.exec(line);
          if (fence) {
            var lang = (fence[1] || '').trim() || 'text';
            var lColor = LANG_COLORS[lang.toLowerCase()] || '#94A3B8';
            var code = []; i++;
            while (i < lines.length && !/^\\s*\`\`\`/.test(lines[i])) { code.push(lines[i]); i++; }
            html.push('<div class="onetxt-code-wrap"><div class="onetxt-code-header"><span class="onetxt-code-lang" style="color:' + lColor + '">' + esc(lang) + '</span><button type="button" class="onetxt-copy-btn" data-copy-code="true">Copy</button></div><pre><code>' + highlightCode(code.join('\\n')) + '</code></pre></div>');
            i++; continue;
          }
          var hm = /^\\s{0,3}(#{1,6})\\s+(.+)$/.exec(line);
          if (hm) {
            var lvl = hm[1].length, id = 'onetxt-h-' + hCount++;
            toc.push({ id: id, level: lvl, text: hm[2].trim(), line: parsed.fmLines + i + 1 });
            html.push('<h' + lvl + ' id="' + id + '">' + inlineMd(hm[2].trim()) + '</h' + lvl + '>');
            i++; continue;
          }
          if (/^\\s*(---+|\\*\\*\\*+)\\s*$/.test(line)) { html.push('<hr />'); i++; continue; }
          if (/^\\s*>/.test(line)) {
            var bq = [];
            while (i < lines.length && /^\\s*>/.test(lines[i])) { bq.push(lines[i].replace(/^\\s*>\\s?/, '')); i++; }
            html.push('<blockquote><p>' + inlineMd(bq.join(' ')) + '</p></blockquote>');
            continue;
          }
          if (line.indexOf('|') !== -1 && i + 1 < lines.length && /^\\s*\\|?[\\s:-]+\\|/.test(lines[i + 1])) {
            var headers = line.trim().replace(/^\\||\\|$/g, '').split('|').map(function(c){ return '<th>' + inlineMd(c.trim()) + '</th>'; }).join('');
            i += 2;
            var rows = [];
            while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim() !== '') {
              var cells = lines[i].trim().replace(/^\\||\\|$/g, '').split('|').map(function(c){ return '<td>' + inlineMd(c.trim()) + '</td>'; }).join('');
              rows.push('<tr>' + cells + '</tr>');
              i++;
            }
            html.push('<div class="onetxt-table-wrap"><table><thead><tr>' + headers + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>');
            continue;
          }
          if (/^\\s*[-*+]\\s+/.test(line)) {
            var ul = [], hasTask = false;
            while (i < lines.length && /^\\s*[-*+]\\s+/.test(lines[i])) {
              var itemTxt = lines[i].replace(/^\\s*[-*+]\\s+/, '');
              var taskMatch = /^\\[([xX ])\\]\\s+(.*)$/.exec(itemTxt);
              if (taskMatch) {
                hasTask = true;
                var chk = taskMatch[1].toLowerCase() === 'x';
                var idx = taskIdx++;
                ul.push('<li class="task-list-item" data-task-checked="' + (chk ? 'true' : 'false') + '"><span class="onetxt-checkbox" data-task-index="' + idx + '" data-checked="' + (chk ? 'true' : 'false') + '">' + (chk ? CHECK_SVG : '') + '</span>' + inlineMd(taskMatch[2]) + '</li>');
              } else {
                ul.push('<li>' + inlineMd(itemTxt) + '</li>');
              }
              i++;
            }
            html.push('<ul' + (hasTask ? ' class="contains-task-list"' : '') + '>' + ul.join('') + '</ul>');
            continue;
          }
          if (/^\\s*\\d+\\.\\s+/.test(line)) {
            var ol = [];
            while (i < lines.length && /^\\s*\\d+\\.\\s+/.test(lines[i])) { ol.push('<li>' + inlineMd(lines[i].replace(/^\\s*\\d+\\.\\s+/, '')) + '</li>'); i++; }
            html.push('<ol>' + ol.join('') + '</ol>'); continue;
          }
          if (line.trim() === '') { i++; continue; }
          var p = [];
          while (i < lines.length && lines[i].trim() !== '' && !/^\\s*(#{1,6}\\s|\`\`\`|>|[-*+]\\s|\\d+\\.\\s|---)/.test(lines[i])) {
            p.push(lines[i]); i++;
          }
          html.push('<p>' + inlineMd(p.join(' ')) + '</p>');
        }
        return { html: html.join('\\n'), toc: toc, props: parsed.props, body: parsed.body };
      }

      function toggleTaskAt(targetIndex) {
        var parsed = parseYaml(state.content);
        var lines = state.content.split(/\\r?\\n/);
        var inFence = false, count = 0;
        for (var i = parsed.fmLines; i < lines.length; i++) {
          if (/^\\s*\`\`\`/.test(lines[i])) { inFence = !inFence; continue; }
          if (inFence) continue;
          var m = /^(\\s*(?:[-*+]|\\d+\\.)\\s+\\[)([ xX])(\\]\\s*.*)$/.exec(lines[i]);
          if (m) {
            if (count === targetIndex) {
              lines[i] = m[1] + (m[2].toLowerCase() === 'x' ? ' ' : 'x') + m[3];
              state.content = lines.join('\\n');
              syncAll();
              return;
            }
            count++;
          }
        }
      }

      function fitTables() {
        var wraps = readEl.querySelectorAll('.onetxt-table-wrap');
        for (var i = 0; i < wraps.length; i++) {
          var wrap = wraps[i];
          var table = wrap.querySelector('table');
          if (!table) continue;
          var cols = table.querySelectorAll('thead tr:first-child th, tbody tr:first-child td').length || 1;
          var px = cols >= 7 ? 10 : cols >= 5 ? 11.5 : cols === 4 ? 12.5 : 14;
          table.style.fontSize = Math.max(9, px) + 'px';
          var maxW = wrap.clientWidth;
          while (maxW > 0 && table.scrollWidth > maxW + 1 && px > 9) {
            px = Math.max(9, Number((px - 0.5).toFixed(1)));
            table.style.fontSize = px + 'px';
          }
        }
      }

      function renderTocRow(item, isPinnedSection) {
        var key = item.level + ':' + item.text;
        var isPinned = state.pinnedHeadings.indexOf(key) !== -1;
        var indent = isPinnedSection ? 8 : (item.level - 1) * 12 + 8;
        return '<div class="toc-row"><button class="toc-item" data-id="' + item.id + '" style="padding-left:' + indent + 'px">' + esc(item.text) + '</button><button class="toc-pin" data-pin="' + esc(key) + '" title="' + (isPinned ? 'Unpin' : 'Pin to top') + '">' + (isPinned ? 'Unpin' : 'Pin') + '</button></div>';
      }

      function syncAll() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
        var res = renderMd(state.content);
        readEl.innerHTML = res.html;
        mirrorEl.innerHTML = highlightSource(state.content);
        fitTables();
        var words = res.body.trim() ? res.body.trim().split(/\\s+/).length : 0;
        statsEl.textContent = words + ' words · ' + Math.max(1, Math.ceil(words/225)) + ' min read';
        var propsHtml = '';
        if (res.props.length) {
          propsHtml = '<div class="props-box"><div style="font-size:10px;font-weight:600;margin-bottom:4px;">Properties</div>' +
            res.props.map(function(pr){ return '<div class="prop-row"><span class="prop-k">' + esc(pr.key) + '</span><span>' + esc(pr.value) + '</span></div>'; }).join('') +
            '</div>';
        }
        var pinnedRows = res.toc.filter(function(item) {
          return state.pinnedHeadings.indexOf(item.level + ':' + item.text) !== -1;
        });
        var htmlToc = propsHtml;
        if (pinnedRows.length) {
          htmlToc += '<div style="font-size:10px;opacity:0.55;padding:4px 8px;">Pinned</div>' + pinnedRows.map(function(it){ return renderTocRow(it, true); }).join('') + '<hr style="border:none;border-top:1px solid var(--ui-border);margin:8px 0;" />';
        }
        htmlToc += res.toc.map(function(it){ return renderTocRow(it, false); }).join('');
        tocEl.innerHTML = htmlToc || '<div style="opacity:0.6;font-size:10px;">No headings found.</div>';
      }

      window.addEventListener('resize', fitTables);

      readEl.addEventListener('click', function(e) {
        var chk = e.target.closest('.onetxt-checkbox[data-task-index]');
        if (chk) {
          toggleTaskAt(Number(chk.dataset.taskIndex));
          return;
        }
        var btn = e.target.closest('[data-copy-code]');
        if (!btn) return;
        var wrap = btn.closest('.onetxt-code-wrap');
        var code = wrap ? wrap.querySelector('pre code') : null;
        if (!code) return;
        var txt = code.textContent || '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function(){});
        btn.textContent = 'Copied';
        setTimeout(function() { btn.textContent = 'Copy'; }, 1800);
      });

      tocEl.addEventListener('click', function(e) {
        var pinBtn = e.target.closest('.toc-pin');
        if (pinBtn) {
          var key = pinBtn.dataset.pin;
          var idx = state.pinnedHeadings.indexOf(key);
          if (idx === -1) state.pinnedHeadings.unshift(key);
          else state.pinnedHeadings.splice(idx, 1);
          syncAll();
          return;
        }
        var item = e.target.closest('.toc-item');
        if (!item) return;
        if (mode !== 'read') setMode('read');
        var target = document.getElementById(item.dataset.id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeDrawers();
      });

      function setMode(next) {
        mode = next;
        document.getElementById('nav-mode-label').textContent = mode === 'source' ? 'Source' : 'Read';
        document.getElementById('nav-mode').classList.add('show-label');
        clearTimeout(modeTimer);
        modeTimer = setTimeout(function() {
          document.getElementById('nav-mode').classList.remove('show-label');
        }, 2000);
        if (mode === 'source') {
          editorEl.value = state.content;
          mirrorEl.innerHTML = highlightSource(state.content);
          readEl.classList.add('hidden');
          sourceWrap.classList.remove('hidden');
        } else {
          sourceWrap.classList.add('hidden');
          readEl.classList.remove('hidden');
          syncAll();
        }
      }

      function closeDrawers() {
        document.getElementById('outline-drawer').classList.remove('open');
        document.getElementById('settings-drawer').classList.remove('open');
        document.getElementById('backdrop').classList.remove('open');
        document.getElementById('nav-outline').classList.remove('show-label');
        document.getElementById('nav-settings').classList.remove('show-label');
      }

      document.getElementById('nav-mode').addEventListener('click', function() {
        setMode(mode === 'read' ? 'source' : 'read');
      });
      document.getElementById('nav-outline').addEventListener('click', function() {
        closeDrawers();
        document.getElementById('nav-outline').classList.add('show-label');
        document.getElementById('outline-drawer').classList.add('open');
        document.getElementById('backdrop').classList.add('open');
      });
      document.getElementById('nav-settings').addEventListener('click', function() {
        closeDrawers();
        document.getElementById('nav-settings').classList.add('show-label');
        document.getElementById('settings-drawer').classList.add('open');
        document.getElementById('backdrop').classList.add('open');
      });
      document.getElementById('close-outline').addEventListener('click', closeDrawers);
      document.getElementById('close-settings').addEventListener('click', closeDrawers);
      document.getElementById('backdrop').addEventListener('click', closeDrawers);

      editorEl.addEventListener('input', function() {
        state.content = editorEl.value;
        syncAll();
      });
      titleEl.addEventListener('input', function() {
        state.title = titleEl.value;
        document.title = (state.title || 'OneTXT') + ' — OneTXT';
        syncAll();
      });

      var hSel = document.getElementById('heading-select');
      var hSize = document.getElementById('h-size');
      var hColor = document.getElementById('h-color');
      var hCss = document.getElementById('h-custom-css');
      var rawCss = document.getElementById('raw-custom-css');

      function applyThemeCss() {
        var css = [];
        ['h1','h2','h3','h4','h5','h6'].forEach(function(tag) {
          var h = state.theme.headings[tag];
          if (!h) return;
          css.push('.onetxt-prose ' + tag + ' { font-size:' + h.fontSize + '; color:' + h.color + '; ' + (h.customCss || '') + ' }');
        });
        if (state.theme.rawCustomCss) css.push(state.theme.rawCustomCss);
        themeStyleEl.textContent = (themeStyleEl.dataset.base || themeStyleEl.textContent) + '\\n' + css.join('\\n');
      }
      themeStyleEl.dataset.base = themeStyleEl.textContent;

      function loadHeadingControls() {
        var h = state.theme.headings[hSel.value];
        hSize.value = h.fontSize;
        hColor.value = /^#[0-9a-fA-F]{6}$/.test(h.color) ? h.color : '#18181b';
        hCss.value = h.customCss || '';
        rawCss.value = state.theme.rawCustomCss || '';
      }
      hSel.addEventListener('change', loadHeadingControls);
      hSize.addEventListener('input', function() { state.theme.headings[hSel.value].fontSize = hSize.value; applyThemeCss(); syncAll(); });
      hColor.addEventListener('input', function() { state.theme.headings[hSel.value].color = hColor.value; applyThemeCss(); syncAll(); });
      hCss.addEventListener('input', function() { state.theme.headings[hSel.value].customCss = hCss.value; applyThemeCss(); syncAll(); });
      rawCss.addEventListener('input', function() { state.theme.rawCustomCss = rawCss.value; applyThemeCss(); syncAll(); });

      function dl(name, txt, mime) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([txt], { type: mime }));
        a.download = name; a.click();
      }
      document.getElementById('btn-export-md').addEventListener('click', function() { dl((state.title || 'OneTXT') + '.md', state.content, 'text/markdown'); });
      document.getElementById('btn-export-theme').addEventListener('click', function() { dl('OneTXT-theme.json', JSON.stringify({ app:'OneTXT', type:'theme', theme: state.theme }, null, 2), 'application/json'); });
      document.getElementById('btn-export-full').addEventListener('click', function() { dl('OneTXT-full-backup.json', JSON.stringify({ app:'OneTXT', type:'full', title: state.title, content: state.content, theme: state.theme, pinnedHeadings: state.pinnedHeadings }, null, 2), 'application/json'); });
      document.getElementById('btn-export-html').addEventListener('click', function() {
        document.getElementById('onetxt-state').textContent = JSON.stringify(state).replace(/</g,'\\\\u003c');
        dl('OneTXT.html', '<!doctype html>\\n' + document.documentElement.outerHTML, 'text/html');
      });
      document.getElementById('import-file').addEventListener('change', function(e) {
        var f = e.target.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function() {
          var txt = String(r.result || '');
          if (f.name.endsWith('.json')) {
            try {
              var obj = JSON.parse(txt);
              if (obj.content !== undefined) state.content = obj.content;
              if (obj.title) { state.title = obj.title; titleEl.value = obj.title; }
              if (obj.theme) state.theme = obj.theme;
              if (Array.isArray(obj.pinnedHeadings)) state.pinnedHeadings = obj.pinnedHeadings;
              loadHeadingControls(); applyThemeCss(); syncAll();
            } catch(err) {}
          } else {
            state.content = txt; editorEl.value = txt; syncAll();
          }
        };
        r.readAsText(f);
      });

      loadHeadingControls();
      syncAll();
    })();
  </script>
</body>
</html>`;
}
