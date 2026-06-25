/**
 * Shared row shape used by both the extension host (data source) and the
 * webview (rendering). Keeping it in one module avoids the two sides drifting.
 */
export interface TableRow {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
}
