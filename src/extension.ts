import * as vscode from 'vscode';
import { PromptSidebarProvider } from './webview/promptSidebar';

export function activate(context: vscode.ExtensionContext) {
  // Register the sidebar webview provider
  const sidebarProvider = new PromptSidebarProvider(context.extensionUri, context);
  const sidebarRegistration = vscode.window.registerWebviewViewProvider(
    PromptSidebarProvider.viewType,
    sidebarProvider,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  // Register command to send selected text from editor to sidebar
  const sendSelectionCmd = vscode.commands.registerCommand(
    'promptAlchemy.sendSelection',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor found.');
        return;
      }
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage('No text selected.');
        return;
      }
      sidebarProvider.sendTextToInput(selection);
    }
  );

  context.subscriptions.push(sidebarRegistration, sendSelectionCmd);
}

export function deactivate() {}
