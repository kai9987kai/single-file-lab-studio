import * as vscode from 'vscode';
export declare class LabViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "labSidebar";
    private _view?;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _getHtmlForWebview;
    private _createFromTemplate;
}
//# sourceMappingURL=LabViewProvider.d.ts.map