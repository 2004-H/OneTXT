import { BookOpen, Code2, ListTree, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ActiveDrawer, ViewMode } from '../types/onetxt';

interface BottomBarProps {
  viewMode: ViewMode;
  activeDrawer: ActiveDrawer;
  onToggleViewMode: () => void;
  onToggleDrawer: (drawer: 'outline' | 'settings') => void;
  accentColor: string;
  isDarkUI: boolean;
}

export function BottomBar({
  viewMode,
  activeDrawer,
  onToggleViewMode,
  onToggleDrawer,
  accentColor,
  isDarkUI,
}: BottomBarProps) {
  const [modeLabelVisible, setModeLabelVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleModeClick = () => {
    onToggleViewMode();
    setModeLabelVisible(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setModeLabelVisible(false);
    }, 2000);
  };

  const isSource = viewMode === 'source';
  const isOutline = activeDrawer === 'outline';
  const isSettings = activeDrawer === 'settings';

  const showModeText = modeLabelVisible && !isOutline && !isSettings;
  const showOutlineText = isOutline;
  const showSettingsText = isSettings;

  const activePillBg = isDarkUI
    ? 'rgba(255, 255, 255, 0.14)'
    : 'rgba(15, 23, 42, 0.08)';

  return (
    <nav
      aria-label="Document primary controls"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div
        style={{
          boxShadow: isDarkUI
            ? '0 12px 36px -6px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.14)'
            : '0 12px 34px -6px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        }}
        className={`h-[50px] px-1.5 rounded-full inline-flex items-center justify-center gap-1 border backdrop-blur-2xl backdrop-saturate-150 transition-all duration-200 ${
          isDarkUI
            ? 'bg-zinc-900/55 border-white/15 text-zinc-300'
            : 'bg-white/62 border-white/75 ring-1 ring-black/6 text-zinc-700'
        }`}
      >
        <button
          type="button"
          onClick={handleModeClick}
          aria-label={isSource ? 'Switch to Read mode' : 'Switch to Source mode'}
          aria-pressed={isSource}
          style={
            showModeText || isSource
              ? {
                  color: isSource ? accentColor : undefined,
                  backgroundColor: showModeText ? activePillBg : undefined,
                }
              : undefined
          }
          className={`h-[40px] min-w-[44px] rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            showModeText ? 'px-3.5' : 'px-3'
          }`}
        >
          {isSource ? (
            <BookOpen className="w-[17px] h-[17px] shrink-0" />
          ) : (
            <Code2 className="w-[17px] h-[17px] shrink-0" />
          )}
          {showModeText && (
            <span className="text-[11px] tracking-tight">
              {isSource ? 'Source' : 'Read'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setModeLabelVisible(false);
            onToggleDrawer('outline');
          }}
          aria-label="Toggle Table of Contents Outline"
          aria-expanded={isOutline}
          style={
            isOutline
              ? { color: accentColor, backgroundColor: activePillBg }
              : undefined
          }
          className={`h-[40px] min-w-[44px] rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            showOutlineText ? 'px-3.5' : 'px-3'
          }`}
        >
          <ListTree className="w-[17px] h-[17px] shrink-0" />
          {showOutlineText && <span className="text-[11px] tracking-tight">Outline</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            setModeLabelVisible(false);
            onToggleDrawer('settings');
          }}
          aria-label="Toggle Settings and CSS Theme Studio"
          aria-expanded={isSettings}
          style={
            isSettings
              ? { color: accentColor, backgroundColor: activePillBg }
              : undefined
          }
          className={`h-[40px] min-w-[44px] rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            showSettingsText ? 'px-3.5' : 'px-3'
          }`}
        >
          <SlidersHorizontal className="w-[17px] h-[17px] shrink-0" />
          {showSettingsText && <span className="text-[11px] tracking-tight">Settings</span>}
        </button>
      </div>
    </nav>
  );
}
