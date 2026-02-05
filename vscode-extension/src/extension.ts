import * as vscode from 'vscode';

// Mock types for demonstration in the extension context
interface Vulnerability {
    lineStart: number;
    lineEnd: number;
    severity: string;
    description: string;
    fix: string;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('SecureCode AI is now active!');

    // Register the "Scan File" command
	let scanFileDisposable = vscode.commands.registerCommand('securecode-ai.scanFile', async () => {
		const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to scan.');
            return;
        }

        const document = editor.document;
        const code = document.getText();
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "SecureCode AI: Scanning...",
            cancellable: false
        }, async (progress) => {
            try {
                // In a real extension, this would call the API or embedded Gemini Logic
                // simulating a delay and response for demonstration
                await new Promise(r => setTimeout(r, 2000));
                
                // Mock findings
                const findings: Vulnerability[] = [
                    {
                        lineStart: 5,
                        lineEnd: 5,
                        severity: 'High',
                        description: 'Hardcoded API Key detected.',
                        fix: 'process.env.API_KEY'
                    }
                ];

                const diagnosticCollection = vscode.languages.createDiagnosticCollection('securecode-ai');
                const diagnostics: vscode.Diagnostic[] = [];

                findings.forEach(finding => {
                    const range = new vscode.Range(finding.lineStart - 1, 0, finding.lineEnd - 1, 1000);
                    const diagnostic = new vscode.Diagnostic(
                        range, 
                        `[${finding.severity}] ${finding.description}`, 
                        finding.severity === 'High' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.source = 'SecureCode AI';
                    diagnostics.push(diagnostic);
                });

                diagnosticCollection.set(document.uri, diagnostics);
                vscode.window.showInformationMessage(`Scan complete. Found ${findings.length} issues.`);

            } catch (error) {
                vscode.window.showErrorMessage('Error during scan: ' + error);
            }
        });
	});

	context.subscriptions.push(scanFileDisposable);

    // Register Quick Fix Provider
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('*', new SecureCodeFixProvider(), {
            providedCodeActionKinds: SecureCodeFixProvider.providedCodeActionKinds
        })
    );
}

class SecureCodeFixProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
        return context.diagnostics
            .filter(diagnostic => diagnostic.source === 'SecureCode AI')
            .map(diagnostic => this.createFix(document, diagnostic));
    }

    private createFix(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const fix = new vscode.CodeAction(`Apply Secure Fix`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        // In a real app, the fix text would come from the AI result metadata
        fix.edit.replace(document.uri, diagnostic.range, 'process.env.SECRET_KEY'); 
        fix.diagnostics = [diagnostic];
        fix.isPreferred = true;
        return fix;
    }
}

export function deactivate() {}