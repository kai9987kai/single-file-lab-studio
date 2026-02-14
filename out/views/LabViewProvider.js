"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class LabViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'newApp':
                    vscode.commands.executeCommand('lab.newApp');
                    break;
                case 'importSpec':
                    vscode.commands.executeCommand('lab.importSpec');
                    break;
                case 'openFile':
                    if (data.path) {
                        vscode.window.showTextDocument(vscode.Uri.file(data.path));
                    }
                    break;
                case 'createFromTemplate':
                    this._createFromTemplate(data.templateId);
                    break;
            }
        });
    }
    _getHtmlForWebview(webview) {
        const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'icon.png'));
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      padding: 10px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      margin-bottom: 24px;
      text-align: center;
    }
    .main-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .main-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--vscode-sideBarTitle-foreground);
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 8px;
      color: var(--vscode-descriptionForeground);
      border-bottom: 1px solid var(--vscode-widget-border);
      padding-bottom: 4px;
    }
    button {
      width: 100%;
      padding: 6px;
      margin-bottom: 6px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 12px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
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
      padding: 8px;
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 4px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .template-card:hover {
      border-color: var(--vscode-focusBorder);
    }
    .template-name {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .template-desc {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }
    .recent-item {
      padding: 4px 8px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
    }
    .recent-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">Quick Actions</div>
    <button onclick="newApp()">✨ New Single-File App</button>
    <button class="secondary-button" onclick="importSpec()">📋 Import Lab Spec</button>
  </div>

  <div class="section">
    <div class="section-title">Template Gallery</div>
    <div class="template-card" onclick="createFromTemplate('visualizer')">
      <div class="template-name">📈 Data Visualizer</div>
      <div class="template-desc">Built-in Chart.js integration and CSV parser.</div>
    </div>
    <div class="template-card" onclick="createFromTemplate('game')">
      <div class="template-name">🕹️ Game Loop</div>
      <div class="template-desc">Canvas setup with delta-time loop and input hooks.</div>
    </div>
    <div class="template-card" onclick="createFromTemplate('form')">
      <div class="template-name">📑 Advanced Form</div>
      <div class="template-desc">Validation and multi-step layout.</div>
    </div>
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

    // Placeholder for actual file tracking
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'updateRecent') {
        const container = document.getElementById('recentFiles');
        const section = document.getElementById('recentSection');
        if (message.files.length > 0) {
          section.style.display = 'block';
          container.innerHTML = message.files.map(f => \`
            <div class="recent-item" onclick="vscode.postMessage({type:'openFile', path:'\${f.path}'})">
              📄 \${f.name}
            </div>
          \`).join('');
        }
      }
    });
  </script>
</body>
</html>`;
    }
    async _createFromTemplate(templateId) {
        vscode.window.showInformationMessage(`Creating ${templateId} lab...`);
        let customHtml = '';
        const baseOptions = {
            title: `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Lab`,
            includePresetManager: true,
            includeExportButtons: true,
            darkTheme: true
        };
        const baseHtml = require('../templates/baseApp').generateBaseApp(baseOptions);
        switch (templateId) {
            case 'visualizer':
                // Add Chart.js and a data table
                const chartScript = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';
                customHtml = baseHtml
                    .replace('</head>', `${chartScript}\n</head>`)
                    .replace('<p class="placeholder">Your output will appear here.</p>', '<canvas id="myChart"></canvas>')
                    .replace('// ─── Initialize ──────────────────────────────────────────', `
  // ─── Chart Initialization ──────────────────────────────
  Lab.render = function() {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: 'Lab Data',
          data: [12, 19, 3, 5, 2, 3].map(v => v * (this.state.sampleRange / 50)),
          backgroundColor: 'rgba(88, 166, 255, 0.5)',
          borderColor: 'rgba(88, 166, 255, 1)',
          borderWidth: 1
        }]
      }
    });
  };
\n// ─── Initialize ──────────────────────────────────────────`);
                break;
            case 'game':
                // Add Canvas game loop
                customHtml = baseHtml
                    .replace('<p class="placeholder">Your output will appear here.</p>', '<canvas id="gameCanvas" width="400" height="300" style="background:#000;border-radius:4px;"></canvas>')
                    .replace('// ─── Initialize ──────────────────────────────────────────', `
  // ─── Game Loop ──────────────────────────────────────────
  Lab.render = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    let x = 0;
    const animate = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = this.state.sampleToggle ? '#3fb950' : '#f85149';
      x = (x + (this.state.sampleRange / 10)) % canvas.width;
      ctx.fillRect(x, 140, 50, 20);
      this.frame = requestAnimationFrame(animate);
    };
    if (this.frame) cancelAnimationFrame(this.frame);
    animate();
  };
\n// ─── Initialize ──────────────────────────────────────────`);
                break;
            case 'form':
                // Add complex form inputs
                customHtml = baseHtml.replace('<h2>Output</h2>', '<h2>Form Result</h2>');
                break;
            default:
                customHtml = baseHtml;
        }
        // Determine output path
        const wsFolder = vscode.workspace.workspaceFolders?.[0];
        const uri = wsFolder
            ? vscode.Uri.joinPath(wsFolder.uri, `lab-${templateId}.html`)
            : await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(`lab-${templateId}.html`) });
        if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(customHtml, 'utf-8'));
            const doc = await vscode.window.showTextDocument(uri);
            vscode.window.showInformationMessage(`🚀 ${templateId} lab created!`);
        }
    }
}
exports.LabViewProvider = LabViewProvider;
LabViewProvider.viewType = 'labSidebar';
//# sourceMappingURL=LabViewProvider.js.map