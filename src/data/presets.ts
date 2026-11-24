import { DocumentTheme, EditorPreferences, HeadingStyleConfig } from '../types/onetxt';

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Inherit Body Font', value: 'inherit' },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Fraunces (Editorial Serif)', value: "'Fraunces', Georgia, serif" },
  { label: 'Source Serif 4', value: "'Source Serif 4', Georgia, serif" },
  { label: 'Lora (Classic Serif)', value: "'Lora', Georgia, serif" },
  { label: 'Bricolage Grotesque', value: "'Bricolage Grotesque', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'System Sans', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: 'System Serif', value: "Georgia, 'Times New Roman', serif" },
];

export const BODY_FONT_OPTIONS: { label: string; value: string }[] = FONT_OPTIONS.filter(
  (f) => f.value !== 'inherit'
);

export const MONO_FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', ui-monospace, monospace" },
  { label: 'System Monospace', value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
];

function createHeading(overrides: Partial<HeadingStyleConfig>): HeadingStyleConfig {
  return {
    fontFamily: 'inherit',
    fontSize: '1.5rem',
    fontWeight: '700',
    lineHeight: '1.25',
    letterSpacing: '-0.02em',
    textTransform: 'none',
    fontStyle: 'normal',
    textAlign: 'left',
    color: '#18181B',
    backgroundColor: 'transparent',
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
    paddingRight: '0px',
    marginTop: '1.75em',
    marginBottom: '0.6em',
    borderWidth: '0px',
    borderSide: 'none',
    borderStyle: 'solid',
    borderColor: '#E4E4E7',
    borderRadius: '0px',
    customCss: '',
    ...overrides,
  };
}

