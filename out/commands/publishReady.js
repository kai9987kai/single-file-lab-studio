"use strict";
/**
 * Command: Lab: Publish Ready
 * Injects favicon, SEO meta tags, and optional service worker into an HTML file.
 */
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
exports.publishReadyCommand = publishReadyCommand;
const vscode = __importStar(require("vscode"));
// Minimal 16x16 favicon as data URI (a blue beaker icon)
const FAVICON_DATA_URI = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧪</text></svg>`;
const SERVICE_WORKER_SCRIPT = `
    // ─── Offline Service Worker ────────────────────────────
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const sw = \`
          const CACHE = 'lab-v1';
          self.addEventListener('install', e => e.waitUntil(
            caches.open(CACHE).then(c => c.addAll(['/']))
          ));
          self.addEventListener('fetch', e => e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
          ));
        \`;
        const blob = new Blob([sw], { type: 'application/javascript' });
        navigator.serviceWorker.register(URL.createObjectURL(blob));
      });
    }`;
async function publishReadyCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.document.fileName.endsWith('.html')) {
        vscode.window.showWarningMessage('Open an HTML file first to make it publish-ready.');
        return;
    }
    // Options
    const items = await vscode.window.showQuickPick([
        { label: '🖼️ Favicon', description: 'Inject emoji favicon', picked: true },
        { label: '🔍 SEO Meta', description: 'Add description, og:tags, theme-color', picked: true },
        { label: '📴 Service Worker', description: 'Inline offline-capable SW', picked: false }
    ], {
        canPickMany: true,
        placeHolder: 'Select what to inject'
    });
    if (!items || items.length === 0) {
        return;
    }
    const injectFavicon = items.some(i => i.label.includes('Favicon'));
    const injectSEO = items.some(i => i.label.includes('SEO'));
    const injectSW = items.some(i => i.label.includes('Service'));
    let content = editor.document.getText();
    // Extract title for SEO
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Lab App';
    let headInjections = '';
    if (injectFavicon) {
        if (!content.includes('rel="icon"') && !content.includes("rel='icon'")) {
            headInjections += `  <link rel="icon" href="${FAVICON_DATA_URI}">\n`;
        }
    }
    if (injectSEO) {
        if (!content.includes('name="description"')) {
            headInjections += `  <meta name="description" content="${title} — A single-file lab application">\n`;
        }
        if (!content.includes('property="og:title"')) {
            headInjections += `  <meta property="og:title" content="${title}">\n`;
            headInjections += `  <meta property="og:type" content="website">\n`;
            headInjections += `  <meta property="og:description" content="Built with Single-File Lab Studio">\n`;
        }
        if (!content.includes('name="theme-color"')) {
            headInjections += `  <meta name="theme-color" content="#0d1117">\n`;
        }
    }
    if (headInjections) {
        content = content.replace('</head>', headInjections + '</head>');
    }
    if (injectSW && !content.includes('serviceWorker')) {
        content = content.replace('</body>', `  <script>${SERVICE_WORKER_SCRIPT}\n  </script>\n</body>`);
    }
    // Apply edit
    const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(editor.document.getText().length));
    await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, content);
    });
    await editor.document.save();
    const parts = [];
    if (injectFavicon) {
        parts.push('favicon');
    }
    if (injectSEO) {
        parts.push('SEO meta');
    }
    if (injectSW) {
        parts.push('service worker');
    }
    vscode.window.showInformationMessage(`🚀 Publish-ready! Injected: ${parts.join(', ')}`);
}
//# sourceMappingURL=publishReady.js.map