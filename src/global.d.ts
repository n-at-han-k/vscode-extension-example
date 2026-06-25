/**
 * Type declarations for the webview side.
 *
 * React 19 can render custom elements natively, but TypeScript still needs to
 * know about the `vscode-*` tags and their properties. We map each tag to its
 * web component class so attributes/props are type-checked in JSX.
 *
 * (On React 19 the `@vscode-elements/react-elements` wrapper is optional — this
 * is the no-wrapper approach used by the official `react-vite` example.)
 */
import type {
  VscodeTable,
  VscodeTableBody,
  VscodeTableCell,
  VscodeTableHeader,
  VscodeTableHeaderCell,
  VscodeTableRow,
} from '@vscode-elements/elements';
import type { TableRow } from './data';

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;

type WebComponentProps<I extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<I>,
  I
> &
  ElementProps<I>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'vscode-table': WebComponentProps<VscodeTable>;
      'vscode-table-body': WebComponentProps<VscodeTableBody>;
      'vscode-table-cell': WebComponentProps<VscodeTableCell>;
      'vscode-table-header': WebComponentProps<VscodeTableHeader>;
      'vscode-table-header-cell': WebComponentProps<VscodeTableHeaderCell>;
      'vscode-table-row': WebComponentProps<VscodeTableRow>;
    }
  }
}

/** Minimal shape of the API object returned by `acquireVsCodeApi()`. */
interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare global {
  interface Window {
    /** Initial row data injected by the extension host into the HTML. */
    __INITIAL_DATA__?: TableRow[];
  }
  /** Provided by the VS Code webview runtime. Call at most once. */
  function acquireVsCodeApi(): VsCodeApi;
}
