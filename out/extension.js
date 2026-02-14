"use strict";
/**
 * Single-File Lab Studio — Extension Entry Point
 * Registers all commands and activates the extension.
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const newApp_1 = require("./commands/newApp");
const importSpec_1 = require("./commands/importSpec");
const publishReady_1 = require("./commands/publishReady");
const PreviewPanel_1 = require("./preview/PreviewPanel");
const LabViewProvider_1 = require("./views/LabViewProvider");
function activate(context) {
    console.log('Single-File Lab Studio activated');
    const provider = new LabViewProvider_1.LabViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(LabViewProvider_1.LabViewProvider.viewType, provider));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('lab.newApp', newApp_1.newAppCommand));
    context.subscriptions.push(vscode.commands.registerCommand('lab.importSpec', importSpec_1.importSpecCommand));
    context.subscriptions.push(vscode.commands.registerCommand('lab.publishReady', publishReady_1.publishReadyCommand));
    context.subscriptions.push(vscode.commands.registerCommand('lab.preview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Open an HTML file to preview it.');
            return;
        }
        if (!editor.document.fileName.endsWith('.html')) {
            vscode.window.showWarningMessage('Lab Preview works with HTML files only.');
            return;
        }
        PreviewPanel_1.PreviewPanel.createOrShow(editor.document.uri);
    }));
    // Status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(beaker) Lab Studio';
    statusBar.tooltip = 'Single-File Lab Studio';
    statusBar.command = 'lab.newApp';
    statusBar.show();
    context.subscriptions.push(statusBar);
}
function deactivate() {
    // Cleanup
}
//# sourceMappingURL=extension.js.map