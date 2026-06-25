import * as vscode from 'vscode';
import type { TableRow } from './data.js';

// Internal data source. In a real extension this might come from a file, an
// API, or a language server.
const tableData: TableRow[] = [
  { id: 1, name: 'Item 1', status: 'Active' },
  { id: 2, name: 'Item 2', status: 'Inactive' },
  { id: 3, name: 'Item 3', status: 'Active' },
];

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('tableWebview.show', () => {
      TablePanel.createOrShow(context.extensionUri);
    }),
  );
}

export function deactivate() {
  TablePanel.currentPanel?.dispose();
}

/**
 * Message sent from the webview when a row is clicked.
 */
interface RowSelectedMessage {
  type: 'rowSelected';
  row: TableRow;
}

class TablePanel {
  public static currentPanel: TablePanel | undefined;
  public static readonly viewType = 'tableWebview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    if (TablePanel.currentPanel) {
      TablePanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      TablePanel.viewType,
      'Data Table',
      column,
      {
        enableScripts: true,
        // Keep the React state alive when the panel is hidden.
        retainContextWhenHidden: true,
        // The webview may only load resources from the built `dist` folder.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')],
      },
    );

    TablePanel.currentPanel = new TablePanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (message: RowSelectedMessage) => {
        switch (message.type) {
          case 'rowSelected':
            vscode.window.showInformationMessage(
              `Selected row: ${message.row.name} (${message.row.status})`,
            );
            break;
        }
      },
      null,
      this._disposables,
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    // URIs the webview is allowed to load (rewritten through asWebviewUri).
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'),
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'codicon.css'),
    );

    // Pass the data into the page so React can render it on first paint.
    const dataJson = JSON.stringify(tableData);

    return /* html */ `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${codiconsUri}" rel="stylesheet" id="vscode-codicon-stylesheet" />
        <title>Data Table</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}">window.__INITIAL_DATA__ = ${dataJson};</script>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  public dispose() {
    TablePanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
