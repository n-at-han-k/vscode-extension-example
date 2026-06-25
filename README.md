# VS Code Extension Example

A sample VS Code extension that opens a webview and renders a data table using
[VS Code Elements](https://vscode-elements.github.io) (`@vscode-elements/elements`)
inside a React app.

Run the **Show Data Table** command (from the Command Palette) to open the panel.

Loosely based on:

- https://github.com/vscode-elements/examples/tree/main/react-vite
- https://github.com/bendera/vscode-commit-message-editor
- https://github.com/microsoft/vscode-extension-samples/tree/main/notebook-renderer-react-sample
- https://github.com/microsoft/vscode-extension-samples/tree/main/webview-sample

Uses:

- https://github.com/vscode-elements/elements — the web component library

## How it works

The project has two independently-built halves:

| Half | Source | Built to | Built by |
| --- | --- | --- | --- |
| **Extension host** (Node) | `src/extension.ts` | `out/extension.js` (ESM) | `tsc` |
| **Webview** (browser) | `src/index.tsx`, `src/App.tsx` | `dist/webview.js` | Vite |

- `src/extension.ts` registers the `tableWebview.show` command, creates the
  webview panel, injects the row data into the page, and serves an HTML shell
  with a strict CSP (nonce-gated script, codicons font allowed).
- `src/App.tsx` renders the `<vscode-table>` family of custom elements. The
  elements are registered by the side-effect imports at the top of
  `src/index.tsx`.
- `src/data.ts` holds the shared `TableRow` type used by both halves.
- `src/global.d.ts` declares the `vscode-*` JSX tags so React/TypeScript know
  their props.
- `src/vscodeApi.ts` wraps `acquireVsCodeApi()` (called once per webview).

### Why no `@vscode-elements/react-elements` wrapper?

Starting with React 19, custom elements can be rendered natively — props are
forwarded to the element and DOM properties/attributes are set automatically.
This is the no-wrapper approach used by the official
[`react-vite` example](https://github.com/vscode-elements/examples/tree/main/react-vite),
and it matches the installed dependencies (`@vscode-elements/elements` + React 19).
The wrapper library remains a valid alternative if you prefer typed React
components (`<VscodeTable />`).

### Messaging

Clicking a row calls `vscodeApi.postMessage({ type: 'rowSelected', row })`; the
extension host listens via `onDidReceiveMessage` and shows an information
message. This demonstrates the webview → extension round trip.

## Extension Manifest

In `package.json`:

```json
{
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "tableWebview.show",
        "title": "Show Data Table",
        "category": "Table Webview"
      }
    ]
  }
}
```

## Develop

```bash
npm install
npm run build      # build webview + compile extension host
```

Press **F5** (the *Run Extension* launch config) to build and open an Extension
Development Host. Then run **Show Data Table** from the Command Palette.

For an iterative loop, run the webview watcher and the extension watcher in
separate terminals:

```bash
npm run dev              # vite build --watch (webview)
npm run watch:extension  # tsc --watch (extension host)
```

Other scripts: `npm run check` (typecheck everything), `npm run lint`,
`npm run package` (build a `.vsix`).

## Publish

Publishing runs in CI via [`HaaLeo/publish-vscode-extension`](https://github.com/marketplace/actions/publish-vs-code-extension)
(see `.github/workflows/release.yml`). Pushing a tag like `v0.1.0` packages the
extension once and publishes it to both the Open VSX Registry and the Visual
Studio Marketplace.

Before publishing:

1. Set a real `publisher` (and `repository`) in `package.json`.
2. Add repository secrets `OPEN_VSX_TOKEN` and `VS_MARKETPLACE_TOKEN`.

```bash
git tag v0.1.0 && git push origin v0.1.0
```
