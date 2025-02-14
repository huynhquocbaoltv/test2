// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CodeLensProvider } from "./codeLensProvider";
import { WebViewProvider } from "./webViewProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const webViewProvider = new WebViewProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    {
      scheme: "file",
    },
    new CodeLensProvider()
  );
  const webViewDisposable = vscode.window.registerWebviewViewProvider(
    "ltv-tech-talk-view",
    webViewProvider
  );

  context.subscriptions.push(codeLensDisposable);
  context.subscriptions.push(webViewDisposable);
  context.subscriptions.push(
    vscode.commands.registerCommand("ltv-tech-talk.analyzeCode", (code) => {
      if (!code) return;
      webViewProvider.analyzeCode(code);
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
