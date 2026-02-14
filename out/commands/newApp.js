"use strict";
/**
 * Command: Lab: New Single-File App
 * Generates a complete index.html monolith in the current workspace.
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
exports.newAppCommand = newAppCommand;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const baseApp_1 = require("../templates/baseApp");
async function newAppCommand() {
    // Prompt for app title
    const title = await vscode.window.showInputBox({
        prompt: 'Enter your app title',
        value: 'My Lab App',
        placeHolder: 'e.g. Particle Simulator, Color Tool...'
    });
    if (!title) {
        return;
    }
    // Quick pick options
    const presets = await vscode.window.showQuickPick([
        { label: '$(check) Include Preset Manager', description: 'localStorage-based presets', picked: true },
        { label: '$(x) Skip Preset Manager', description: 'No preset manager', picked: false }
    ], { placeHolder: 'Include preset manager?' });
    const includePresetManager = presets?.label.includes('Include') ?? true;
    const exports = await vscode.window.showQuickPick([
        { label: '$(check) Include Export Buttons', description: 'HTML, JSON, CSV export', picked: true },
        { label: '$(x) Skip Export Buttons', description: 'No export buttons', picked: false }
    ], { placeHolder: 'Include export buttons?' });
    const includeExportButtons = exports?.label.includes('Include') ?? true;
    const theme = await vscode.window.showQuickPick([
        { label: '🌙 Dark Theme', description: 'Dark background with light text' },
        { label: '☀️ Light Theme', description: 'Light background with dark text' }
    ], { placeHolder: 'Choose theme' });
    const darkTheme = theme?.label.includes('Dark') ?? true;
    const options = {
        title,
        includePresetManager,
        includeExportButtons,
        darkTheme
    };
    const html = (0, baseApp_1.generateBaseApp)(options);
    // Determine output path
    let outputUri;
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const wsRoot = vscode.workspace.workspaceFolders[0].uri;
        outputUri = vscode.Uri.joinPath(wsRoot, 'index.html');
    }
    else {
        const saveUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('index.html'),
            filters: { 'HTML Files': ['html'] }
        });
        if (!saveUri) {
            return;
        }
        outputUri = saveUri;
    }
    // Check if file exists
    try {
        await vscode.workspace.fs.stat(outputUri);
        const overwrite = await vscode.window.showWarningMessage(`${path.basename(outputUri.fsPath)} already exists. Overwrite?`, 'Yes', 'No');
        if (overwrite !== 'Yes') {
            return;
        }
    }
    catch {
        // File doesn't exist, proceed
    }
    await vscode.workspace.fs.writeFile(outputUri, Buffer.from(html, 'utf-8'));
    // Open the file
    const doc = await vscode.workspace.openTextDocument(outputUri);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`✨ Lab app "${title}" created! Use "Lab: Live Preview" to see it in action.`);
}
//# sourceMappingURL=newApp.js.map