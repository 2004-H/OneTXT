import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  Palette,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import {
  BODY_FONT_OPTIONS,
  DEFAULT_DOCUMENT_CONTENT,
  DEFAULT_DOCUMENT_TITLE,
  FONT_OPTIONS,
  MONO_FONT_OPTIONS,
  THEME_PRESETS,
} from '../data/presets';
import {
  BorderSide,
  BorderStyleType,
  DocumentTheme,
  EditorPreferences,
  HeadingLevel,
  HeadingStyleConfig,
  OneTxtBackup,
} from '../types/onetxt';
import { copyToClipboard, downloadFile } from '../utils/clipboard';
import { generateThemeCss } from '../utils/cssGenerator';
import { buildStandaloneOneTxtHtml } from '../utils/standaloneHtml';

interface SettingsDrawerProps {
  open: boolean;
  title: string;
  content: string;
  theme: DocumentTheme;
  preferences: EditorPreferences;
  pinnedHeadings: string[];
  onThemeChange: (next: DocumentTheme) => void;
  onPreferencesChange: (next: EditorPreferences) => void;
  onPinnedHeadingsChange: (next: string[]) => void;
  onImportDocument: (nextTitle: string | undefined, nextContent: string) => void;
  onClose: () => void;
}

type SettingsTab = 'theme' | 'css' | 'backup';
type CssTarget =
  | HeadingLevel
  | 'paragraph'
  | 'blockquote'
  | 'inlineCode'
  | 'codeBlock'
  | 'link'
  | 'list'
  | 'table'
  | 'hr'
  | 'image'
  | 'rawCss';

const HEADING_LEVELS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const ELEMENT_TARGETS: { id: CssTarget; label: string }[] = [
  { id: 'paragraph', label: 'Paragraph' },
  { id: 'blockquote', label: 'Quote' },
  { id: 'inlineCode', label: 'Inline Code' },
  { id: 'codeBlock', label: 'Code Block' },
  { id: 'link', label: 'Link' },
  { id: 'list', label: 'List' },
  { id: 'table', label: 'Table' },
  { id: 'hr', label: 'Divider' },
  { id: 'image', label: 'Image' },
  { id: 'rawCss', label: 'Raw CSS' },
];

