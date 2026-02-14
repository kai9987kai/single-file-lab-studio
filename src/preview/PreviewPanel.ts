/**
 * Live Preview WebviewPanel with sandboxed iframe and console inspector.
 * Watches the file for changes and auto-refreshes.
 */

import * as vscode from 'vscode';
import * as path from 'path';

export class PreviewPanel {
    public static currentPanel: PreviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _fileUri: vscode.Uri;
    private _watcher: vscode.FileSystemWatcher | undefined;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, fileUri: vscode.Uri) {
        this._panel = panel;
        this._fileUri = fileUri;

        this._update();
        this._setupWatcher();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(fileUri: vscode.Uri): void {
        const column = vscode.ViewColumn.Beside;

        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'labPreview',
            `Lab Preview: ${path.basename(fileUri.fsPath)}`,
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(path.dirname(fileUri.fsPath))]
            }
        );

        PreviewPanel.currentPanel = new PreviewPanel(panel, fileUri);
    }

    private async _update(): Promise<void> {
        try {
            const fileBytes = await vscode.workspace.fs.readFile(this._fileUri);
            const htmlContent = Buffer.from(fileBytes).toString('utf-8');
            this._panel.webview.html = this._getWebviewContent(htmlContent);
        } catch (e: any) {
            this._panel.webview.html = this._getErrorContent(e.message);
        }
    }

    private _setupWatcher(): void {
        // Watch the specific file
        this._watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(vscode.Uri.file(path.dirname(this._fileUri.fsPath)), path.basename(this._fileUri.fsPath))
        );

        this._watcher.onDidChange(() => {
            this._update();
        });

        this._disposables.push(this._watcher);

        // Also listen for save events on any document
        vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.uri.fsPath === this._fileUri.fsPath) {
                this._update();
            }
        }, null, this._disposables);
    }

    private _getWebviewContent(userHtml: string): string {
        // Encode user HTML as base64 to inject into iframe via srcdoc
        const encoded = Buffer.from(this._wrapWithConsoleCapture(userHtml)).toString('base64');

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lab Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1117;
      color: #e6edf3;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      min-height: 36px;
    }
    .toolbar-title {
      font-size: 12px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .toolbar-btn {
      background: #21262d;
      border: 1px solid #30363d;
      color: #e6edf3;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: background 150ms;
    }
    .toolbar-btn:hover { background: #30363d; }
    .toolbar-spacer { flex: 1; }
    .toolbar-status {
      font-size: 11px;
      color: #3fb950;
    }
    .toolbar-status::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3fb950;
      margin-right: 4px;
    }

    .preview-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #fff;
    }

    .console-panel {
      background: #0d1117;
      border-top: 1px solid #30363d;
      max-height: 200px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: max-height 200ms ease;
    }
    .console-panel.collapsed { max-height: 32px; }
    .console-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      cursor: pointer;
      user-select: none;
      min-height: 32px;
    }
    .console-header-title {
      font-size: 11px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .console-badge {
      background: #da3633;
      color: #fff;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 10px;
      font-weight: 700;
    }
    .console-entries {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
      font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
    }
    .console-entry {
      padding: 2px 12px;
      border-bottom: 1px solid #21262d;
    }
    .console-entry:last-child { border-bottom: none; }
    .console-entry.log { color: #e6edf3; }
    .console-entry.warn { color: #d29922; background: rgba(210,153,34,0.08); }
    .console-entry.error { color: #f85149; background: rgba(248,81,73,0.08); }
    .console-entry .ts {
      color: #484f58;
      margin-right: 8px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span class="toolbar-title">🧪 Lab Preview</span>
    <span class="toolbar-spacer"></span>
    <span class="toolbar-status" id="status">Live</span>
    <button class="toolbar-btn" onclick="refresh()">↻ Refresh</button>
    <button class="toolbar-btn" onclick="clearConsole()">🗑 Clear</button>
  </div>

  <div class="preview-container">
    <iframe id="preview" sandbox="allow-scripts allow-same-origin allow-modals allow-forms"></iframe>
  </div>

  <div class="console-panel" id="consolePanel">
    <div class="console-header" onclick="toggleConsole()">
      <span class="console-header-title">Console</span>
      <span class="console-badge" id="errorCount" style="display:none;">0</span>
    </div>
    <div class="console-entries" id="consoleEntries"></div>
  </div>

  <script>
    const iframe = document.getElementById('preview');
    const consoleEntries = document.getElementById('consoleEntries');
    const errorCountBadge = document.getElementById('errorCount');
    let errorCount = 0;

    function loadContent() {
      const html = atob('${encoded}');
      iframe.srcdoc = html;
      document.getElementById('status').textContent = 'Live';
    }

    function refresh() {
      loadContent();
    }

    function clearConsole() {
      consoleEntries.innerHTML = '';
      errorCount = 0;
      errorCountBadge.style.display = 'none';
    }

    function toggleConsole() {
      document.getElementById('consolePanel').classList.toggle('collapsed');
    }

    function addConsoleEntry(level, args) {
      const div = document.createElement('div');
      div.className = 'console-entry ' + level;
      const ts = new Date().toISOString().slice(11, 19);
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      div.innerHTML = '<span class="ts">' + ts + '</span>' + escapeHtml(msg);
      consoleEntries.appendChild(div);
      consoleEntries.scrollTop = consoleEntries.scrollHeight;

      if (level === 'error') {
        errorCount++;
        errorCountBadge.textContent = errorCount;
        errorCountBadge.style.display = 'inline';
      }
    }

    function escapeHtml(str) {
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.__labConsole) {
        addConsoleEntry(event.data.level, event.data.args);
      }
    });

    loadContent();
  </script>
</body>
</html>`;
    }

    private _wrapWithConsoleCapture(html: string): string {
        const consoleProxy = `<script>
(function() {
  const origConsole = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  ['log', 'warn', 'error', 'info'].forEach(level => {
    console[level] = function(...args) {
      origConsole[level].apply(console, args);
      try {
        const safeArgs = args.map(a => {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch { return String(a); }
        });
        parent.postMessage({ __labConsole: true, level, args: safeArgs }, '*');
      } catch(e) {}
    };
  });
  window.addEventListener('error', (e) => {
    parent.postMessage({
      __labConsole: true,
      level: 'error',
      args: [e.message + ' (line ' + e.lineno + ')']
    }, '*');
  });
  window.addEventListener('unhandledrejection', (e) => {
    parent.postMessage({
      __labConsole: true,
      level: 'error',
      args: ['Unhandled Promise: ' + (e.reason?.message || e.reason)]
    }, '*');
  });
})();
</script>`;

        // Inject console proxy right after <head> tag
        if (html.includes('<head>')) {
            return html.replace('<head>', '<head>' + consoleProxy);
        } else if (html.includes('<HEAD>')) {
            return html.replace('<HEAD>', '<HEAD>' + consoleProxy);
        } else {
            return consoleProxy + html;
        }
    }

    private _getErrorContent(errorMsg: string): string {
        return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="background:#0d1117;color:#f85149;font-family:monospace;padding:2rem;">
  <h2>⚠️ Preview Error</h2>
  <pre>${errorMsg}</pre>
</body></html>`;
    }

    public dispose(): void {
        PreviewPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const d = this._disposables.pop();
            if (d) { d.dispose(); }
        }
    }
}
