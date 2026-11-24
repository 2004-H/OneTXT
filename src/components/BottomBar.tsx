import { BookOpen, Code2, ListTree, SlidersHorizontal } from 'lucide-react';
import { ActiveDrawer, ViewMode } from '../types/onetxt';

interface BottomBarProps {
  viewMode: ViewMode;
  activeDrawer: ActiveDrawer;
  onToggleViewMode: () => void;
  onToggleDrawer: (drawer: 'outline' | 'settings') => void;
  accentColor: string;
}

export function BottomBar({
  viewMode,
  activeDrawer,
  onToggleViewMode,
  onToggleDrawer,
  accentColor,
}: BottomBarProps) {
  const isSource = viewMode === 'source';
  const isOutline = activeDrawer === 'outline';
  const isSettings = activeDrawer === 'settings';

  return (
    <nav
      aria-label="Document primary controls"
      className="fixed bottom-0 inset-x-0 z-40 h-14 border-t border-zinc-200/90 dark:border-zinc-800/90 bg-white/92 dark:bg-[#12151C]/92 backdrop-blur-md"
    >
      <div className="max-w-lg mx-auto h-full grid grid-cols-3">
        <button
          type="button"
          onClick={onToggleViewMode}
          aria-label={isSource ? 'Switch to Read mode' : 'Switch to Source mode'}
          aria-pressed={isSource}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          style={isSource ? { color: accentColor } : undefined}
        >
          <span className={!isSource ? 'text-zinc-600 dark:text-zinc-300' : ''}>
            {isSource ? <BookOpen className="w-[18px] h-[18px]" /> : <Code2 className="w-[18px] h-[18px]" />}
          </span>
          <span
            className={`text-[11px] leading-tight tracking-tight ${
              isSource ? 'font-semibold' : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <span className={!isSource ? 'font-semibold' : 'opacity-60'}>Read</span>
            <span className="mx-1 opacity-40">/</span>
            <span className={isSource ? 'font-semibold' : 'opacity-60'}>Source</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleDrawer('outline')}
          aria-label="Toggle Table of Contents Outline"
          aria-expanded={isOutline}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
            isOutline ? '' : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
          }`}
          style={isOutline ? { color: accentColor } : undefined}
        >
          <ListTree className="w-[18px] h-[18px]" />
          <span className={`text-[11px] leading-tight tracking-tight ${isOutline ? 'font-semibold' : ''}`}>
            Outline
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleDrawer('settings')}
          aria-label="Toggle Settings and CSS Theme Studio"
          aria-expanded={isSettings}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
            isSettings ? '' : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
          }`}
          style={isSettings ? { color: accentColor } : undefined}
        >
          <SlidersHorizontal className="w-[18px] h-[18px]" />
          <span className={`text-[11px] leading-tight tracking-tight ${isSettings ? 'font-semibold' : ''}`}>
            Settings
          </span>
        </button>
      </div>
    </nav>
  );
}
