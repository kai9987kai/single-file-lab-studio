/**
 * Command: Lab: Import Spec
 * Parses a JSON lab spec and generates a single-file app with matching controls.
 */

import * as vscode from 'vscode';
import { validateSpec, generateControlsHTML, LabSpec } from '../templates/specGenerator';
import { generateBaseApp } from '../templates/baseApp';

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

export async function importSpecCommand(): Promise<void> {
    // Open a text document for user to paste spec
    const input = await vscode.window.showInputBox({
        prompt: 'Paste your JSON lab spec (or leave empty for sample)',
        placeHolder: '{ "title": "...", "controls": [...] }',
        ignoreFocusOut: true
    });

    const jsonStr = input?.trim() || SAMPLE_SPEC;
    const result = validateSpec(jsonStr);

    if (!result.valid || !result.spec) {
        vscode.window.showErrorMessage(`Invalid lab spec: ${result.error}`);
        return;
    }

    const spec = result.spec;

    // Generate custom controls HTML
    const controlsHTML = generateControlsHTML(spec.controls);

    // Generate base app then replace controls section
    const baseHtml = generateBaseApp({
        title: spec.title,
        includePresetManager: spec.includePresetManager ?? true,
        includeExportButtons: spec.includeExportButtons ?? true,
        darkTheme: spec.darkTheme ?? true
    });

    // Replace the default controls with spec-generated controls
    const customHtml = baseHtml.replace(
        /<!-- LAB_INJECT_CONTROLS_START -->[\s\S]*<!-- LAB_INJECT_CONTROLS_END -->/,
        `<!-- LAB_INJECT_CONTROLS_START -->\n${controlsHTML}\n        <!-- LAB_INJECT_CONTROLS_END -->`
    );

    // Determine output path
    let outputUri: vscode.Uri;

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const wsRoot = vscode.workspace.workspaceFolders[0].uri;
        const filename = spec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html';
        outputUri = vscode.Uri.joinPath(wsRoot, filename);
    } else {
        const saveUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('lab-app.html'),
            filters: { 'HTML Files': ['html'] }
        });
        if (!saveUri) { return; }
        outputUri = saveUri;
    }

    await vscode.workspace.fs.writeFile(outputUri, Buffer.from(customHtml, 'utf-8'));

    const doc = await vscode.workspace.openTextDocument(outputUri);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(
        `✨ Lab app "${spec.title}" generated from spec with ${spec.controls.length} controls!`
    );
}
