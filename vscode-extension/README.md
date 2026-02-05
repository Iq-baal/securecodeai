# SecureCode AI - VS Code Extension

This is the companion extension for the SecureCode AI platform.

## How to Run Locally

1.  **Prerequisites**: Ensure you have Node.js and VS Code installed.
2.  **Navigate**: Open a terminal in the `vscode-extension` folder.
    ```bash
    cd vscode-extension
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Open in VS Code**:
    ```bash
    code .
    ```
5.  **Run Extension**:
    *   Press `F5` to open a new "Extension Development Host" window.
    *   Open any file with code.
    *   Run the command `SecureCode AI: Scan Current File` from the Command Palette (`Ctrl+Shift+P`).

## Features

*   **Scan Current File**: Analyze the active file for vulnerabilities.
*   **Inline Diagnostics**: View security warnings directly in the editor.
*   **Quick Fixes**: Apply AI-suggested secure patches with one click.
