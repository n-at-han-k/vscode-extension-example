import { copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const rootDir = import.meta.dirname;

/**
 * Codicons live in node_modules. The webview can only load resources from the
 * extension's own folders, so we copy the stylesheet + font next to the built
 * bundle. `codicon.css` references `codicon.ttf` relatively, so they must sit
 * together in `dist/`.
 */
function copyCodicons(): Plugin {
  return {
    name: 'copy-codicons',
    apply: 'build',
    closeBundle() {
      const cssPath = require.resolve('@vscode/codicons/dist/codicon.css');
      const ttfPath = require.resolve('@vscode/codicons/dist/codicon.ttf');
      copyFileSync(cssPath, resolve(rootDir, 'dist/codicon.css'));
      copyFileSync(ttfPath, resolve(rootDir, 'dist/codicon.ttf'));
    },
  };
}

// Builds the webview React app into a single, predictably-named bundle that the
// extension host loads via `asWebviewUri`. https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyCodicons()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Webviews load the bundle by absolute URI, so module preloading (which
    // injects relative <link> tags) is unnecessary and would break under CSP.
    modulePreload: false,
    rollupOptions: {
      input: resolve(rootDir, 'src/index.tsx'),
      output: {
        entryFileNames: 'webview.js',
        chunkFileNames: 'webview-[name].js',
        assetFileNames: 'webview.[ext]',
      },
    },
  },
});
