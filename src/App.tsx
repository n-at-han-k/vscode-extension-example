import type { TableRow } from './data';
import { vscodeApi } from './vscodeApi';

interface AppProps {
  rows: TableRow[];
}

/**
 * Renders the data set with VS Code Elements' table components. The `vscode-*`
 * tags are real custom elements registered in `index.tsx`; React 19 forwards
 * props/attributes to them directly.
 *
 * `slot="header"` / `slot="body"` are required — `<vscode-table>` projects its
 * children into named slots.
 */
export function App({ rows }: AppProps) {
  const onRowClick = (row: TableRow) => {
    // Demonstrates webview -> extension messaging.
    vscodeApi.postMessage({ type: 'rowSelected', row });
  };

  return (
    <vscode-table zebra borderedRows resizable columns={['80px', 'auto', '120px']}>
      <vscode-table-header slot="header">
        <vscode-table-header-cell>ID</vscode-table-header-cell>
        <vscode-table-header-cell>Name</vscode-table-header-cell>
        <vscode-table-header-cell>Status</vscode-table-header-cell>
      </vscode-table-header>
      <vscode-table-body slot="body">
        {rows.map((row) => (
          <vscode-table-row key={row.id} onClick={() => onRowClick(row)}>
            <vscode-table-cell>{String(row.id)}</vscode-table-cell>
            <vscode-table-cell>{row.name}</vscode-table-cell>
            <vscode-table-cell>{row.status}</vscode-table-cell>
          </vscode-table-row>
        ))}
      </vscode-table-body>
    </vscode-table>
  );
}
