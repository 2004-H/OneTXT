export interface YamlProperty {
  key: string;
  value: string;
  values?: string[];
}

export interface ParsedFrontmatter {
  hasFrontmatter: boolean;
  properties: YamlProperty[];
  body: string;
  rawYaml: string;
  frontmatterLineCount: number;
}

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function unquote(val: string): string {
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseYamlFrontmatter(markdown: string): ParsedFrontmatter {
  const match = FRONTMATTER_REGEX.exec(markdown);
  if (!match) {
    return {
      hasFrontmatter: false,
      properties: [],
      body: markdown,
      rawYaml: '',
      frontmatterLineCount: 0,
    };
  }

  const rawYaml = match[1];
  const fullMatch = match[0];
  const body = markdown.slice(fullMatch.length);
  const frontmatterLineCount = fullMatch.split(/\r?\n/).length - (fullMatch.endsWith('\n') ? 1 : 0);

  const lines = rawYaml.split(/\r?\n/);
  const properties: YamlProperty[] = [];
  let currentListProp: YamlProperty | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Multi-line YAML array item: `  - value`
    const listItemMatch = /^\s+-\s+(.+)$/.exec(rawLine);
    if (listItemMatch && currentListProp) {
      const itemVal = unquote(listItemMatch[1]);
      if (!currentListProp.values) currentListProp.values = [];
      currentListProp.values.push(itemVal);
      currentListProp.value = currentListProp.values.join(', ');
      continue;
    }

    currentListProp = null;

    const kvMatch = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(trimmed);
    if (!kvMatch) continue;

    const key = kvMatch[1].trim();
    const rawVal = kvMatch[2].trim();

    if (!rawVal) {
      const prop: YamlProperty = { key, value: '', values: [] };
      properties.push(prop);
      currentListProp = prop;
      continue;
    }

    // Inline YAML array: `[a, b, c]`
    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      const inner = rawVal.slice(1, -1).trim();
      const arr = inner
        ? inner.split(',').map((item) => unquote(item)).filter(Boolean)
        : [];
      properties.push({
        key,
        value: arr.join(', '),
        values: arr,
      });
      continue;
    }

    properties.push({
      key,
      value: unquote(rawVal),
    });
  }

  return {
    hasFrontmatter: true,
    properties,
    body,
    rawYaml,
    frontmatterLineCount,
  };
}

export function upsertYamlProperty(markdown: string, key: string, value: string): string {
  const cleanKey = key.trim().replace(/[^A-Za-z0-9_.-]/g, '_');
  if (!cleanKey) return markdown;

  const formattedValue =
    value.includes(',') && !value.startsWith('[')
      ? `[${value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
          .join(', ')}]`
      : value.trim();

  const match = FRONTMATTER_REGEX.exec(markdown);
  if (!match) {
    return `---\n${cleanKey}: ${formattedValue}\n---\n\n${markdown}`;
  }

  const lines = match[1].split(/\r?\n/);
  let replaced = false;
  const nextLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kvMatch = /^([A-Za-z0-9_.-]+)\s*:/.exec(line.trim());
    if (kvMatch && kvMatch[1] === cleanKey) {
      nextLines.push(`${cleanKey}: ${formattedValue}`);
      replaced = true;
      // Skip any indented list lines belonging to the replaced key
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        i++;
      }
    } else {
      nextLines.push(line);
    }
  }

  if (!replaced) {
    nextLines.push(`${cleanKey}: ${formattedValue}`);
  }

  const body = markdown.slice(match[0].length);
  return `---\n${nextLines.join('\n')}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`;
}

export function removeYamlProperty(markdown: string, key: string): string {
  const match = FRONTMATTER_REGEX.exec(markdown);
  if (!match) return markdown;

  const lines = match[1].split(/\r?\n/);
  const nextLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kvMatch = /^([A-Za-z0-9_.-]+)\s*:/.exec(line.trim());
    if (kvMatch && kvMatch[1] === key) {
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        i++;
      }
      continue;
    }
    nextLines.push(line);
  }

  const body = markdown.slice(match[0].length);
  if (nextLines.every((l) => !l.trim())) {
    return body.replace(/^\r?\n/, '');
  }
  return `---\n${nextLines.join('\n')}\n---\n${body}`;
}
