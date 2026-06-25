/**
 * `acquireVsCodeApi()` may only be called once per webview, so we call it here
 * and share the single instance. Import `vscodeApi` anywhere in the webview to
 * post messages back to the extension host.
 */
export const vscodeApi = acquireVsCodeApi();
