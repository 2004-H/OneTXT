export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type BorderSide = 'none' | 'bottom' | 'left' | 'top' | 'all';
export type BorderStyleType = 'solid' | 'dashed' | 'dotted' | 'double';

export interface HeadingStyleConfig {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
  borderWidth: string;
  borderSide: BorderSide;
  borderStyle: BorderStyleType;
  borderColor: string;
  borderRadius: string;
  customCss: string;
}

export interface ParagraphStyleConfig {
  fontSize: string;
  lineHeight: string;
  color: string;
  marginBottom: string;
  textIndent: string;
  customCss: string;
}

export interface BlockquoteStyleConfig {
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: string;
  borderSide: BorderSide;
  borderRadius: string;
  padding: string;
  marginY: string;
  fontStyle: 'normal' | 'italic';
  customCss: string;
}

export interface InlineCodeStyleConfig {
  color: string;
  backgroundColor: string;
  borderRadius: string;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  borderColor: string;
  customCss: string;
}

export interface CodeBlockStyleConfig {
  color: string;
  backgroundColor: string;
  headerBg: string;
  borderColor: string;
  borderRadius: string;
  fontSize: string;
  lineHeight: string;
  padding: string;
  copyBtnColor: string;
  copyBtnBg: string;
  customCss: string;
}

export interface LinkStyleConfig {
  color: string;
  underlineMode: 'always' | 'hover' | 'none';
  underlineOffset: string;
  fontWeight: string;
  customCss: string;
}

export interface ListStyleConfig {
  markerColor: string;
  itemSpacing: string;
  indent: string;
  customCss: string;
}

export interface TableStyleConfig {
  headerBg: string;
  headerColor: string;
  borderColor: string;
  rowAltBg: string;
  striped: boolean;
  cellPadding: string;
  borderRadius: string;
  customCss: string;
}

export interface HrStyleConfig {
  color: string;
  thickness: string;
  style: 'solid' | 'dashed' | 'dotted';
  marginY: string;
  width: string;
  customCss: string;
}

export interface ImageStyleConfig {
  borderRadius: string;
  maxWidth: string;
  shadow: 'none' | 'subtle' | 'medium';
  customCss: string;
}

export interface MarkdownElementStyles {
  paragraph: ParagraphStyleConfig;
  blockquote: BlockquoteStyleConfig;
  inlineCode: InlineCodeStyleConfig;
  codeBlock: CodeBlockStyleConfig;
  link: LinkStyleConfig;
  list: ListStyleConfig;
  table: TableStyleConfig;
  hr: HrStyleConfig;
  image: ImageStyleConfig;
}

export interface DocumentTheme {
  id: string;
  name: string;
  isDarkUI: boolean;
  pageBg: string;
  surfaceBg: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  bodyFont: string;
  monoFont: string;
  baseFontSize: number;
  baseLineHeight: number;
  maxWidth: number;
  contentPaddingX: number;
  contentPaddingY: number;
  headings: Record<HeadingLevel, HeadingStyleConfig>;
  elements: MarkdownElementStyles;
  rawCustomCss: string;
}

export interface EditorPreferences {
  showLineNumbers: boolean;
  editorFontSize: number;
  spellCheck: boolean;
  wordWrap: boolean;
}

export type ViewMode = 'read' | 'source';

export type ActiveDrawer = 'none' | 'outline' | 'settings';

export interface TocItem {
  id: string;
  level: number;
  text: string;
  line: number;
}

export interface DocumentStats {
  words: number;
  characters: number;
  lines: number;
  readingMinutes: number;
}

export interface OneTxtBackup {
  app: 'OneTXT';
  version: string;
  type: 'text' | 'theme' | 'full';
  exportedAt: string;
  title?: string;
  content?: string;
  theme?: DocumentTheme;
  preferences?: EditorPreferences;
}
