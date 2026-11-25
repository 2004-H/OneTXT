import { ChevronDown, ChevronRight, Pin, PinOff, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { DocumentStats, TocItem, ViewMode } from '../types/onetxt';
import { YamlProperty } from '../utils/yamlFrontmatter';

interface OutlineDrawerProps {
  open: boolean;
  toc: TocItem[];
  properties: YamlProperty[];
  stats: DocumentStats;
  activeHeadingId: string | null;
  viewMode: ViewMode;
  accentColor: string;
  pinnedHeadings: string[];
  onTogglePinHeading: (pinKey: string) => void;
  onSelectHeading: (item: TocItem) => void;
  onUpsertProperty: (key: string, value: string) => void;
  onRemoveProperty: (key: string) => void;
  onClose: () => void;
}

export function makeHeadingPinKey(item: TocItem): string {
  return `${item.level}:${item.text}`;
}

export function OutlineDrawer({
  open,
  toc,
  properties,
  stats,
  activeHeadingId,
  viewMode,
  accentColor,
  pinnedHeadings,
  onTogglePinHeading,
  onSelectHeading,
  onUpsertProperty,
  onRemoveProperty,
  onClose,
}: OutlineDrawerProps) {
  const [query, setQuery] = useState('');
  const [propsExpanded, setPropsExpanded] = useState(true);
  const [addingProp, setAddingProp] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const filteredToc = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toc;
    return toc.filter((item) => item.text.toLowerCase().includes(q));
  }, [toc, query]);

  const pinnedItems = useMemo(() => {
    if (pinnedHeadings.length === 0) return [];
    const pinnedSet = new Set(pinnedHeadings);
    const matched = filteredToc.filter((item) => pinnedSet.has(makeHeadingPinKey(item)));
    return matched.sort(
      (a, b) =>
        pinnedHeadings.indexOf(makeHeadingPinKey(a)) -
        pinnedHeadings.indexOf(makeHeadingPinKey(b))
    );
  }, [filteredToc, pinnedHeadings]);

  if (!open) return null;

  const handleAddPropertySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    onUpsertProperty(newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setAddingProp(false);
  };

  const renderRow = (item: TocItem, isPinnedSection: boolean) => {
    const pinKey = makeHeadingPinKey(item);
    const isPinned = pinnedHeadings.includes(pinKey);
    const isActive = item.id === activeHeadingId;
    const indentPx = isPinnedSection ? 8 : (item.level - 1) * 12 + 8;

    return (
      <li
        key={`${isPinnedSection ? 'pin-' : 'toc-'}${item.id}`}
        className={`group flex items-center gap-1 rounded-lg transition-colors ${
          isActive
            ? 'bg-zinc-100 dark:bg-zinc-800/80'
            : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectHeading(item)}
          style={{
            paddingLeft: `${indentPx}px`,
            color: isActive ? accentColor : undefined,
          }}
          className={`flex-1 min-w-0 text-left py-2 pr-1 min-h-[36px] flex items-baseline justify-between gap-2 cursor-pointer ${
            isActive ? 'font-semibold' : 'text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <span
            className={`text-[10px] leading-snug truncate ${
              item.level === 1 ? 'font-semibold' : item.level === 2 ? 'font-medium' : ''
            }`}
          >
            {item.text}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">
            {viewMode === 'source' ? `L${item.line}` : `H${item.level}`}
          </span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePinHeading(pinKey);
          }}
          aria-label={isPinned ? `Unpin ${item.text}` : `Pin ${item.text} to top`}
          title={isPinned ? 'Unpin from top' : 'Pin to top'}
          style={isPinned ? { color: accentColor } : undefined}
          className={`min-w-[32px] min-h-[32px] mr-1 flex items-center justify-center rounded-md transition-opacity cursor-pointer ${
            isPinned
              ? 'opacity-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70'
              : 'opacity-45 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100'
          }`}
        >
          {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Document Outline and Properties"
        className="relative z-10 w-80 max-w-[88vw] h-full bg-white dark:bg-[#101318] border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-xl"
      >
        <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Outline &amp; Info
            </h2>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
              {toc.length} {toc.length === 1 ? 'heading' : 'headings'}
              {properties.length > 0 ? ` · ${properties.length} properties` : ''}
              {pinnedItems.length > 0 ? ` · ${pinnedItems.length} pinned` : ''}
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

        <div className="flex-1 overflow-y-auto pb-20 onetxt-scroll">
          {/* YAML Properties & Document Info (hidden from main reader viewer) */}
          <section className="border-b border-zinc-200/80 dark:border-zinc-800/80 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPropsExpanded((p) => !p)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                {propsExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>Properties</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPropsExpanded(true);
                  setAddingProp((v) => !v);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {propsExpanded && (
              <div className="mt-2 space-y-1.5">
                {properties.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    No YAML properties yet. Add one above or write <code className="font-mono">---</code> frontmatter in Source mode.
                  </p>
                ) : (
                  <dl className="space-y-1">
                    {properties.map((prop) => (
                      <div
                        key={prop.key}
                        className="group flex items-baseline justify-between gap-2 py-0.5 text-[10px]"
                      >
                        <dt className="font-mono text-zinc-400 dark:text-zinc-500 shrink-0 max-w-[40%] truncate">
                          {prop.key}
                        </dt>
                        <div className="flex items-center gap-1 min-w-0 justify-end">
                          <dd className="text-zinc-800 dark:text-zinc-200 text-right break-words">
                            {prop.values && prop.values.length > 0
                              ? prop.values.join(' · ')
                              : prop.value || '—'}
                          </dd>
                          <button
                            type="button"
                            onClick={() => onRemoveProperty(prop.key)}
                            aria-label={`Remove ${prop.key}`}
                            className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-rose-500 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </dl>
                )}

                {addingProp && (
                  <form
                    onSubmit={handleAddPropertySubmit}
                    className="pt-1.5 mt-1.5 border-t border-zinc-200/70 dark:border-zinc-800/70 space-y-1.5"
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="key (e.g. tag)"
                        className="px-2 py-1 text-[10px] font-mono rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="value"
                        className="px-2 py-1 text-[10px] rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAddingProp(false)}
                        className="px-2 py-1 text-[10px] text-zinc-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-[10px] font-semibold rounded text-white cursor-pointer"
                        style={{ backgroundColor: accentColor }}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-1.5 mt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                  <span>{stats.words.toLocaleString()} words</span>
                  <span aria-hidden="true">·</span>
                  <span>{stats.lines.toLocaleString()} lines</span>
                  <span aria-hidden="true">·</span>
                  <span>{stats.characters.toLocaleString()} chars</span>
                  <span aria-hidden="true">·</span>
                  <span>{stats.readingMinutes} min</span>
                </div>
              </div>
            )}
          </section>

          {/* Filter Headings */}
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

          <div className="p-2.5">
            {filteredToc.length === 0 ? (
              <div className="px-3 py-8 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
                {toc.length === 0
                  ? 'No Markdown headings (# H1–H6) in this document yet.'
                  : 'No headings match your filter.'}
              </div>
            ) : (
              <div className="space-y-3">
                {pinnedItems.length > 0 && (
                  <div>
                    <div className="px-2 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      Pinned
                    </div>
                    <ul className="space-y-0.5">
                      {pinnedItems.map((item) => renderRow(item, true))}
                    </ul>
                    <div className="my-2 border-b border-zinc-200/80 dark:border-zinc-800/80" />
                  </div>
                )}

                <ul className="space-y-0.5">
                  {filteredToc.map((item) => renderRow(item, false))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
