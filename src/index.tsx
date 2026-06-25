import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Importing these modules registers the custom elements (`vscode-table`, etc.)
// with the browser. They must be imported before the components are rendered.
import '@vscode-elements/elements/dist/vscode-table';
import '@vscode-elements/elements/dist/vscode-table-header';
import '@vscode-elements/elements/dist/vscode-table-header-cell';
import '@vscode-elements/elements/dist/vscode-table-body';
import '@vscode-elements/elements/dist/vscode-table-row';
import '@vscode-elements/elements/dist/vscode-table-cell';

// Initial data is injected into the page by the extension host (see
// `_getHtmlForWebview` in extension.ts).
const rows = window.__INITIAL_DATA__ ?? [];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App rows={rows} />
  </StrictMode>,
);
