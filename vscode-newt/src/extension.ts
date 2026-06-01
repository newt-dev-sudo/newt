import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = "Newt";
  statusBarItem.tooltip = "Run the current Newt bot";
  statusBarItem.command = "newt.run";

  const runCommand = vscode.commands.registerCommand("newt.run", () => {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document?.languageId !== "newt") {
      vscode.window.showInformationMessage("Open a .newt file before running Newt.");
      return;
    }

    const terminal = vscode.window.createTerminal("Newt Bot");
    terminal.show();
    terminal.sendText(`newt run "${editor.document.uri.fsPath}"`);
  });

  const updateStatus = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === "newt") {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  context.subscriptions.push(
    runCommand,
    statusBarItem,
    vscode.window.onDidChangeActiveTextEditor(updateStatus),
    vscode.workspace.onDidOpenTextDocument(updateStatus)
  );

  updateStatus();
}

export function deactivate(): void {
  statusBarItem?.dispose();
}