export const THEME_PRESETS: DocumentTheme[] = [
  {
    id: 'swiss-monograph',
    name: 'Swiss Monograph',
    isDarkUI: false,
    pageBg: '#FAF9F6',
    surfaceBg: '#FFFFFF',
    textColor: '#1E1F23',
    mutedColor: '#646873',
    accentColor: '#2563EB',
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    baseFontSize: 16,
    baseLineHeight: 1.72,
    maxWidth: 760,
    contentPaddingX: 32,
    contentPaddingY: 44,
    headings: {
      h1: createHeading({
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '2.5rem',
        fontWeight: '600',
        lineHeight: '1.14',
        letterSpacing: '-0.03em',
        color: '#111215',
        marginTop: '0.4em',
        marginBottom: '0.65em',
        paddingBottom: '14px',
        borderSide: 'bottom',
        borderWidth: '1px',
        borderColor: '#E5E4DF',
      }),
      h2: createHeading({
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '1.75rem',
        fontWeight: '600',
        lineHeight: '1.22',
        letterSpacing: '-0.02em',
        color: '#18191D',
        marginTop: '2.1em',
        marginBottom: '0.55em',
        paddingBottom: '8px',
        borderSide: 'bottom',
        borderWidth: '1px',
        borderColor: '#ECEBE6',
      }),
      h3: createHeading({
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '1.28rem',
        fontWeight: '700',
        lineHeight: '1.3',
        letterSpacing: '-0.015em',
        color: '#1E1F23',
        marginTop: '1.65em',
        marginBottom: '0.45em',
      }),
      h4: createHeading({
        fontSize: '1.08rem',
        fontWeight: '600',
        letterSpacing: '-0.01em',
        color: '#2C2E35',
        marginTop: '1.4em',
        marginBottom: '0.4em',
      }),
      h5: createHeading({
        fontSize: '0.94rem',
        fontWeight: '700',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#4B505C',
        marginTop: '1.25em',
        marginBottom: '0.35em',
      }),
      h6: createHeading({
        fontSize: '0.88rem',
        fontWeight: '600',
        fontStyle: 'italic',
        letterSpacing: '0.01em',
        color: '#646873',
        marginTop: '1.1em',
        marginBottom: '0.3em',
      }),
    },
    elements: {
      paragraph: {
        fontSize: '1em',
        lineHeight: '1.74',
        color: '#1E1F23',
        marginBottom: '1.15em',
        textIndent: '0em',
        customCss: '',
      },
      blockquote: {
        color: '#3F424D',
        backgroundColor: '#F3F2EE',
        borderColor: '#DCDAD3',
        borderWidth: '1px',
        borderSide: 'all',
        borderRadius: '10px',
        padding: '16px 20px',
        marginY: '1.5em',
        fontStyle: 'italic',
        customCss: '',
      },
      inlineCode: {
        color: '#1D4ED8',
        backgroundColor: '#EFF3F9',
        borderRadius: '5px',
        paddingX: '6px',
        paddingY: '2px',
        fontSize: '0.875em',
        borderColor: '#DCE5F2',
        customCss: '',
      },
      codeBlock: {
        color: '#E5E9F0',
        backgroundColor: '#14171D',
        headerBg: '#1C2029',
        borderColor: '#262B36',
        borderRadius: '10px',
        fontSize: '0.875rem',
        lineHeight: '1.62',
        padding: '16px 18px',
        copyBtnColor: '#E5E9F0',
        copyBtnBg: '#272D3A',
        customCss: '',
      },
      link: {
        color: '#2563EB',
        underlineMode: 'always',
        underlineOffset: '3px',
        fontWeight: '500',
        customCss: '',
      },
      list: {
        markerColor: '#646873',
        itemSpacing: '0.4em',
        indent: '1.45em',
        customCss: '',
      },
      table: {
        headerBg: '#F2F1EC',
        headerColor: '#18191D',
        borderColor: '#E2E0D8',
        rowAltBg: '#F8F7F4',
        striped: true,
        cellPadding: '10px 14px',
        borderRadius: '8px',
        customCss: '',
      },
      hr: {
        color: '#E2E0D8',
        thickness: '1px',
        style: 'solid',
        marginY: '2.25em',
        width: '100%',
        customCss: '',
      },
      image: {
        borderRadius: '10px',
        maxWidth: '100%',
        shadow: 'subtle',
        customCss: '',
      },
    },
    rawCustomCss: '',
  },
  {
    id: 'obsidian-ink',
    name: 'Obsidian Ink',
    isDarkUI: true,
    pageBg: '#0D1015',
    surfaceBg: '#151922',
    textColor: '#E4E8F0',
    mutedColor: '#8B93A4',
    accentColor: '#60A5FA',
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    baseFontSize: 16,
    baseLineHeight: 1.74,
    maxWidth: 760,
    contentPaddingX: 32,
    contentPaddingY: 44,
    headings: {
      h1: createHeading({
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '2.45rem',
        fontWeight: '700',
        lineHeight: '1.15',
        letterSpacing: '-0.025em',
        color: '#F8FAFC',
        marginTop: '0.4em',
        marginBottom: '0.65em',
        paddingBottom: '14px',
        borderSide: 'bottom',
        borderWidth: '1px',
        borderColor: '#232936',
      }),
      h2: createHeading({
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '1.72rem',
        fontWeight: '600',
        lineHeight: '1.22',
        letterSpacing: '-0.02em',
        color: '#F1F5F9',
        marginTop: '2.1em',
        marginBottom: '0.55em',
        paddingBottom: '8px',
        borderSide: 'bottom',
        borderWidth: '1px',
        borderColor: '#1E2430',
      }),
      h3: createHeading({
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#E2E8F0',
        marginTop: '1.65em',
        marginBottom: '0.45em',
      }),
      h4: createHeading({
        fontSize: '1.08rem',
        fontWeight: '600',
        color: '#CBD5E1',
        marginTop: '1.4em',
        marginBottom: '0.4em',
      }),
      h5: createHeading({
        fontSize: '0.92rem',
        fontWeight: '600',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: '#93C5FD',
        marginTop: '1.25em',
        marginBottom: '0.35em',
      }),
      h6: createHeading({
        fontSize: '0.88rem',
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#8B93A4',
        marginTop: '1.1em',
        marginBottom: '0.3em',
      }),
    },
    elements: {
      paragraph: {
        fontSize: '1em',
        lineHeight: '1.76',
        color: '#D8DEE9',
        marginBottom: '1.15em',
        textIndent: '0em',
        customCss: '',
      },
      blockquote: {
        color: '#B8C2D4',
        backgroundColor: '#141923',
        borderColor: '#252D3D',
        borderWidth: '1px',
        borderSide: 'all',
        borderRadius: '10px',
        padding: '16px 20px',
        marginY: '1.5em',
        fontStyle: 'italic',
        customCss: '',
      },
      inlineCode: {
        color: '#93C5FD',
        backgroundColor: '#1B2230',
        borderRadius: '5px',
        paddingX: '6px',
        paddingY: '2px',
        fontSize: '0.875em',
        borderColor: '#293347',
        customCss: '',
      },
      codeBlock: {
        color: '#E2E8F0',
        backgroundColor: '#090C10',
        headerBg: '#11161F',
        borderColor: '#232936',
        borderRadius: '10px',
        fontSize: '0.875rem',
        lineHeight: '1.62',
        padding: '16px 18px',
        copyBtnColor: '#E2E8F0',
        copyBtnBg: '#1D2432',
        customCss: '',
      },
      link: {
        color: '#60A5FA',
        underlineMode: 'hover',
        underlineOffset: '3px',
        fontWeight: '500',
        customCss: '',
      },
      list: {
        markerColor: '#64748B',
        itemSpacing: '0.4em',
        indent: '1.45em',
        customCss: '',
      },
      table: {
        headerBg: '#151A24',
        headerColor: '#F1F5F9',
        borderColor: '#242B3A',
        rowAltBg: '#11151D',
        striped: true,
        cellPadding: '10px 14px',
        borderRadius: '8px',
        customCss: '',
      },
      hr: {
        color: '#242B3A',
        thickness: '1px',
        style: 'solid',
        marginY: '2.25em',
        width: '100%',
        customCss: '',
      },
      image: {
        borderRadius: '10px',
        maxWidth: '100%',
        shadow: 'medium',
        customCss: '',
      },
    },
    rawCustomCss: '',
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Manuscript',
    isDarkUI: false,
    pageBg: '#F7F4EC',
    surfaceBg: '#FDFBF7',
    textColor: '#221E1A',
    mutedColor: '#736B62',
    accentColor: '#9A3412',
    bodyFont: "'Source Serif 4', Georgia, serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    baseFontSize: 17,
    baseLineHeight: 1.78,
    maxWidth: 720,
    contentPaddingX: 32,
    contentPaddingY: 48,
    headings: {
      h1: createHeading({
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '2.65rem',
        fontWeight: '600',
        lineHeight: '1.12',
        letterSpacing: '-0.025em',
        textAlign: 'center',
        color: '#191512',
        marginTop: '0.5em',
        marginBottom: '0.8em',
        paddingBottom: '16px',
        borderSide: 'bottom',
        borderWidth: '2px',
        borderStyle: 'double',
        borderColor: '#D8D0C3',
      }),
      h2: createHeading({
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '1.78rem',
        fontWeight: '600',
        color: '#221E1A',
        marginTop: '2.2em',
        marginBottom: '0.6em',
      }),
      h3: createHeading({
        fontFamily: "'Lora', Georgia, serif",
        fontSize: '1.32rem',
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#3A322B',
        marginTop: '1.65em',
        marginBottom: '0.45em',
      }),
      h4: createHeading({
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '1rem',
        fontWeight: '700',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        color: '#5C5248',
        marginTop: '1.4em',
        marginBottom: '0.35em',
      }),
      h5: createHeading({
        fontSize: '0.96rem',
        fontWeight: '600',
        color: '#6B6056',
        marginTop: '1.2em',
        marginBottom: '0.3em',
      }),
      h6: createHeading({
        fontSize: '0.9rem',
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#736B62',
        marginTop: '1.1em',
        marginBottom: '0.3em',
      }),
    },
    elements: {
      paragraph: {
        fontSize: '1em',
        lineHeight: '1.78',
        color: '#221E1A',
        marginBottom: '1.15em',
        textIndent: '0em',
        customCss: '',
      },
      blockquote: {
        color: '#463E36',
        backgroundColor: '#EFEAE0',
        borderColor: '#DDD5C7',
        borderWidth: '1px',
        borderSide: 'all',
        borderRadius: '8px',
        padding: '18px 22px',
        marginY: '1.6em',
        fontStyle: 'italic',
        customCss: '',
      },
      inlineCode: {
        color: '#9A3412',
        backgroundColor: '#EFE8DC',
        borderRadius: '4px',
        paddingX: '6px',
        paddingY: '2px',
        fontSize: '0.84em',
        borderColor: '#E1D7C6',
        customCss: '',
      },
      codeBlock: {
        color: '#F3EFE6',
        backgroundColor: '#231E1A',
        headerBg: '#2E2823',
        borderColor: '#3E362F',
        borderRadius: '8px',
        fontSize: '0.86rem',
        lineHeight: '1.6',
        padding: '16px 18px',
        copyBtnColor: '#F3EFE6',
        copyBtnBg: '#3D352E',
        customCss: '',
      },
      link: {
        color: '#9A3412',
        underlineMode: 'always',
        underlineOffset: '3px',
        fontWeight: '500',
        customCss: '',
      },
      list: {
        markerColor: '#736B62',
        itemSpacing: '0.45em',
        indent: '1.5em',
        customCss: '',
      },
      table: {
        headerBg: '#ECE6DA',
        headerColor: '#191512',
        borderColor: '#DCD4C6',
        rowAltBg: '#F4F0E7',
        striped: true,
        cellPadding: '10px 14px',
        borderRadius: '6px',
        customCss: '',
      },
      hr: {
        color: '#D5CCB9',
        thickness: '1px',
        style: 'solid',
        marginY: '2.5em',
        width: '45%',
        customCss: 'margin-left: auto; margin-right: auto;',
      },
      image: {
        borderRadius: '6px',
        maxWidth: '100%',
        shadow: 'subtle',
        customCss: '',
      },
    },
    rawCustomCss: '',
  },
  {
    id: 'archival-blueprint',
    name: 'Technical Spec',
    isDarkUI: false,
    pageBg: '#F8FAFC',
    surfaceBg: '#FFFFFF',
    textColor: '#0F172A',
    mutedColor: '#475569',
    accentColor: '#0284C7',
    bodyFont: "'DM Sans', sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    baseFontSize: 15,
    baseLineHeight: 1.68,
    maxWidth: 840,
    contentPaddingX: 32,
    contentPaddingY: 40,
    headings: {
      h1: createHeading({
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '2.2rem',
        fontWeight: '700',
        letterSpacing: '-0.03em',
        color: '#0F172A',
        backgroundColor: '#F1F5F9',
        paddingTop: '14px',
        paddingBottom: '14px',
        paddingLeft: '18px',
        paddingRight: '18px',
        borderSide: 'all',
        borderWidth: '1px',
        borderColor: '#E2E8F0',
        borderRadius: '8px',
        marginTop: '0.4em',
        marginBottom: '0.9em',
      }),
      h2: createHeading({
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#0F172A',
        paddingBottom: '6px',
        borderSide: 'bottom',
        borderWidth: '2px',
        borderColor: '#0284C7',
        marginTop: '2em',
        marginBottom: '0.6em',
      }),
      h3: createHeading({
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '1.12rem',
        fontWeight: '600',
        color: '#0369A1',
        marginTop: '1.6em',
        marginBottom: '0.45em',
      }),
      h4: createHeading({
        fontSize: '1rem',
        fontWeight: '700',
        color: '#1E293B',
        marginTop: '1.3em',
        marginBottom: '0.35em',
      }),
      h5: createHeading({
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#475569',
        marginTop: '1.2em',
        marginBottom: '0.3em',
      }),
      h6: createHeading({
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#64748B',
        marginTop: '1em',
        marginBottom: '0.25em',
      }),
    },
    elements: {
      paragraph: {
        fontSize: '1em',
        lineHeight: '1.68',
        color: '#1E293B',
        marginBottom: '1.05em',
        textIndent: '0em',
        customCss: '',
      },
      blockquote: {
        color: '#334155',
        backgroundColor: '#F1F5F9',
        borderColor: '#CBD5E1',
        borderWidth: '1px',
        borderSide: 'all',
        borderRadius: '8px',
        padding: '14px 18px',
        marginY: '1.4em',
        fontStyle: 'normal',
        customCss: '',
      },
      inlineCode: {
        color: '#0369A1',
        backgroundColor: '#E0F2FE',
        borderRadius: '4px',
        paddingX: '5px',
        paddingY: '2px',
        fontSize: '0.875em',
        borderColor: '#BAE6FD',
        customCss: '',
      },
      codeBlock: {
        color: '#E2E8F0',
        backgroundColor: '#0F172A',
        headerBg: '#1E293B',
        borderColor: '#334155',
        borderRadius: '8px',
        fontSize: '0.85rem',
        lineHeight: '1.58',
        padding: '14px 16px',
        copyBtnColor: '#F8FAFC',
        copyBtnBg: '#334155',
        customCss: '',
      },
      link: {
        color: '#0284C7',
        underlineMode: 'hover',
        underlineOffset: '3px',
        fontWeight: '500',
        customCss: '',
      },
      list: {
        markerColor: '#0284C7',
        itemSpacing: '0.35em',
        indent: '1.4em',
        customCss: '',
      },
      table: {
        headerBg: '#F1F5F9',
        headerColor: '#0F172A',
        borderColor: '#CBD5E1',
        rowAltBg: '#F8FAFC',
        striped: true,
        cellPadding: '9px 12px',
        borderRadius: '6px',
        customCss: '',
      },
      hr: {
        color: '#CBD5E1',
        thickness: '1px',
        style: 'dashed',
        marginY: '2em',
        width: '100%',
        customCss: '',
      },
      image: {
        borderRadius: '8px',
        maxWidth: '100%',
        shadow: 'subtle',
        customCss: '',
      },
    },
    rawCustomCss: '',
  },
  {
    id: 'botanical-study',
    name: 'Forest Study',
    isDarkUI: false,
    pageBg: '#F4F6F3',
    surfaceBg: '#FBFDFB',
    textColor: '#1A241E',
    mutedColor: '#5B6B60',
    accentColor: '#1B5E3F',
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    baseFontSize: 16,
    baseLineHeight: 1.72,
    maxWidth: 760,
    contentPaddingX: 32,
    contentPaddingY: 44,
    headings: {
      h1: createHeading({
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '2.45rem',
        fontWeight: '600',
        color: '#12291E',
        marginTop: '0.4em',
        marginBottom: '0.65em',
        paddingBottom: '12px',
        borderSide: 'bottom',
        borderWidth: '1px',
        borderColor: '#D6E0D8',
      }),
      h2: createHeading({
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '1.7rem',
        fontWeight: '600',
        color: '#1B4332',
        marginTop: '2em',
        marginBottom: '0.5em',
      }),
      h3: createHeading({
        fontSize: '1.24rem',
        fontWeight: '700',
        color: '#2D6A4F',
        marginTop: '1.6em',
        marginBottom: '0.4em',
      }),
      h4: createHeading({
        fontSize: '1.05rem',
        fontWeight: '600',
        color: '#344E41',
        marginTop: '1.35em',
        marginBottom: '0.35em',
      }),
      h5: createHeading({
        fontSize: '0.9rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#52796F',
        marginTop: '1.2em',
        marginBottom: '0.3em',
      }),
      h6: createHeading({
        fontSize: '0.86rem',
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#5B6B60',
        marginTop: '1em',
        marginBottom: '0.3em',
      }),
    },
    elements: {
      paragraph: {
        fontSize: '1em',
        lineHeight: '1.74',
        color: '#1A241E',
        marginBottom: '1.15em',
        textIndent: '0em',
        customCss: '',
      },
      blockquote: {
        color: '#2C3E33',
        backgroundColor: '#E9EFEA',
        borderColor: '#C8D6CB',
        borderWidth: '1px',
        borderSide: 'all',
        borderRadius: '10px',
        padding: '16px 20px',
        marginY: '1.5em',
        fontStyle: 'italic',
        customCss: '',
      },
      inlineCode: {
        color: '#1B5E3F',
        backgroundColor: '#E6EFE9',
        borderRadius: '5px',
        paddingX: '6px',
        paddingY: '2px',
        fontSize: '0.875em',
        borderColor: '#CFE0D4',
        customCss: '',
      },
      codeBlock: {
        color: '#E6EFE9',
        backgroundColor: '#131D18',
        headerBg: '#1B2821',
        borderColor: '#283A30',
        borderRadius: '10px',
        fontSize: '0.875rem',
        lineHeight: '1.6',
        padding: '16px 18px',
        copyBtnColor: '#E6EFE9',
        copyBtnBg: '#27382F',
        customCss: '',
      },
      link: {
        color: '#1B5E3F',
        underlineMode: 'always',
        underlineOffset: '3px',
        fontWeight: '500',
        customCss: '',
      },
      list: {
        markerColor: '#407A5B',
        itemSpacing: '0.4em',
        indent: '1.45em',
        customCss: '',
      },
      table: {
        headerBg: '#E7EEE9',
        headerColor: '#12291E',
        borderColor: '#D1DDD4',
        rowAltBg: '#EFF4F0',
        striped: true,
        cellPadding: '10px 14px',
        borderRadius: '8px',
        customCss: '',
      },
      hr: {
        color: '#CEDAD1',
        thickness: '1px',
        style: 'solid',
        marginY: '2.25em',
        width: '100%',
        customCss: '',
      },
      image: {
        borderRadius: '10px',
        maxWidth: '100%',
        shadow: 'subtle',
        customCss: '',
      },
    },
    rawCustomCss: '',
  },
];

