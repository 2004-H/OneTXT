import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TocItem, ViewMode } from '../types/onetxt';

interface OutlineDrawerProps {
  open: boolean;
  toc: TocItem[];
  activeHeadingId: string | null;
  viewMode: ViewMode;
  accentColor: string;
  onSelectHeading: (item: TocItem) => void;
  onClose: () => void;
}

export function OutlineDrawer({
  open,
  toc,
  activeHeadingId,
  viewMode,
  accentColor,
  onSelectHeading,
  onClose,
}: OutlineDrawerProps) {
  const [query, setQuery] = useState('');

  const filteredToc = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toc;
    return toc.filter((item) => item.text.toLowerCase().includes(q));
  }, [toc, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Table of Contents Outline"
        className="relative z-10 w-80 max-w-[88vw] h-full bg-white dark:bg-[#13161E] border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-xl"
      >
        <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Table of Contents
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              {toc.length} {toc.length === 1 ? 'heading' : 'headings'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close outline"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter headings..."
              aria-label="Filter headings"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 pb-20 onetxt-scroll">
          {filteredToc.length === 0 ? (
            <div className="px-3 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {toc.length === 0
                ? 'No Markdown headings (# H1–H6) in this document yet.'
                : 'No headings match your filter.'}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredToc.map((item) => {
                const isActive = item.id === activeHeadingId;
                const indentPx = (item.level - 1) * 14 + 10;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectHeading(item)}
                      style={{
                        paddingLeft: `${indentPx}px`,
                        color: isActive ? accentColor : undefined,
                      }}
                      className={`w-full text-left py-2 pr-2.5 min-h-[40px] rounded-lg flex items-baseline justify-between gap-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800/80 font-semibold'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span
                        className={`text-[13px] leading-snug truncate ${
                          item.level === 1 ? 'font-semibold' : item.level === 2 ? 'font-medium' : ''
                        }`}
                      >
                        {item.text}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">
                        {viewMode === 'source' ? `L${item.line}` : `H${item.level}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
