import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'dist-single');
const publicDir = path.join(rootDir, 'public');
const publicHtmlPath = path.join(publicDir, 'OneTXT.html');
const rootHtmlPath = path.join(rootDir, 'OneTXT.html');

// Remove previous public/OneTXT.html before vite build so it isn't copied into dist-single
if (fs.existsSync(publicHtmlPath)) {
  fs.unlinkSync(publicHtmlPath);
}

try {
  execSync('npx vite build --outDir dist-single --emptyOutDir', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  const indexHtmlPath = path.join(outDir, 'index.html');
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  const assetsDir = path.join(outDir, 'assets');
  const assetFiles = fs.readdirSync(assetsDir);
  const cssFile = assetFiles.find((f) => f.endsWith('.css'));
  const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));

  if (!cssFile || jsFiles.length !== 1) {
    throw new Error(
      `Expected 1 CSS and 1 JS bundle in dist-single/assets, found CSS=${cssFile}, JS=${jsFiles.join(', ')}`
    );
  }

  const rawCss = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8').replace(/<\/style/gi, '<\\/style');
  const rawJs = fs.readFileSync(path.join(assetsDir, jsFiles[0]), 'utf8');

  // Convert ES module output to classic IIFE so OneTXT.html works directly via file:// without CORS
  const transformed = transformSync(rawJs, {
    format: 'iife',
    minify: true,
    legalComments: 'none',
    target: 'es2020',
  });

  const safeJs = transformed.code.replace(/<\/script/gi, '<\\/script');

  // Verify transformed JS parses cleanly
  new vm.Script(transformed.code);

  // Replace external stylesheet link with inline compiled CSS
  html = html.replace(
    /<link\s+rel=["']stylesheet["'][^>]*href=["'][^"']*\.css["'][^>]*>/i,
    () => `<style id="onetxt-compiled-css">\n${rawCss}\n</style>`
  );

  // Strip external module script tag from head
  html = html.replace(
    /<script\s+type=["']module["'][^>]*src=["'][^"']*\.js["'][^>]*><\/script>/i,
    ''
  );

  // Inject embedded state placeholder + inline IIFE bundle right before </body>
  const bodyInject = `<script id="onetxt-embedded-state" type="application/json">{}</script>\n<script id="onetxt-standalone-bundle" defer>\n${safeJs}\n</script>\n</body>`;
  html = html.replace('</body>', () => bodyInject);

  fs.writeFileSync(rootHtmlPath, html, 'utf8');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicHtmlPath, html, 'utf8');

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`Built full self-contained OneTXT.html (${kb} KB)`);
} finally {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}
