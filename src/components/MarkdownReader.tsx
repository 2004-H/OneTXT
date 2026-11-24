import { MouseEvent, useMemo, useRef } from 'react';
import { DocumentTheme } from '../types/onetxt';
import { copyToClipboard } from '../utils/clipboard';
import { generateThemeCss } from '../utils/cssGenerator';

interface MarkdownReaderProps {
  html: string;
  theme: DocumentTheme;
  onSwitchToSource: () => void;
}

const CHECK_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const COPY_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

export function MarkdownReader({ html, theme, onSwitchToSource }: MarkdownReaderProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  const generatedCss = useMemo(() => generateThemeCss(theme), [theme]);

  const handleProseClick = async (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const copyBtn = target.closest('[data-copy-code="true"]') as HTMLButtonElement | null;
    if (!copyBtn) return;

    const codeWrap = copyBtn.closest('.onetxt-code-wrap');
    const codeEl = codeWrap?.querySelector('pre code');
    const codeText = codeEl?.textContent ?? '';

    const ok = await copyToClipboard(codeText);
    if (!ok) return;

    const existingTimer = copyBtn.dataset.timerId;
    if (existingTimer) {
      window.clearTimeout(Number(existingTimer));
    }

    copyBtn.dataset.copied = 'true';
    copyBtn.innerHTML = `${CHECK_ICON_SVG}<span>Copied</span>`;

    const timerId = window.setTimeout(() => {
      copyBtn.dataset.copied = 'false';
      copyBtn.innerHTML = `${COPY_ICON_SVG}<span>Copy</span>`;
    }, 1800);

    copyBtn.dataset.timerId = String(timerId);
  };

  const isEmpty = !html.trim();

  return (
    <>
      <style id="onetxt-dynamic-theme">{generatedCss}</style>
      <div
        style={{
          padding: `${theme.contentPaddingY}px ${theme.contentPaddingX}px`,
        }}
      >
        {isEmpty ? (
          <div
            className="mx-auto text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl"
            style={{ maxWidth: `${theme.maxWidth}px` }}
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Your OneTXT document is currently empty.
            </p>
            <button
              type="button"
              onClick={onSwitchToSource}
              className="px-4 py-2 text-xs font-medium rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: theme.accentColor }}
            >
              Open Source Mode to Write
            </button>
          </div>
        ) : (
          <article
            ref={containerRef}
            onClick={handleProseClick}
            className="onetxt-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </>
  );
}
