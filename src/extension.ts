/**
 * Single-File Lab Studio — Extension Entry Point
 * Registers all commands and activates the extension.
 */

import * as vscode from 'vscode';
import { newAppCommand } from './commands/newApp';
import { importSpecCommand } from './commands/importSpec';
import { publishReadyCommand } from './commands/publishReady';
import { PreviewPanel } from './preview/PreviewPanel';
import { LabViewProvider } from './views/LabViewProvider';

export function activate(context: vscode.ExtensionContext): void {
    console.log('Single-File Lab Studio activated');

    const provider = new LabViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(LabViewProvider.viewType, provider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('lab.newApp', newAppCommand)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('lab.importSpec', importSpecCommand)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('lab.publishReady', publishReadyCommand)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('lab.preview', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('Open an HTML file to preview it.');
                return;
            }

            if (!editor.document.fileName.endsWith('.html')) {
                vscode.window.showWarningMessage('Lab Preview works with HTML files only.');
                return;
            }

            PreviewPanel.createOrShow(editor.document.uri);
        })
    );

    // Status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(beaker) Lab Studio';
    statusBar.tooltip = 'Single-File Lab Studio';
    statusBar.command = 'lab.newApp';
    statusBar.show();
    context.subscriptions.push(statusBar);
}

export function deactivate(): void {
    // Cleanup
}
