import { DocumentTheme, EditorPreferences } from '../types/onetxt';

export interface EmbeddedOneTxtState {
  snapshotId?: string;
  title: string;
  content: string;
  theme: DocumentTheme;
  preferences: EditorPreferences;
  pinnedHeadings: string[];
}

function escapeJsonForHtmlScript(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function escapeHtmlText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function readEmbeddedOneTxtState(): EmbeddedOneTxtState | null {
  try {
    const el = document.getElementById('onetxt-embedded-state');
    if (!el || !el.textContent?.trim()) return null;
    return JSON.parse(el.textContent) as EmbeddedOneTxtState;
  } catch {
    return null;
  }
}

function injectStateIntoStandaloneHtml(
  htmlTemplate: string,
  state: EmbeddedOneTxtState
): string {
  const jsonPayload = escapeJsonForHtmlScript(state);
  const safeTitle = escapeHtmlText(`${state.title.trim() || 'OneTXT'} — OneTXT`);

  let next = htmlTemplate.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${safeTitle}</title>`
  );

  const stateRegex =
    /<script\s+id=["']onetxt-embedded-state["'][^>]*>[\s\S]*?<\/script>/i;
  const replacementScript = `<script id="onetxt-embedded-state" type="application/json">${jsonPayload}</script>`;

  if (stateRegex.test(next)) {
    next = next.replace(stateRegex, () => replacementScript);
  } else {
    next = next.replace('</body>', () => `${replacementScript}\n</body>`);
  }

  return next;
}

/**
 * Exports a complete, self-contained single-file OneTXT.html containing
 * 100% of the React + Tailwind application, extended settings, theme studio,
 * YAML sidebar, color-coded source mode, and current user state.
 */
export async function exportFullStandaloneOneTxtHtml(params: {
  title: string;
  content: string;
  theme: DocumentTheme;
  preferences: EditorPreferences;
  pinnedHeadings: string[];
}): Promise<string> {
  const state: EmbeddedOneTxtState = {
    snapshotId: `snap_${Date.now()}`,
    ...params,
  };

  // Case 1: Already running inside the single-file OneTXT.html!
  const isStandalone = Boolean(document.getElementById('onetxt-standalone-bundle'));
  if (isStandalone) {
    const clone = document.documentElement.cloneNode(true) as HTMLElement;
    const rootEl = clone.querySelector('#root');
    if (rootEl) rootEl.innerHTML = '';
    // Remove transient dark class so App syncs cleanly on boot
    clone.classList.remove('dark');
    const htmlStr = `<!doctype html>\n${clone.outerHTML}`;
    return injectStateIntoStandaloneHtml(htmlStr, state);
  }

  // Case 2: Running in Vite dev/preview server — fetch the compiled single-file template
  const resp = await fetch('/OneTXT.html', { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('Could not load standalone OneTXT.html template');
  }
  const templateHtml = await resp.text();
  return injectStateIntoStandaloneHtml(templateHtml, state);
}
