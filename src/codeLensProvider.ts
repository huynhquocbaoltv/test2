import * as vscode from "vscode";

export class CodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const codeLens: vscode.CodeLens[] = [];

    const functionRegex = /function\s+(\w+)\s*\(/g;

    let match;
    const text = document.getText();
    while ((match = functionRegex.exec(text))) {
      const functionName = match[1];

      const position = document.positionAt(match.index);

      const code = this.extractFunctionCode(text, match.index);

      const comand: vscode.Command = {
        title: "Phân tích Code",
        command: "ltv-tech-talk.analyzeCode",
        arguments: [code],
      };

      codeLens.push(
        new vscode.CodeLens(new vscode.Range(position, position), comand)
      );
    }
    return codeLens;
  }

  extractFunctionCode(text: string, startOffset: number): string | null {
    const openBraceIndex = text.indexOf("{", startOffset);
    if (openBraceIndex === -1) return null;

    let braceCount = 1;
    let endOffset = openBraceIndex + 1;

    while (endOffset < text.length && braceCount > 0) {
      if (text[endOffset] === "{") braceCount++;
      if (text[endOffset] === "}") braceCount--;
      endOffset++;
    }

    if (braceCount !== 0) return null; // Trường hợp lỗi cú pháp

    return text.substring(startOffset, endOffset);
  }
}
