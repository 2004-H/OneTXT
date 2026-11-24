import { DocumentStats, ViewMode } from '../types/onetxt';

interface DocumentHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  stats: DocumentStats;
  viewMode: ViewMode;
  headingCount: number;
  lastSavedText: string;
  onInsertSnippet: (before: string, after?: string, placeholder?: string) => void;
}

const SNIPPETS: { label: string; before: string; after?: string; placeholder?: string }[] = [
  { label: 'H1', before: '# ', placeholder: 'Heading 1' },
  { label: 'H2', before: '## ', placeholder: 'Heading 2' },
  { label: 'H3', before: '### ', placeholder: 'Heading 3' },
  { label: 'Bold', before: '**', after: '**', placeholder: 'bold text' },
  { label: 'Italic', before: '*', after: '*', placeholder: 'italic text' },
  { label: 'Inline Code', before: '`', after: '`', placeholder: 'code' },
  { label: 'Code Block', before: '```typescript\n', after: '\n```', placeholder: '// code here' },
  { label: 'Quote', before: '> ', placeholder: 'Quoted text' },
  { label: 'Link', before: '[', after: '](https://example.com)', placeholder: 'link text' },
  { label: 'Table', before: '| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n', placeholder: '' },
];

export function DocumentHeader({
  title,
  onTitleChange,
  stats,
  viewMode,
  headingCount,
  lastSavedText,
  onInsertSnippet,
}: DocumentHeaderProps) {
  return (
    <header className="border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div className="flex items-baseline gap-3 min-w-0 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Document"
            aria-label="Document title"
            className="w-full max-w-md bg-transparent text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 rounded px-1 -ml-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0">
          <span>{stats.words.toLocaleString()} words</span>
          <span aria-hidden="true">·</span>
          <span>{stats.readingMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>{headingCount} headings</span>
          <span aria-hidden="true">·</span>
          <span>{lastSavedText}</span>
        </div>
      </div>

      {viewMode === 'source' && (
        <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2 flex items-center gap-1.5 overflow-x-auto onetxt-scroll">
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mr-1 whitespace-nowrap shrink-0">
              Insert:
            </span>
            {SNIPPETS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onInsertSnippet(s.before, s.after, s.placeholder)}
                className="px-2.5 py-1.5 min-h-[32px] text-xs font-medium rounded-md border border-zinc-200/90 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
