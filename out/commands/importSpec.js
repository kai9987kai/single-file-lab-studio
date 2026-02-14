"use strict";
/**
 * Command: Lab: Import Spec
 * Parses a JSON lab spec and generates a single-file app with matching controls.
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
exports.importSpecCommand = importSpecCommand;
const vscode = __importStar(require("vscode"));
const specGenerator_1 = require("../templates/specGenerator");
const baseApp_1 = require("../templates/baseApp");
const SAMPLE_SPEC = `{
  "title": "My Experiment",
  "description": "A quick prototype",
  "darkTheme": true,
  "includePresetManager": true,
  "includeExportButtons": true,
  "controls": [
    { "id": "speed", "type": "range", "label": "Speed", "default": 50, "min": 0, "max": 100 },
    { "id": "color", "type": "color", "label": "Primary Color", "default": "#58a6ff" },
    { "id": "mode", "type": "select", "label": "Mode", "options": [
      { "label": "Normal", "value": "normal" },
      { "label": "Turbo", "value": "turbo" }
    ]},
    { "id": "enabled", "type": "checkbox", "label": "Enable Feature", "default": true }
  ]
}`;
async function importSpecCommand() {
    // Open a text document for user to paste spec
    const input = await vscode.window.showInputBox({
        prompt: 'Paste your JSON lab spec (or leave empty for sample)',
        placeHolder: '{ "title": "...", "controls": [...] }',
        ignoreFocusOut: true
    });
    const jsonStr = input?.trim() || SAMPLE_SPEC;
    const result = (0, specGenerator_1.validateSpec)(jsonStr);
    if (!result.valid || !result.spec) {
        vscode.window.showErrorMessage(`Invalid lab spec: ${result.error}`);
        return;
    }
    const spec = result.spec;
    // Generate custom controls HTML
    const controlsHTML = (0, specGenerator_1.generateControlsHTML)(spec.controls);
    // Generate base app then replace controls section
    const baseHtml = (0, baseApp_1.generateBaseApp)({
        title: spec.title,
        includePresetManager: spec.includePresetManager ?? true,
        includeExportButtons: spec.includeExportButtons ?? true,
        darkTheme: spec.darkTheme ?? true
    });
    // Replace the default controls with spec-generated controls
    const customHtml = baseHtml.replace(/(<section class="lab-controls" id="controls">[\s\S]*?<h2>Controls<\/h2>)([\s\S]*?)(<\/section>)/, `$1\n${controlsHTML}\n      $3`);
    // Determine output path
    let outputUri;
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const wsRoot = vscode.workspace.workspaceFolders[0].uri;
        const filename = spec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html';
        outputUri = vscode.Uri.joinPath(wsRoot, filename);
    }
    else {
        const saveUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('lab-app.html'),
            filters: { 'HTML Files': ['html'] }
        });
        if (!saveUri) {
            return;
        }
        outputUri = saveUri;
    }
    await vscode.workspace.fs.writeFile(outputUri, Buffer.from(customHtml, 'utf-8'));
    const doc = await vscode.workspace.openTextDocument(outputUri);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`✨ Lab app "${spec.title}" generated from spec with ${spec.controls.length} controls!`);
}
//# sourceMappingURL=importSpec.js.map