function ColorField({
  label,
  value,
  allowTransparent,
  onChange,
}: {
  label: string;
  value: string;
  allowTransparent?: boolean;
  onChange: (val: string) => void;
}) {
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#18181b';
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={safeHex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5 cursor-pointer shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 px-2 py-1.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
        />
        {allowTransparent && value !== 'transparent' && (
          <button
            type="button"
            onClick={() => onChange('transparent')}
            className="px-2 py-1.5 text-[11px] rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function TextInputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}

export function SettingsDrawer({
  open,
  title,
  content,
  theme,
  preferences,
  pinnedHeadings,
  onThemeChange,
  onPreferencesChange,
  onPinnedHeadingsChange,
  onImportDocument,
  onClose,
}: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('css');
  const [cssTarget, setCssTarget] = useState<CssTarget>('h1');
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmResetDoc, setConfirmResetDoc] = useState(false);

  const textImportRef = useRef<HTMLInputElement | null>(null);
  const themeImportRef = useRef<HTMLInputElement | null>(null);
  const fullImportRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const notify = (type: 'ok' | 'err', text: string) => {
    setStatusMessage({ type, text });
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const updateHeading = (level: HeadingLevel, patch: Partial<HeadingStyleConfig>) => {
    onThemeChange({
      ...theme,
      headings: {
        ...theme.headings,
        [level]: {
          ...theme.headings[level],
          ...patch,
        },
      },
    });
  };

  const updateElement = <K extends keyof DocumentTheme['elements']>(
    key: K,
    patch: Partial<DocumentTheme['elements'][K]>
  ) => {
    onThemeChange({
      ...theme,
      elements: {
        ...theme.elements,
        [key]: {
          ...theme.elements[key],
          ...patch,
        },
      },
    });
  };

  const handleSelectPreset = (preset: DocumentTheme) => {
    onThemeChange(structuredClone(preset));
    notify('ok', `Applied "${preset.name}" theme preset.`);
  };

  const safeSlug = (title || 'OneTXT').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'onetxt';

  const handleExportText = (ext: 'md' | 'txt') => {
    downloadFile(`${safeSlug}.${ext}`, content, ext === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8');
    notify('ok', `Downloaded ${safeSlug}.${ext}`);
  };

  const handleCopyMarkdown = async () => {
    const ok = await copyToClipboard(content);
    notify(ok ? 'ok' : 'err', ok ? 'Copied full Markdown text to clipboard.' : 'Clipboard access failed.');
  };

  const handleExportThemeJson = () => {
    const payload: OneTxtBackup = {
      app: 'OneTXT',
      version: '1.0',
      type: 'theme',
      exportedAt: new Date().toISOString(),
      theme,
    };
    downloadFile(`${safeSlug}-theme.json`, JSON.stringify(payload, null, 2), 'application/json');
    notify('ok', `Downloaded ${safeSlug}-theme.json`);
  };

  const handleExportThemeCss = () => {
    const css = generateThemeCss(theme);
    downloadFile(`${safeSlug}-theme.css`, css, 'text/css;charset=utf-8');
    notify('ok', `Downloaded ${safeSlug}-theme.css`);
  };

  const handleExportFullJson = () => {
    const payload: OneTxtBackup = {
      app: 'OneTXT',
      version: '1.0',
      type: 'full',
      exportedAt: new Date().toISOString(),
      title,
      content,
      theme,
      preferences,
      pinnedHeadings,
    };
    downloadFile(`${safeSlug}-full-backup.json`, JSON.stringify(payload, null, 2), 'application/json');
    notify('ok', `Downloaded ${safeSlug}-full-backup.json`);
  };

  const handleExportStandaloneHtml = () => {
    const html = buildStandaloneOneTxtHtml({
      title,
      content,
      theme,
      preferences,
      pinnedHeadings,
    });
    downloadFile('OneTXT.html', html, 'text/html;charset=utf-8');
    notify('ok', 'Downloaded self-contained OneTXT.html');
  };

  const handleImportTextFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const baseTitle = file.name.replace(/\.(md|markdown|txt)$/i, '');
      onImportDocument(baseTitle || title, text);
      notify('ok', `Imported text from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleImportThemeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? ''));
        const nextTheme: DocumentTheme = parsed.theme ?? parsed;
        if (!nextTheme || !nextTheme.headings || !nextTheme.elements) {
          throw new Error('Invalid theme structure');
        }
        onThemeChange(nextTheme);
        notify('ok', `Restored theme from ${file.name}`);
      } catch {
        notify('err', 'Invalid theme JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportFullFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? '')) as Partial<OneTxtBackup>;
        if (typeof parsed.content === 'string') {
          onImportDocument(parsed.title, parsed.content);
        }
        if (parsed.theme && parsed.theme.headings && parsed.theme.elements) {
          onThemeChange(parsed.theme);
        }
        if (parsed.preferences) {
          onPreferencesChange({ ...preferences, ...parsed.preferences });
        }
        if (Array.isArray(parsed.pinnedHeadings)) {
          onPinnedHeadingsChange(parsed.pinnedHeadings);
        }
        notify('ok', `Restored full backup from ${file.name}`);
      } catch {
        notify('err', 'Invalid full backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const isHeadingTarget = HEADING_LEVELS.includes(cssTarget as HeadingLevel);
  const currentHeading = isHeadingTarget ? theme.headings[cssTarget as HeadingLevel] : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/25 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Settings and Theme Studio"
        className="relative z-10 w-full sm:w-[490px] h-full bg-white dark:bg-[#13161E] border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Settings &amp; CSS Studio
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live theme controls, per-header CSS, and backups
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Tab Switcher */}
        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
            {(
              [
                { id: 'css', label: 'Markdown CSS', icon: FileCode2 },
                { id: 'theme', label: 'Theme & Page', icon: Palette },
                { id: 'backup', label: 'Backup', icon: Download },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {statusMessage && (
          <div
            role="status"
            className={`mx-4 mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border ${
              statusMessage.type === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-5 onetxt-scroll">
          {activeTab === 'theme' && (
            <>
              <section>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2.5">
                  Theme Presets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = theme.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 ring-1 ring-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {preset.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.pageBg }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.headings.h1.color }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {preset.isDarkUI ? 'Dark canvas' : 'Light canvas'} · {preset.baseFontSize}px
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Global Surface &amp; Palette
                  </h3>
                  <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.isDarkUI}
                      onChange={(e) => onThemeChange({ ...theme, isDarkUI: e.target.checked })}
                      className="rounded cursor-pointer"
                    />
                    Dark UI Chrome
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ColorField
                    label="Page Background"
                    value={theme.pageBg}
                    onChange={(v) => onThemeChange({ ...theme, pageBg: v })}
                  />
                  <ColorField
                    label="Surface / Editor Bg"
                    value={theme.surfaceBg}
                    onChange={(v) => onThemeChange({ ...theme, surfaceBg: v })}
                  />
                  <ColorField
                    label="Base Text Color"
                    value={theme.textColor}
                    onChange={(v) => onThemeChange({ ...theme, textColor: v })}
                  />
                  <ColorField
                    label="UI Accent Color"
                    value={theme.accentColor}
                    onChange={(v) => onThemeChange({ ...theme, accentColor: v })}
                  />
                </div>
              </section>

              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Typography &amp; Page Measure
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Body Font
                    </label>
                    <select
                      value={theme.bodyFont}
                      onChange={(e) => onThemeChange({ ...theme, bodyFont: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      {BODY_FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Monospace Font
                    </label>
                    <select
                      value={theme.monoFont}
                      onChange={(e) => onThemeChange({ ...theme, monoFont: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      {MONO_FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 mb-1 tabular-nums">
                      <span>Base Font Size</span>
                      <span>{theme.baseFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={13}
                      max={22}
                      value={theme.baseFontSize}
                      onChange={(e) =>
                        onThemeChange({ ...theme, baseFontSize: Number(e.target.value) })
                      }
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 mb-1 tabular-nums">
                      <span>Line Height</span>
                      <span>{theme.baseLineHeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={1.3}
                      max={2.2}
                      step={0.04}
                      value={theme.baseLineHeight}
                      onChange={(e) =>
                        onThemeChange({ ...theme, baseLineHeight: Number(e.target.value) })
                      }
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 mb-1 tabular-nums">
                      <span>Reading Width</span>
                      <span>{theme.maxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={520}
                      max={1160}
                      step={20}
                      value={theme.maxWidth}
                      onChange={(e) =>
                        onThemeChange({ ...theme, maxWidth: Number(e.target.value) })
                      }
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 mb-1 tabular-nums">
                        <span>Side Padding</span>
                        <span>{theme.contentPaddingX}px</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={80}
                        step={4}
                        value={theme.contentPaddingX}
                        onChange={(e) =>
                          onThemeChange({ ...theme, contentPaddingX: Number(e.target.value) })
                        }
                        className="w-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 mb-1 tabular-nums">
                        <span>Vertical Padding</span>
                        <span>{theme.contentPaddingY}px</span>
                      </div>
                      <input
                        type="range"
                        min={16}
                        max={96}
                        step={4}
                        value={theme.contentPaddingY}
                        onChange={(e) =>
                          onThemeChange({ ...theme, contentPaddingY: Number(e.target.value) })
                        }
                        className="w-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Source Editor Preferences
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.showLineNumbers}
                      onChange={(e) =>
                        onPreferencesChange({ ...preferences, showLineNumbers: e.target.checked })
                      }
                    />
                    Line numbers
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.wordWrap}
                      onChange={(e) =>
                        onPreferencesChange({ ...preferences, wordWrap: e.target.checked })
                      }
                    />
                    Word wrap
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.spellCheck}
                      onChange={(e) =>
                        onPreferencesChange({ ...preferences, spellCheck: e.target.checked })
                      }
                    />
                    Spell check
                  </label>
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300 tabular-nums">
                      <span>Editor Size</span>
                      <span>{preferences.editorFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={20}
                      value={preferences.editorFontSize}
                      onChange={(e) =>
                        onPreferencesChange({
                          ...preferences,
                          editorFontSize: Number(e.target.value),
                        })
                      }
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'css' && (
            <>
              {/* Heading Selector Strip */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Headers (H1–H6)
                  </span>
                  <span className="text-[11px] text-zinc-400">Independent CSS per level</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-3">
                  {HEADING_LEVELS.map((lvl) => {
                    const active = cssTarget === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCssTarget(lvl)}
                        className={`py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                          active
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {lvl.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Markdown Elements &amp; Custom CSS
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ELEMENT_TARGETS.map((el) => {
                    const active = cssTarget === el.id;
                    return (
                      <button
                        key={el.id}
                        type="button"
                        onClick={() => setCssTarget(el.id)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {el.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Per-Heading CSS Editor */}
              {isHeadingTarget && currentHeading && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                  {/* Live Mini Heading Preview */}
                  <div
                    className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                    style={{ backgroundColor: theme.pageBg }}
                  >
                    <div
                      style={{
                        fontFamily:
                          currentHeading.fontFamily === 'inherit'
                            ? theme.bodyFont
                            : currentHeading.fontFamily,
                        fontSize: currentHeading.fontSize,
                        fontWeight: currentHeading.fontWeight,
                        lineHeight: currentHeading.lineHeight,
                        letterSpacing: currentHeading.letterSpacing,
                        textTransform: currentHeading.textTransform,
                        fontStyle: currentHeading.fontStyle,
                        textAlign: currentHeading.textAlign,
                        color: currentHeading.color,
                        backgroundColor: currentHeading.backgroundColor,
                        padding: `${currentHeading.paddingTop} ${currentHeading.paddingRight} ${currentHeading.paddingBottom} ${currentHeading.paddingLeft}`,
                        borderRadius: currentHeading.borderRadius,
                        borderBottom:
                          currentHeading.borderSide === 'bottom' ||
                          currentHeading.borderSide === 'all'
                            ? `${currentHeading.borderWidth} ${currentHeading.borderStyle} ${currentHeading.borderColor}`
                            : undefined,
                        borderLeft:
                          currentHeading.borderSide === 'left' ||
                          currentHeading.borderSide === 'all'
                            ? `${currentHeading.borderWidth} ${currentHeading.borderStyle} ${currentHeading.borderColor}`
                            : undefined,
                        borderTop:
                          currentHeading.borderSide === 'top' ||
                          currentHeading.borderSide === 'all'
                            ? `${currentHeading.borderWidth} ${currentHeading.borderStyle} ${currentHeading.borderColor}`
                            : undefined,
                        borderRight:
                          currentHeading.borderSide === 'all'
                            ? `${currentHeading.borderWidth} ${currentHeading.borderStyle} ${currentHeading.borderColor}`
                            : undefined,
                        margin: 0,
                      }}
                    >
                      {cssTarget.toUpperCase()} Live Heading Preview
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Font Family
                      </label>
                      <select
                        value={currentHeading.fontFamily}
                        onChange={(e) =>
                          updateHeading(cssTarget as HeadingLevel, { fontFamily: e.target.value })
                        }
                        className="w-full px-2.5 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <TextInputField
                      label="Font Size (rem / px)"
                      value={currentHeading.fontSize}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { fontSize: v })
                      }
                    />

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Font Weight
                      </label>
                      <select
                        value={currentHeading.fontWeight}
                        onChange={(e) =>
                          updateHeading(cssTarget as HeadingLevel, { fontWeight: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        {['300', '400', '500', '600', '700', '800'].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <TextInputField
                      label="Line Height"
                      value={currentHeading.lineHeight}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { lineHeight: v })
                      }
                    />

                    <TextInputField
                      label="Letter Spacing"
                      value={currentHeading.letterSpacing}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { letterSpacing: v })
                      }
                    />

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Transform
                      </label>
                      <select
                        value={currentHeading.textTransform}
                        onChange={(e) =>
                          updateHeading(cssTarget as HeadingLevel, {
                            textTransform: e.target.value as HeadingStyleConfig['textTransform'],
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="none">Normal</option>
                        <option value="uppercase">UPPERCASE</option>
                        <option value="capitalize">Capitalize</option>
                        <option value="lowercase">lowercase</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Style
                        </label>
                        <select
                          value={currentHeading.fontStyle}
                          onChange={(e) =>
                            updateHeading(cssTarget as HeadingLevel, {
                              fontStyle: e.target.value as 'normal' | 'italic',
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Align
                        </label>
                        <select
                          value={currentHeading.textAlign}
                          onChange={(e) =>
                            updateHeading(cssTarget as HeadingLevel, {
                              textAlign: e.target.value as 'left' | 'center' | 'right',
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Text Color"
                      value={currentHeading.color}
                      onChange={(v) => updateHeading(cssTarget as HeadingLevel, { color: v })}
                    />
                    <ColorField
                      label="Background Color"
                      value={currentHeading.backgroundColor}
                      allowTransparent
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { backgroundColor: v })
                      }
                    />
                  </div>

                  {/* Borders */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Border Placement
                      </label>
                      <select
                        value={currentHeading.borderSide}
                        onChange={(e) =>
                          updateHeading(cssTarget as HeadingLevel, {
                            borderSide: e.target.value as BorderSide,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="none">None</option>
                        <option value="bottom">Bottom Rule</option>
                        <option value="left">Left Bar</option>
                        <option value="top">Top Rule</option>
                        <option value="all">Full Box</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Border Style
                      </label>
                      <select
                        value={currentHeading.borderStyle}
                        onChange={(e) =>
                          updateHeading(cssTarget as HeadingLevel, {
                            borderStyle: e.target.value as BorderStyleType,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="double">Double</option>
                      </select>
                    </div>

                    <TextInputField
                      label="Border Width"
                      value={currentHeading.borderWidth}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { borderWidth: v })
                      }
                    />

                    <ColorField
                      label="Border Color"
                      value={currentHeading.borderColor}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { borderColor: v })
                      }
                    />
                  </div>

                  {/* Spacing */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <TextInputField
                      label="Margin Top"
                      value={currentHeading.marginTop}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { marginTop: v })
                      }
                    />
                    <TextInputField
                      label="Margin Bottom"
                      value={currentHeading.marginBottom}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { marginBottom: v })
                      }
                    />
                    <TextInputField
                      label="Radius"
                      value={currentHeading.borderRadius}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { borderRadius: v })
                      }
                    />
                    <TextInputField
                      label="Pad Top"
                      value={currentHeading.paddingTop}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { paddingTop: v })
                      }
                    />
                    <TextInputField
                      label="Pad Bottom"
                      value={currentHeading.paddingBottom}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { paddingBottom: v })
                      }
                    />
                    <TextInputField
                      label="Pad Left"
                      value={currentHeading.paddingLeft}
                      onChange={(v) =>
                        updateHeading(cssTarget as HeadingLevel, { paddingLeft: v })
                      }
                    />
                  </div>

                  {/* Per-Header Custom CSS */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Extra CSS Declarations for {cssTarget.toUpperCase()}
                    </label>
                    <textarea
                      value={currentHeading.customCss}
                      onChange={(e) =>
                        updateHeading(cssTarget as HeadingLevel, { customCss: e.target.value })
                      }
                      placeholder="e.g. text-shadow: 0 1px 2px rgba(0,0,0,0.08); display: inline-block;"
                      rows={3}
                      className="w-full px-2.5 py-2 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </section>
              )}

              {/* Paragraph Styles */}
              {cssTarget === 'paragraph' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Paragraph Text Color"
                      value={theme.elements.paragraph.color}
                      onChange={(v) => updateElement('paragraph', { color: v })}
                    />
                    <TextInputField
                      label="Font Size"
                      value={theme.elements.paragraph.fontSize}
                      onChange={(v) => updateElement('paragraph', { fontSize: v })}
                    />
                    <TextInputField
                      label="Line Height"
                      value={theme.elements.paragraph.lineHeight}
                      onChange={(v) => updateElement('paragraph', { lineHeight: v })}
                    />
                    <TextInputField
                      label="Bottom Spacing"
                      value={theme.elements.paragraph.marginBottom}
                      onChange={(v) => updateElement('paragraph', { marginBottom: v })}
                    />
                    <TextInputField
                      label="First-Line Indent"
                      value={theme.elements.paragraph.textIndent}
                      onChange={(v) => updateElement('paragraph', { textIndent: v })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Paragraph Custom CSS
                    </label>
                    <textarea
                      rows={3}
                      value={theme.elements.paragraph.customCss}
                      onChange={(e) => updateElement('paragraph', { customCss: e.target.value })}
                      placeholder="hyphens: auto;"
                      className="w-full px-2.5 py-2 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </section>
              )}

              {/* Blockquote Styles */}
              {cssTarget === 'blockquote' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Text Color"
                      value={theme.elements.blockquote.color}
                      onChange={(v) => updateElement('blockquote', { color: v })}
                    />
                    <ColorField
                      label="Background Color"
                      value={theme.elements.blockquote.backgroundColor}
                      allowTransparent
                      onChange={(v) => updateElement('blockquote', { backgroundColor: v })}
                    />
                    <ColorField
                      label="Border Color"
                      value={theme.elements.blockquote.borderColor}
                      onChange={(v) => updateElement('blockquote', { borderColor: v })}
                    />
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Border Placement
                      </label>
                      <select
                        value={theme.elements.blockquote.borderSide}
                        onChange={(e) =>
                          updateElement('blockquote', {
                            borderSide: e.target.value as BorderSide,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="all">Full Border</option>
                        <option value="left">Left Border</option>
                        <option value="bottom">Bottom Border</option>
                        <option value="top">Top Border</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <TextInputField
                      label="Border Width"
                      value={theme.elements.blockquote.borderWidth}
                      onChange={(v) => updateElement('blockquote', { borderWidth: v })}
                    />
                    <TextInputField
                      label="Border Radius"
                      value={theme.elements.blockquote.borderRadius}
                      onChange={(v) => updateElement('blockquote', { borderRadius: v })}
                    />
                    <TextInputField
                      label="Padding"
                      value={theme.elements.blockquote.padding}
                      onChange={(v) => updateElement('blockquote', { padding: v })}
                    />
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Font Style
                      </label>
                      <select
                        value={theme.elements.blockquote.fontStyle}
                        onChange={(e) =>
                          updateElement('blockquote', {
                            fontStyle: e.target.value as 'normal' | 'italic',
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="italic">Italic</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Blockquote Custom CSS
                    </label>
                    <textarea
                      rows={3}
                      value={theme.elements.blockquote.customCss}
                      onChange={(e) => updateElement('blockquote', { customCss: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </section>
              )}

              {/* Inline Code Styles */}
              {cssTarget === 'inlineCode' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Text Color"
                      value={theme.elements.inlineCode.color}
                      onChange={(v) => updateElement('inlineCode', { color: v })}
                    />
                    <ColorField
                      label="Background Color"
                      value={theme.elements.inlineCode.backgroundColor}
                      onChange={(v) => updateElement('inlineCode', { backgroundColor: v })}
                    />
                    <ColorField
                      label="Border Color"
                      value={theme.elements.inlineCode.borderColor}
                      allowTransparent
                      onChange={(v) => updateElement('inlineCode', { borderColor: v })}
                    />
                    <TextInputField
                      label="Font Size"
                      value={theme.elements.inlineCode.fontSize}
                      onChange={(v) => updateElement('inlineCode', { fontSize: v })}
                    />
                    <TextInputField
                      label="Horizontal Padding"
                      value={theme.elements.inlineCode.paddingX}
                      onChange={(v) => updateElement('inlineCode', { paddingX: v })}
                    />
                    <TextInputField
                      label="Border Radius"
                      value={theme.elements.inlineCode.borderRadius}
                      onChange={(v) => updateElement('inlineCode', { borderRadius: v })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Inline Code Custom CSS
                    </label>
                    <textarea
                      rows={3}
                      value={theme.elements.inlineCode.customCss}
                      onChange={(e) => updateElement('inlineCode', { customCss: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </section>
              )}

              {/* Code Block Styles */}
              {cssTarget === 'codeBlock' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Code Text Color"
                      value={theme.elements.codeBlock.color}
                      onChange={(v) => updateElement('codeBlock', { color: v })}
                    />
                    <ColorField
                      label="Block Background"
                      value={theme.elements.codeBlock.backgroundColor}
                      onChange={(v) => updateElement('codeBlock', { backgroundColor: v })}
                    />
                    <ColorField
                      label="Top Bar Background"
                      value={theme.elements.codeBlock.headerBg}
                      onChange={(v) => updateElement('codeBlock', { headerBg: v })}
                    />
                    <ColorField
                      label="Border Color"
                      value={theme.elements.codeBlock.borderColor}
                      onChange={(v) => updateElement('codeBlock', { borderColor: v })}
                    />
                    <ColorField
                      label="Copy Button Text"
                      value={theme.elements.codeBlock.copyBtnColor}
                      onChange={(v) => updateElement('codeBlock', { copyBtnColor: v })}
                    />
                    <ColorField
                      label="Copy Button Bg"
                      value={theme.elements.codeBlock.copyBtnBg}
                      onChange={(v) => updateElement('codeBlock', { copyBtnBg: v })}
                    />
                    <TextInputField
                      label="Font Size"
                      value={theme.elements.codeBlock.fontSize}
                      onChange={(v) => updateElement('codeBlock', { fontSize: v })}
                    />
                    <TextInputField
                      label="Border Radius"
                      value={theme.elements.codeBlock.borderRadius}
                      onChange={(v) => updateElement('codeBlock', { borderRadius: v })}
                    />
                    <TextInputField
                      label="Padding"
                      value={theme.elements.codeBlock.padding}
                      onChange={(v) => updateElement('codeBlock', { padding: v })}
                    />
                    <TextInputField
                      label="Line Height"
                      value={theme.elements.codeBlock.lineHeight}
                      onChange={(v) => updateElement('codeBlock', { lineHeight: v })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Code Block Custom CSS
                    </label>
                    <textarea
                      rows={3}
                      value={theme.elements.codeBlock.customCss}
                      onChange={(e) => updateElement('codeBlock', { customCss: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </section>
              )}

              {/* Link Styles */}
              {cssTarget === 'link' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Link Color"
                      value={theme.elements.link.color}
                      onChange={(v) => updateElement('link', { color: v })}
                    />
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Underline
                      </label>
                      <select
                        value={theme.elements.link.underlineMode}
                        onChange={(e) =>
                          updateElement('link', {
                            underlineMode: e.target.value as 'always' | 'hover' | 'none',
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="always">Always</option>
                        <option value="hover">On Hover</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <TextInputField
                      label="Underline Offset"
                      value={theme.elements.link.underlineOffset}
                      onChange={(v) => updateElement('link', { underlineOffset: v })}
                    />
                    <TextInputField
                      label="Font Weight"
                      value={theme.elements.link.fontWeight}
                      onChange={(v) => updateElement('link', { fontWeight: v })}
                    />
                  </div>
                </section>
              )}

              {/* List Styles */}
              {cssTarget === 'list' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Bullet / Number Color"
                      value={theme.elements.list.markerColor}
                      onChange={(v) => updateElement('list', { markerColor: v })}
                    />
                    <TextInputField
                      label="Item Spacing"
                      value={theme.elements.list.itemSpacing}
                      onChange={(v) => updateElement('list', { itemSpacing: v })}
                    />
                    <TextInputField
                      label="Indent"
                      value={theme.elements.list.indent}
                      onChange={(v) => updateElement('list', { indent: v })}
                    />
                  </div>
                </section>
              )}

              {/* Table Styles */}
              {cssTarget === 'table' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Header Bg"
                      value={theme.elements.table.headerBg}
                      onChange={(v) => updateElement('table', { headerBg: v })}
                    />
                    <ColorField
                      label="Header Text"
                      value={theme.elements.table.headerColor}
                      onChange={(v) => updateElement('table', { headerColor: v })}
                    />
                    <ColorField
                      label="Border Color"
                      value={theme.elements.table.borderColor}
                      onChange={(v) => updateElement('table', { borderColor: v })}
                    />
                    <ColorField
                      label="Striped Row Bg"
                      value={theme.elements.table.rowAltBg}
                      onChange={(v) => updateElement('table', { rowAltBg: v })}
                    />
                    <TextInputField
                      label="Cell Padding"
                      value={theme.elements.table.cellPadding}
                      onChange={(v) => updateElement('table', { cellPadding: v })}
                    />
                    <TextInputField
                      label="Border Radius"
                      value={theme.elements.table.borderRadius}
                      onChange={(v) => updateElement('table', { borderRadius: v })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.elements.table.striped}
                      onChange={(e) => updateElement('table', { striped: e.target.checked })}
                    />
                    Alternating striped rows
                  </label>
                </section>
              )}

              {/* Horizontal Rule Styles */}
              {cssTarget === 'hr' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Divider Color"
                      value={theme.elements.hr.color}
                      onChange={(v) => updateElement('hr', { color: v })}
                    />
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Line Style
                      </label>
                      <select
                        value={theme.elements.hr.style}
                        onChange={(e) =>
                          updateElement('hr', {
                            style: e.target.value as 'solid' | 'dashed' | 'dotted',
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                    </div>
                    <TextInputField
                      label="Thickness"
                      value={theme.elements.hr.thickness}
                      onChange={(v) => updateElement('hr', { thickness: v })}
                    />
                    <TextInputField
                      label="Vertical Margin"
                      value={theme.elements.hr.marginY}
                      onChange={(v) => updateElement('hr', { marginY: v })}
                    />
                    <TextInputField
                      label="Width"
                      value={theme.elements.hr.width}
                      onChange={(v) => updateElement('hr', { width: v })}
                    />
                  </div>
                </section>
              )}

              {/* Image Styles */}
              {cssTarget === 'image' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <TextInputField
                      label="Border Radius"
                      value={theme.elements.image.borderRadius}
                      onChange={(v) => updateElement('image', { borderRadius: v })}
                    />
                    <TextInputField
                      label="Max Width"
                      value={theme.elements.image.maxWidth}
                      onChange={(v) => updateElement('image', { maxWidth: v })}
                    />
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Shadow
                      </label>
                      <select
                        value={theme.elements.image.shadow}
                        onChange={(e) =>
                          updateElement('image', {
                            shadow: e.target.value as 'none' | 'subtle' | 'medium',
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="none">None</option>
                        <option value="subtle">Subtle</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* Global Scoped Raw CSS */}
              {cssTarget === 'rawCss' && (
                <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      Write custom CSS rules below. Selectors are automatically scoped to your
                      document.
                    </p>
                    <button
                      type="button"
                      onClick={() => onThemeChange({ ...theme, rawCustomCss: '' })}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer shrink-0"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onThemeChange({
                          ...theme,
                          rawCustomCss:
                            theme.rawCustomCss +
                            `\nh1 {\n  background: linear-gradient(120deg, ${theme.accentColor}, ${theme.headings.h1.color});\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n`,
                        })
                      }
                      className="px-2.5 py-1 text-[11px] rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      + Gradient H1
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onThemeChange({
                          ...theme,
                          rawCustomCss:
                            theme.rawCustomCss +
                            `\nh1 + p::first-letter {\n  float: left;\n  font-size: 3.1em;\n  line-height: 0.85;\n  padding-right: 0.14em;\n  font-weight: 700;\n}\n`,
                        })
                      }
                      className="px-2.5 py-1 text-[11px] rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      + Editorial Drop Cap
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onThemeChange({
                          ...theme,
                          rawCustomCss:
                            theme.rawCustomCss +
                            `\nh2 {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\nh2::before {\n  content: "§";\n  color: ${theme.accentColor};\n  font-weight: 400;\n}\n`,
                        })
                      }
                      className="px-2.5 py-1 text-[11px] rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      + Section Glyph (§)
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={theme.rawCustomCss}
                    onChange={(e) => onThemeChange({ ...theme, rawCustomCss: e.target.value })}
                    placeholder={`h1 {\n  letter-spacing: -0.04em;\n}\n\nh2 {\n  border-bottom: 2px solid ${theme.accentColor};\n}\n\nblockquote {\n  font-size: 1.05em;\n}`}
                    className="w-full p-3 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </section>
              )}
            </>
          )}

          {activeTab === 'backup' && (
            <>
              {/* 1. Text Backup */}
              <section className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Text Backup
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Export or restore your Markdown document content
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportText('md')}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export .md
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportText('txt')}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export .txt
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Text
                  </button>
                  <button
                    type="button"
                    onClick={() => textImportRef.current?.click()}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import .md / .txt
                  </button>
                  <input
                    ref={textImportRef}
                    type="file"
                    accept=".md,.markdown,.txt"
                    onChange={handleImportTextFile}
                    className="hidden"
                  />
                </div>
              </section>

              {/* 2. Theme Backup */}
              <section className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-zinc-500" />
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Theme &amp; CSS Backup
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Save or load your per-header styles and element CSS
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportThemeJson}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Theme .json
                  </button>
                  <button
                    type="button"
                    onClick={handleExportThemeCss}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    Stylesheet .css
                  </button>
                  <button
                    type="button"
                    onClick={() => themeImportRef.current?.click()}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import Theme .json
                  </button>
                  <input
                    ref={themeImportRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportThemeFile}
                    className="hidden"
                  />
                </div>
              </section>

              {/* 3. Full Backup */}
              <section className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-zinc-500" />
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Full Backup &amp; Single-HTML Snapshot
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Complete bundle (Text + Theme + Preferences) or offline OneTXT.html
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportFullJson}
                    className="px-3 py-2 text-xs font-medium rounded-lg text-white inline-flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Full Backup (.json)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportStandaloneHtml}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    Export OneTXT.html
                  </button>
                  <button
                    type="button"
                    onClick={() => fullImportRef.current?.click()}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Restore Full .json
                  </button>
                  <input
                    ref={fullImportRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFullFile}
                    className="hidden"
                  />
                </div>
              </section>

              {/* Reset Actions */}
              <section className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Reset Controls
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const fallback =
                        THEME_PRESETS.find((p) => p.id === theme.id) ?? THEME_PRESETS[0];
                      onThemeChange(structuredClone(fallback));
                      notify('ok', `Reset theme to "${fallback.name}" defaults.`);
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Current Theme
                  </button>

                  {!confirmResetDoc ? (
                    <button
                      type="button"
                      onClick={() => setConfirmResetDoc(true)}
                      className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      Restore Sample Document
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onImportDocument(DEFAULT_DOCUMENT_TITLE, DEFAULT_DOCUMENT_CONTENT);
                          setConfirmResetDoc(false);
                          notify('ok', 'Restored default sample document.');
                        }}
                        className="px-3 py-2 text-xs font-medium rounded-lg bg-rose-600 text-white cursor-pointer"
                      >
                        Confirm Restore Sample
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetDoc(false)}
                        className="px-2.5 py-2 text-xs text-zinc-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
