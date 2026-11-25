import {
  forwardRef,
  KeyboardEvent,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { DocumentTheme, EditorPreferences } from '../types/onetxt';
import { highlightMarkdownSource } from '../utils/syntaxHighlight';

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

    const lineCount = useMemo(() => {
      if (!value) return 1;
      return value.split(/\r?\n/).length;
    }, [value]);

    const highlightedHtml = useMemo(() => highlightMarkdownSource(value), [value]);

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

        const rect = textarea.getBoundingClientRect();
        const lineHeightPx = preferences.editorFontSize * 1.65;
        const targetY = window.scrollY + rect.top + Math.max(0, (clampedLine - 4) * lineHeightPx);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
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

    const sharedEditorStyle: React.CSSProperties = {
      fontFamily: theme.monoFont,
      fontSize: `${preferences.editorFontSize}px`,
      lineHeight: 1.65,
      letterSpacing: 'normal',
      tabSize: 2,
      whiteSpace: preferences.wordWrap ? 'pre-wrap' : 'pre',
      overflowWrap: preferences.wordWrap ? 'break-word' : 'normal',
      wordBreak: 'normal',
    };

    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-8 pt-4 pb-28">
        <div className="flex items-start bg-transparent">
          {preferences.showLineNumbers && (
            <div
              aria-hidden="true"
              className="hidden sm:block select-none py-3 pr-4 text-right tabular-nums opacity-40 shrink-0"
              style={{
                fontFamily: theme.monoFont,
                fontSize: `${preferences.editorFontSize}px`,
                lineHeight: 1.65,
                minWidth: '2.75rem',
                color: theme.mutedColor,
              }}
            >
              {Array.from({ length: lineCount }, (_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
          )}

          <div
            className={`relative flex-1 min-w-0 ${
              preferences.wordWrap ? 'overflow-hidden' : 'overflow-x-auto onetxt-scroll'
            }`}
          >
            <div className="relative min-w-full">
              <pre
                aria-hidden="true"
                className="onetxt-source-mirror m-0 py-3 px-1 sm:px-2 pointer-events-none select-none"
                style={{
                  ...sharedEditorStyle,
                  color: theme.textColor,
                  minHeight: 'calc(100dvh - 120px)',
                }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />

              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={preferences.spellCheck}
                wrap={preferences.wordWrap ? 'soft' : 'off'}
                aria-label="Markdown document source"
                placeholder="# Start writing your Markdown document..."
                className="absolute inset-0 w-full h-full bg-transparent text-transparent py-3 px-1 sm:px-2 border-0 outline-none focus:outline-none resize-none overflow-hidden selection:bg-blue-500/25"
                style={{
                  ...sharedEditorStyle,
                  caretColor: theme.textColor,
                  WebkitTextFillColor: 'transparent',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
