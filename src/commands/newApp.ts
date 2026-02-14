/**
 * Command: Lab: New Single-File App
 * Generates a complete index.html monolith in the current workspace.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { generateBaseApp, AppOptions } from '../templates/baseApp';

export async function newAppCommand(): Promise<void> {
    // Prompt for app title
    const title = await vscode.window.showInputBox({
        prompt: 'Enter your app title',
        value: 'My Lab App',
        placeHolder: 'e.g. Particle Simulator, Color Tool...'
    });

    if (!title) { return; }

    // Quick pick options
    const presets = await vscode.window.showQuickPick(
        [
            { label: '$(check) Include Preset Manager', description: 'localStorage-based presets', picked: true },
            { label: '$(x) Skip Preset Manager', description: 'No preset manager', picked: false }
        ],
        { placeHolder: 'Include preset manager?' }
    );
    const includePresetManager = presets?.label.includes('Include') ?? true;

    const exports = await vscode.window.showQuickPick(
        [
            { label: '$(check) Include Export Buttons', description: 'HTML, JSON, CSV export', picked: true },
            { label: '$(x) Skip Export Buttons', description: 'No export buttons', picked: false }
        ],
        { placeHolder: 'Include export buttons?' }
    );
    const includeExportButtons = exports?.label.includes('Include') ?? true;

    const theme = await vscode.window.showQuickPick(
        [
            { label: '🌙 Dark Theme', description: 'Dark background with light text' },
            { label: '☀️ Light Theme', description: 'Light background with dark text' }
        ],
        { placeHolder: 'Choose theme' }
    );
    const darkTheme = theme?.label.includes('Dark') ?? true;

    const options: AppOptions = {
        title,
        includePresetManager,
        includeExportButtons,
        darkTheme
    };

    const html = generateBaseApp(options);

    // Determine output path
    let outputUri: vscode.Uri;

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const wsRoot = vscode.workspace.workspaceFolders[0].uri;
        outputUri = vscode.Uri.joinPath(wsRoot, 'index.html');
    } else {
        const saveUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('index.html'),
            filters: { 'HTML Files': ['html'] }
        });
        if (!saveUri) { return; }
        outputUri = saveUri;
    }

    // Check if file exists
    try {
        await vscode.workspace.fs.stat(outputUri);
        const overwrite = await vscode.window.showWarningMessage(
            `${path.basename(outputUri.fsPath)} already exists. Overwrite?`,
            'Yes', 'No'
        );
        if (overwrite !== 'Yes') { return; }
    } catch {
        // File doesn't exist, proceed
    }

    await vscode.workspace.fs.writeFile(outputUri, Buffer.from(html, 'utf-8'));

    // Open the file
    const doc = await vscode.workspace.openTextDocument(outputUri);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(
        `✨ Lab app "${title}" created! Use "Lab: Live Preview" to see it in action.`
    );
}
