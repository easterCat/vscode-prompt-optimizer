import * as vscode from 'vscode';
import { PromptSidebarProvider } from './webview/promptSidebar';
import { ModelConfigManager } from './config/modelConfig';
import { PromptOptimizer } from './optimizer/promptOptimizer';

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

  // Register command to optimize clipboard content
  const configManager = new ModelConfigManager(context);
  const optimizer = new PromptOptimizer(configManager);

  const optimizeInPlaceCmd = vscode.commands.registerCommand(
    'promptAlchemy.optimizeInPlace',
    async () => {
      // Read from clipboard
      const clipboardText = await vscode.env.clipboard.readText();
      if (!clipboardText) {
        vscode.window.showWarningMessage(
          'Clipboard is empty. Copy some text first, then try again.'
        );
        return;
      }

      // Check configuration
      if (!configManager.isConfigured()) {
        vscode.window.showErrorMessage(
          'Prompt Alchemy is not configured. Please set your API key and model in the sidebar first.'
        );
        return;
      }

      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Prompt Alchemy',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Optimizing prompt...' });
          return await optimizer.optimize(clipboardText);
        }
      );

      if (!result) {
        return; // Progress was cancelled
      }

      if (result.success && result.optimizedPrompt) {
        await vscode.env.clipboard.writeText(result.optimizedPrompt);
        vscode.window.showInformationMessage(
          '✅ Prompt optimized and copied to clipboard. Paste it with Ctrl+V.'
        );
      } else {
        vscode.window.showErrorMessage(
          `Optimization failed: ${result.error || 'Unknown error'}`
        );
      }
    }
  );

  context.subscriptions.push(
    sidebarRegistration,
    sendSelectionCmd,
    optimizeInPlaceCmd
  );
}

export function deactivate() {}
