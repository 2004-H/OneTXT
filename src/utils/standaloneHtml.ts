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
 * - Current Markdown document & title
 * - Current Theme & per-heading CSS configuration
 * - 3 Bottom Buttons: Source/Read Mode, Outline (TOC), Settings (CSS Theme + Backups)
 * - Code block top-right Copy button
 */
export function buildStandaloneOneTxtHtml(params: {
  title: string;
  content: string;
  theme: DocumentTheme;
  preferences: EditorPreferences;
}): string {
  const { title, content, theme, preferences } = params;
  const initialCss = generateThemeCss(theme);
  const payload = escapeJsonForHtmlScript({
    title,
    content,
    theme,
    preferences,
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtmlText(title)} — OneTXT</title>
<style id="onetxt-base-css">
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --ui-bg: ${theme.pageBg};
    --ui-surface: ${theme.surfaceBg};
    --ui-text: ${theme.textColor};
    --ui-muted: ${theme.mutedColor};
    --ui-accent: ${theme.accentColor};
    --ui-border: ${theme.isDarkUI ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)'};
  }
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body {
    margin: 0;
    background: var(--ui-bg);
    color: var(--ui-text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding-bottom: 84px;
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
    max-width: 860px;
    margin: 0 auto;
  }
  #source-editor {
    width: 100%;
    min-height: 72vh;
    background: var(--ui-surface);
    color: var(--ui-text);
    border: 1px solid var(--ui-border);
    border-radius: 10px;
    padding: 20px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: ${preferences.editorFontSize}px;
    line-height: 1.65;
    resize: vertical;
    outline: none;
  }
  .onetxt-prose .onetxt-code-wrap { position: relative; margin: 1.5em 0; overflow: hidden; }
  .onetxt-prose .onetxt-code-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 10px 7px 14px; font-size: 12px;
  }
  .onetxt-prose .onetxt-code-lang { font-family: ui-monospace, monospace; opacity: 0.72; }
  .onetxt-prose .onetxt-copy-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; min-height: 28px; border-radius: 6px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.16);
  }
  .onetxt-prose pre { margin: 0 !important; overflow-x: auto; border: none !important; }
  .onetxt-prose pre code { background: transparent !important; padding: 0 !important; color: inherit !important; }
  .onetxt-prose .onetxt-table-wrap { width: 100%; overflow-x: auto; margin: 1.4em 0; }
  .bottom-dock {
    position: fixed; bottom: 0; left: 0; right: 0; height: 56px; z-index: 40;
    background: var(--ui-surface);
    border-top: 1px solid var(--ui-border);
    display: flex; justify-content: center;
  }
  .bottom-grid {
    width: 100%; max-width: 520px;
    display: grid; grid-template-columns: repeat(3, 1fr);
    height: 100%;
  }
  .dock-btn {
    background: transparent; border: none; color: var(--ui-muted);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; font-size: 11px; font-weight: 600; cursor: pointer;
  }
  .dock-btn.active { color: var(--ui-accent); }
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
  .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .ui-btn {
    padding: 8px 12px; border-radius: 7px; border: 1px solid var(--ui-border);
    background: var(--ui-bg); color: var(--ui-text); font-size: 12.5px; font-weight: 500; cursor: pointer;
  }
  .ui-btn.primary { background: var(--ui-accent); color: #fff; border-color: transparent; }
  .toc-item {
    display: block; width: 100%; text-align: left; background: transparent; border: none;
    color: var(--ui-text); padding: 7px 8px; border-radius: 6px; cursor: pointer; font-size: 13.5px;
  }
  .toc-item:hover { background: var(--ui-bg); }
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
      <textarea id="source-editor" spellcheck="true" aria-label="Markdown source editor"></textarea>
    </div>
  </main>

  <div id="backdrop" class="drawer-backdrop"></div>

  <aside id="outline-drawer" class="drawer left" aria-label="Table of Contents">
    <div class="drawer-head">
      <span>Outline</span>
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
    <div class="bottom-grid">
      <button id="nav-mode" class="dock-btn active" type="button">Source / Read</button>
      <button id="nav-outline" class="dock-btn" type="button">Outline</button>
      <button id="nav-settings" class="dock-btn" type="button">Settings</button>
    </div>
  </nav>

  <script id="onetxt-state" type="application/json">${payload}</script>
  <script>
    (function() {
      var STORAGE_KEY = 'onetxt_standalone_' + (document.title || 'doc');
      var initial = JSON.parse(document.getElementById('onetxt-state').textContent);
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch(e) {}
      var state = saved && saved.content !== undefined ? saved : initial;
      var mode = 'read';

      var readEl = document.getElementById('read-view');
      var sourceWrap = document.getElementById('source-view');
      var editorEl = document.getElementById('source-editor');
      var titleEl = document.getElementById('doc-title');
      var statsEl = document.getElementById('doc-stats');
      var tocEl = document.getElementById('toc-list');
      var themeStyleEl = document.getElementById('onetxt-theme-css');

      function esc(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

      function renderMd(md) {
        var lines = md.split(/\\r?\\n/);
        var html = [], toc = [], i = 0, hCount = 0;
        while (i < lines.length) {
          var line = lines[i];
          var fence = /^\\s*\`\`\`(.*)$/.exec(line);
          if (fence) {
            var lang = (fence[1] || '').trim() || 'text';
            var code = []; i++;
            while (i < lines.length && !/^\\s*\`\`\`/.test(lines[i])) { code.push(lines[i]); i++; }
            html.push('<div class="onetxt-code-wrap"><div class="onetxt-code-header"><span class="onetxt-code-lang">' + esc(lang) + '</span><button type="button" class="onetxt-copy-btn" data-copy-code="true">Copy</button></div><pre><code>' + esc(code.join('\\n')) + '</code></pre></div>');
            i++; continue;
          }
          var hm = /^\\s{0,3}(#{1,6})\\s+(.+)$/.exec(line);
          if (hm) {
            var lvl = hm[1].length, id = 'onetxt-h-' + hCount++;
            toc.push({ id: id, level: lvl, text: hm[2].trim(), line: i + 1 });
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
          if (/^\\s*[-*+]\\s+/.test(line)) {
            var ul = [];
            while (i < lines.length && /^\\s*[-*+]\\s+/.test(lines[i])) { ul.push('<li>' + inlineMd(lines[i].replace(/^\\s*[-*+]\\s+/, '')) + '</li>'); i++; }
            html.push('<ul>' + ul.join('') + '</ul>'); continue;
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
        return { html: html.join('\\n'), toc: toc };
      }

      function applyThemeCss() {
        var css = [];
        ['h1','h2','h3','h4','h5','h6'].forEach(function(tag) {
          var h = state.theme.headings[tag];
          if (!h) return;
          css.push('.onetxt-prose ' + tag + ' { font-size:' + h.fontSize + '; color:' + h.color + '; ' + (h.customCss || '') + ' }');
        });
        if (state.theme.rawCustomCss) css.push(state.theme.rawCustomCss);
        themeStyleEl.textContent = initial.themeCssOverride || (themeStyleEl.dataset.base || themeStyleEl.textContent) + '\\n' + css.join('\\n');
      }
      themeStyleEl.dataset.base = themeStyleEl.textContent;

      function syncAll() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
        var res = renderMd(state.content);
        readEl.innerHTML = res.html;
        var words = state.content.trim() ? state.content.trim().split(/\\s+/).length : 0;
        statsEl.textContent = words + ' words · ' + Math.max(1, Math.ceil(words/225)) + ' min read';
        tocEl.innerHTML = res.toc.map(function(item) {
          return '<button class="toc-item" data-id="' + item.id + '" style="padding-left:' + ((item.level - 1)*14 + 8) + 'px">' + esc(item.text) + '</button>';
        }).join('') || '<div style="opacity:0.6;font-size:13px;">No headings found.</div>';
      }

      readEl.addEventListener('click', function(e) {
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
        var item = e.target.closest('.toc-item');
        if (!item) return;
        if (mode !== 'read') setMode('read');
        var target = document.getElementById(item.dataset.id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeDrawers();
      });

      function setMode(next) {
        mode = next;
        if (mode === 'source') {
          editorEl.value = state.content;
          readEl.classList.add('hidden');
          sourceWrap.classList.remove('hidden');
          document.getElementById('nav-mode').textContent = 'Read Mode';
        } else {
          sourceWrap.classList.add('hidden');
          readEl.classList.remove('hidden');
          document.getElementById('nav-mode').textContent = 'Source Mode';
          syncAll();
        }
      }

      function closeDrawers() {
        document.getElementById('outline-drawer').classList.remove('open');
        document.getElementById('settings-drawer').classList.remove('open');
        document.getElementById('backdrop').classList.remove('open');
      }

      document.getElementById('nav-mode').addEventListener('click', function() {
        setMode(mode === 'read' ? 'source' : 'read');
      });
      document.getElementById('nav-outline').addEventListener('click', function() {
        closeDrawers();
        document.getElementById('outline-drawer').classList.add('open');
        document.getElementById('backdrop').classList.add('open');
      });
      document.getElementById('nav-settings').addEventListener('click', function() {
        closeDrawers();
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
      document.getElementById('btn-export-full').addEventListener('click', function() { dl('OneTXT-full-backup.json', JSON.stringify({ app:'OneTXT', type:'full', title: state.title, content: state.content, theme: state.theme }, null, 2), 'application/json'); });
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
