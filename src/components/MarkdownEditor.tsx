import { forwardRef, KeyboardEvent, useImperativeHandle, useMemo, useRef } from 'react';
import { DocumentTheme, EditorPreferences } from '../types/onetxt';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: DocumentTheme;
  preferences: EditorPreferences;
}

export interface MarkdownEditorHandle {
  scrollToLine: (line: number) => void;
  insertSnippet: (before: string, after?: string, placeholder?: string) => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, theme, preferences }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const gutterRef = useRef<HTMLDivElement | null>(null);

    const lineCount = useMemo(() => {
      if (!value) return 1;
      return value.split(/\r?\n/).length;
    }, [value]);

    useImperativeHandle(ref, () => ({
      scrollToLine(lineNumber: number) {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const lines = textarea.value.split('\n');
        const clampedLine = Math.max(1, Math.min(lineNumber, lines.length));
        let charPos = 0;
        for (let i = 0; i < clampedLine - 1; i++) {
          charPos += lines[i].length + 1;
        }
        textarea.focus();
        textarea.setSelectionRange(charPos, charPos + (lines[clampedLine - 1]?.length ?? 0));

        const lineHeightPx = preferences.editorFontSize * 1.65;
        const targetScroll = Math.max(0, (clampedLine - 4) * lineHeightPx);
        textarea.scrollTop = targetScroll;
        if (gutterRef.current) {
          gutterRef.current.scrollTop = targetScroll;
        }
      },
      insertSnippet(before: string, after = '', placeholder = '') {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.slice(start, end) || placeholder;
        const nextText =
          textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
        onChange(nextText);

        requestAnimationFrame(() => {
          textarea.focus();
          const selectStart = start + before.length;
          const selectEnd = selectStart + selected.length;
          textarea.setSelectionRange(selectStart, selectEnd);
        });
      },
    }));

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextValue = value.slice(0, start) + '  ' + value.slice(end);
        onChange(nextValue);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        });
      }
    };

    const handleScroll = () => {
      if (textareaRef.current && gutterRef.current) {
        gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    };

    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-8 py-6">
        <div
          className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs"
          style={{ backgroundColor: theme.surfaceBg }}
        >
          {preferences.showLineNumbers && (
            <div
              ref={gutterRef}
              aria-hidden="true"
              className="hidden sm:block select-none py-5 px-3 text-right border-r border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden tabular-nums text-zinc-400 dark:text-zinc-600"
              style={{
                fontFamily: theme.monoFont,
                fontSize: `${preferences.editorFontSize}px`,
                lineHeight: 1.65,
                minWidth: '3.25rem',
                maxHeight: 'calc(100vh - 220px)',
              }}
            >
              {Array.from({ length: lineCount }, (_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={preferences.spellCheck}
            wrap={preferences.wordWrap ? 'soft' : 'off'}
            aria-label="Markdown document source"
            placeholder="# Start writing your Markdown document..."
            className="w-full flex-1 bg-transparent p-4 sm:p-5 focus:outline-none resize-none onetxt-scroll"
            style={{
              fontFamily: theme.monoFont,
              fontSize: `${preferences.editorFontSize}px`,
              lineHeight: 1.65,
              color: theme.textColor,
              minHeight: 'calc(100vh - 220px)',
              height: 'calc(100vh - 220px)',
            }}
          />
        </div>
      </div>
    );
  }
);
