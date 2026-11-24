import { useEffect, useMemo, useRef, useState } from 'react';
import { BottomBar } from './components/BottomBar';
import { DocumentHeader } from './components/DocumentHeader';
import { MarkdownEditor, MarkdownEditorHandle } from './components/MarkdownEditor';
import { MarkdownReader } from './components/MarkdownReader';
import { OutlineDrawer } from './components/OutlineDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';
import {
  DEFAULT_DOCUMENT_CONTENT,
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_PREFERENCES,
  THEME_PRESETS,
} from './data/presets';
import {
  ActiveDrawer,
  DocumentTheme,
  EditorPreferences,
  TocItem,
  ViewMode,
} from './types/onetxt';
import { computeDocumentStats, renderMarkdownToHtml } from './utils/markdown';

const STORAGE_KEYS = {
  TITLE: 'onetxt_doc_title_v1',
  CONTENT: 'onetxt_doc_content_v1',
  THEME: 'onetxt_doc_theme_v1',
  PREFS: 'onetxt_doc_prefs_v1',
  MODE: 'onetxt_view_mode_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadStringFromStorage(key: string, fallback: string): string {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? raw : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [title, setTitle] = useState<string>(() =>
    loadStringFromStorage(STORAGE_KEYS.TITLE, DEFAULT_DOCUMENT_TITLE)
  );
  const [content, setContent] = useState<string>(() =>
    loadStringFromStorage(STORAGE_KEYS.CONTENT, DEFAULT_DOCUMENT_CONTENT)
  );
  const [theme, setTheme] = useState<DocumentTheme>(() =>
    loadFromStorage<DocumentTheme>(STORAGE_KEYS.THEME, structuredClone(THEME_PRESETS[0]))
  );
  const [preferences, setPreferences] = useState<EditorPreferences>(() =>
    loadFromStorage<EditorPreferences>(STORAGE_KEYS.PREFS, DEFAULT_PREFERENCES)
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = loadStringFromStorage(STORAGE_KEYS.MODE, 'read');
    return saved === 'source' ? 'source' : 'read';
  });
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>('none');
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>('Saved locally');

  const editorRef = useRef<MarkdownEditorHandle | null>(null);

  const { html, toc } = useMemo(() => renderMarkdownToHtml(content), [content]);
  const stats = useMemo(() => computeDocumentStats(content), [content]);

  // Sync dark/light class on <html> for clean app chrome contrast
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.isDarkUI);
  }, [theme.isDarkUI]);

  // Sync browser page title
  useEffect(() => {
    document.title = `${title.trim() || 'Untitled'} — OneTXT`;
  }, [title]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TITLE, title);
      localStorage.setItem(STORAGE_KEYS.CONTENT, content);
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(preferences));
      localStorage.setItem(STORAGE_KEYS.MODE, viewMode);
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setLastSavedText(`Saved ${hh}:${mm}`);
    } catch {
      setLastSavedText('Local storage full');
    }
  }, [title, content, theme, preferences, viewMode]);

  // Track active heading in Read Mode on scroll
  useEffect(() => {
    if (viewMode !== 'read' || toc.length === 0) return;

    const updateActiveHeading = () => {
      let currentId: string | null = toc[0]?.id ?? null;
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          currentId = item.id;
        } else {
          break;
        }
      }
      setActiveHeadingId(currentId);
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveHeading);
  }, [viewMode, toc]);

  // Close drawers with Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDrawer !== 'none') {
        setActiveDrawer('none');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDrawer]);

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === 'read' ? 'source' : 'read'));
  };

  const handleToggleDrawer = (drawer: 'outline' | 'settings') => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
  };

  const handleSelectHeading = (item: TocItem) => {
    setActiveHeadingId(item.id);
    setActiveDrawer('none');

    if (viewMode === 'read') {
      requestAnimationFrame(() => {
        const target = document.getElementById(item.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      requestAnimationFrame(() => {
        editorRef.current?.scrollToLine(item.line);
      });
    }
  };

  const handleInsertSnippet = (before: string, after?: string, placeholder?: string) => {
    editorRef.current?.insertSnippet(before, after, placeholder);
  };

  const handleImportDocument = (nextTitle: string | undefined, nextContent: string) => {
    if (nextTitle !== undefined && nextTitle.trim()) {
      setTitle(nextTitle.trim());
    }
    setContent(nextContent);
  };

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-150"
      style={{
        backgroundColor: theme.pageBg,
        color: theme.textColor,
      }}
    >
      <DocumentHeader
        title={title}
        onTitleChange={setTitle}
        stats={stats}
        viewMode={viewMode}
        headingCount={toc.length}
        lastSavedText={lastSavedText}
        onInsertSnippet={handleInsertSnippet}
      />

      <main>
        {viewMode === 'read' ? (
          <MarkdownReader
            html={html}
            theme={theme}
            onSwitchToSource={() => setViewMode('source')}
          />
        ) : (
          <MarkdownEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            theme={theme}
            preferences={preferences}
          />
        )}
      </main>

      <OutlineDrawer
        open={activeDrawer === 'outline'}
        toc={toc}
        activeHeadingId={activeHeadingId}
        viewMode={viewMode}
        accentColor={theme.accentColor}
        onSelectHeading={handleSelectHeading}
        onClose={() => setActiveDrawer('none')}
      />

      <SettingsDrawer
        open={activeDrawer === 'settings'}
        title={title}
        content={content}
        theme={theme}
        preferences={preferences}
        onThemeChange={setTheme}
        onPreferencesChange={setPreferences}
        onImportDocument={handleImportDocument}
        onClose={() => setActiveDrawer('none')}
      />

      <BottomBar
        viewMode={viewMode}
        activeDrawer={activeDrawer}
        onToggleViewMode={handleToggleViewMode}
        onToggleDrawer={handleToggleDrawer}
        accentColor={theme.accentColor}
      />
    </div>
  );
}