export const DEFAULT_PREFERENCES: EditorPreferences = {
  showLineNumbers: true,
  editorFontSize: 14,
  spellCheck: true,
  wordWrap: true,
};

export const DEFAULT_DOCUMENT_TITLE = 'OneTXT Field Guide';

export const DEFAULT_DOCUMENT_CONTENT = `# OneTXT Long-Form Document Studio

Welcome to **OneTXT** — a portable, single-document Markdown workspace built for long-form writing, technical specifications, personal wikis, and structured reading. Everything you write is saved automatically in your browser, and you can export your text, CSS theme, or a complete self-contained \`OneTXT.html\` file anytime.

> Good typography is invisible until it breaks; great document tooling lets you shape every heading level to match the structure of your thought.

---

## Navigation & Core Controls

Use the three anchored controls along the bottom bar to move effortlessly across long documents:

1. **Source / Read** — Flip instantaneously between rendered typography and raw Markdown editing.
2. **Outline** — Inspect the hierarchical table of contents (\`H1\` through \`H6\`) and jump directly to any section.
3. **Settings** — Customize per-heading CSS rules, markdown block styles, theme presets, and portable backups.

### Quick Checklist for New Documents

- [x] Write or paste long-form Markdown in Source Mode
- [x] Open Outline to verify heading hierarchy across sections
- [ ] Style \`H1\`–\`H6\`, code blocks, and quotes in Settings → Markdown CSS
- [ ] Export a Full Backup or standalone \`OneTXT.html\` snapshot

---

## Code Blocks with Single-Tap Copy

Every fenced code block includes a dedicated **Copy** button in the top-right corner. Tap or click once to copy the block straight to your clipboard.

\`\`\`typescript
interface DocumentSection {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  heading: string;
  wordCount: number;
}

export function buildOutlineIndex(markdown: string): DocumentSection[] {
  const lines = markdown.split('\\n');
  return lines
    .map((line, index) => {
      const match = /^(#{1,6})\\s+(.+)$/.exec(line.trim());
      if (!match) return null;
      return {
        id: \`section-\${index}\`,
        level: match[1].length as DocumentSection['level'],
        heading: match[2].trim(),
        wordCount: 0,
      };
    })
    .filter((item): item is DocumentSection => item !== null);
}
\`\`\`

### Styling Headers with Custom CSS

In **Settings → Markdown CSS**, select any header level (\`H1\` through \`H6\`) to configure its font family, size, weight, letter spacing, color, background, padding, margins, borders, or raw CSS rules.

\`\`\`css
/* Example custom CSS you can paste into Settings -> Raw CSS */
h2 {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.08), transparent);
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
}

blockquote p:last-child {
  margin-bottom: 0;
}
\`\`\`

#### Level 4 Heading: Structured Reference Tables

Tables support clean alignment, optional zebra striping, and customizable borders:

| Element | Default Shortcut / Syntax | Customizable Properties |
| :--- | :--- | :--- |
| Headings \`H1–H6\` | \`#\` through \`######\` | Font, Size, Color, Background, Borders, Custom CSS |
| Inline Code | Backticks \`\\\`code\\\`\` | Text Color, Surface Fill, Radius, Padding |
| Code Block | Triple backticks \`\\\`\\\`\\\`\` | Palette, Header Bar, Copy Button, Line Height |
| Blockquote | Leading \`>\` | Italic Style, Border Side, Padding, Background |
| Hyperlinks | \`[label](url)\` | Color, Underline Mode, Offset, Weight |

##### Level 5 Heading: Shell & Backup Workflows

You can export three distinct backup tiers from **Settings → Backup & Restore**:

\`\`\`bash
# Text Backup (.md / .txt)   -> Portable plain Markdown content
# Theme Backup (.json / .css) -> Shareable heading & element styles
# Full Backup (.json / .html) -> Complete document + theme + standalone OneTXT.html
\`\`\`

###### Level 6 Heading: Archival Notes

Even deeply nested \`H6\` headings appear accurately in your Outline drawer and respond to independent CSS rules, making it practical to maintain book-length manuals, architectural decision records, and research journals inside a single document.
`;
