/**
 * Live Preview WebviewPanel with sandboxed iframe and console inspector.
 * Watches the file for changes and auto-refreshes.
 */
import * as vscode from 'vscode';
export declare class PreviewPanel {
    static currentPanel: PreviewPanel | undefined;
    private readonly _panel;
    private readonly _fileUri;
    private _watcher;
    private _disposables;
    private constructor();
    static createOrShow(fileUri: vscode.Uri): void;
    private _update;
    private _setupWatcher;
    private _getWebviewContent;
    private _wrapWithConsoleCapture;
    private _getErrorContent;
    dispose(): void;
}
//# sourceMappingURL=PreviewPanel.d.ts.map