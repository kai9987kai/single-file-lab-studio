import * as vscode from 'vscode';
import * as path from 'path';
import { TEMPLATES } from '../templates/galleryTemplates';
import { generateBaseApp } from '../templates/baseApp';

export class LabViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'labSidebar';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async data => {
      switch (data.type) {
        case 'newApp':
          vscode.commands.executeCommand('lab.newApp');
          break;
        case 'importSpec':
          vscode.commands.executeCommand('lab.importSpec');
          break;
        case 'openFile':
          if (data.path) {
            try {
              const uri = vscode.Uri.file(data.path);
              const doc = await vscode.workspace.openTextDocument(uri);
              await vscode.window.showTextDocument(doc);
            } catch (e: any) {
              vscode.window.showErrorMessage(`Could not open file: ${e.message}`);
            }
          }
          break;
        case 'createFromTemplate':
          this._createFromTemplate(data.templateId);
          break;
      }
    });

    // Initial update for recent files
    this.updateRecentFiles();
  }

  public async updateRecentFiles() {
    if (!this._view) { return; }
    const recent = await this._getRecentFiles();
    this._view.webview.postMessage({ type: 'updateRecent', files: recent });
  }

  private async _getRecentFiles(): Promise<{ name: string, path: string }[]> {
    const state = (this as any)._view?.visible ? vscode.workspace.getConfiguration('labStudio').get('recentFiles', []) : [];
    // Note: In a real extension, we'd use context.globalState. 
    // For this lab, we'll try to find index.html or lab-*.html files in the workspace.
    const files = await vscode.workspace.findFiles('**/{index,lab-*}.html', '**/node_modules/**', 10);
    return files.map(f => ({
      name: path.basename(f.fsPath),
      path: f.fsPath
    }));
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Fix: Use the correct icon URI from the extension
    const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar-icon.svg'));

    const templateGalleryHtml = Object.values(TEMPLATES).map(t => `
    <div class="template-card" onclick="createFromTemplate('${t.id}')">
      <div class="template-name">${t.name}</div>
      <div class="template-desc">${t.description}</div>
    </div>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      padding: 12px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--vscode-widget-border);
    }
    .main-logo {
      width: 24px;
      height: 24px;
      color: var(--vscode-button-background);
    }
    .main-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: var(--vscode-descriptionForeground);
      letter-spacing: 0.1em;
    }
    button {
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .secondary-button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .secondary-button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .template-card {
      padding: 10px;
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 6px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .template-card:hover {
      border-color: var(--vscode-focusBorder);
      background: var(--vscode-list-hoverBackground);
      transform: translateY(-1px);
    }
    .template-name {
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .template-desc {
      font-size: 11px;
      line-height: 1.4;
      color: var(--vscode-descriptionForeground);
    }
    .recent-item {
      padding: 6px 10px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .recent-item:hover {
      background: var(--vscode-list-hoverBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${iconUri}" class="main-logo" alt="Lab Logo">
    <div class="main-title">Lab Studio</div>
  </div>

  <div class="section">
    <div class="section-title">Quick Actions</div>
    <button onclick="newApp()">✨ New Lab App</button>
    <button class="secondary-button" onclick="importSpec()">📋 Import Spec</button>
  </div>

  <div class="section">
    <div class="section-title">Template Gallery</div>
    ${templateGalleryHtml}
  </div>

  <div class="section" id="recentSection" style="display:none;">
    <div class="section-title">Recent Labs</div>
    <div id="recentFiles"></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function newApp() { vscode.postMessage({ type: 'newApp' }); }
    function importSpec() { vscode.postMessage({ type: 'importSpec' }); }
    function createFromTemplate(id) { vscode.postMessage({ type: 'createFromTemplate', templateId: id }); }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'updateRecent') {
        const container = document.getElementById('recentFiles');
        const section = document.getElementById('recentSection');
        if (message.files && message.files.length > 0) {
          section.style.display = 'block';
          container.innerHTML = message.files.map(f => \`
            <div class="recent-item" onclick="vscode.postMessage({type:'openFile', path:'\${f.path.replace(/\\\\/g, '\\\\\\\\')}'})">
              📄 \${f.name}
            </div>
          \`).join('');
        } else {
          section.style.display = 'none';
        }
      }
    });
  </script>
</body>
</html>`;
  }

  private async _createFromTemplate(templateId: string) {
    const template = TEMPLATES[templateId];
    if (!template) { return; }

    vscode.window.showInformationMessage(`Creating ${template.name}...`);

    const baseOptions = {
      title: template.name,
      includePresetManager: true,
      includeExportButtons: true,
      darkTheme: true
    };

    let html = generateBaseApp(baseOptions);

    // Inject Scripts
    if (template.scripts && template.scripts.length > 0) {
      const scriptsHtml = template.scripts.map(s => `<script src="${s}"></script>`).join('\n  ');
      html = html.replace('</head>', `  ${scriptsHtml}\n</head>`);
    }

    // Inject HTML components
    if (template.injectHtml) {
      for (const [selector, content] of Object.entries(template.injectHtml)) {
        if (selector === '#outputCanvas') {
          html = html.replace('<!-- LAB_INJECT_OUTPUT_START -->', '<!-- LAB_INJECT_OUTPUT_START -->\n' + content)
            .replace('<p class="placeholder">Your output will appear here.</p>', '');
        }
      }
    }

    // Inject JS Logic
    if (template.injectJs) {
      html = html.replace('/* LAB_INJECT_JS_START */', '/* LAB_INJECT_JS_START */\n' + template.injectJs);
    }

    // Determine output path
    const wsFolder = vscode.workspace.workspaceFolders?.[0];
    const filename = `lab-${templateId}.html`;
    const uri = wsFolder
      ? vscode.Uri.joinPath(wsFolder.uri, filename)
      : await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(filename), filters: { 'HTML': ['html'] } });

    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(html, 'utf-8'));
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc);
      vscode.window.showInformationMessage(`🚀 ${template.name} created!`);
      this.updateRecentFiles();
    }
  }
}
