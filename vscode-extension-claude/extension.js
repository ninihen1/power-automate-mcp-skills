const vscode = require('vscode');
const path = require('node:path');
const os = require('node:os');
const { installSkillsIfNeeded } = require('./lib/skills-installer');

const SIGNUP_URL = 'https://mcp.flowstudio.app';
const WELCOME_SHOWN_KEY = 'flowstudioClaude.welcomeShownVersion';

async function activate(context) {
    const extVersion = context.extension.packageJSON.version;
    const bundledSkillsDir = path.join(context.extensionPath, 'skills');

    try {
        const result = installSkillsIfNeeded(os.homedir(), bundledSkillsDir, extVersion);
        if (result.installed) {
            console.log(`[flowstudio-claude] installed ${result.skills.length} skills: ${result.skills.join(', ')}`);
        }
    } catch (err) {
        vscode.window.showErrorMessage(`Flow Studio: failed to install skills — ${err.message}`);
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('flowstudioClaude.addConnection', () => {
            vscode.window.showInformationMessage('Add Connection: not implemented yet.');
        }),
        vscode.commands.registerCommand('flowstudioClaude.removeConnection', () => {
            vscode.window.showInformationMessage('Remove Connection: not implemented yet.');
        }),
        vscode.commands.registerCommand('flowstudioClaude.listConnections', () => {
            vscode.window.showInformationMessage('List Connections: not implemented yet.');
        }),
    );

    const shownVersion = context.globalState.get(WELCOME_SHOWN_KEY, '');
    if (shownVersion !== extVersion) {
        showWelcome();
        context.globalState.update(WELCOME_SHOWN_KEY, extVersion);
    }
}

async function showWelcome() {
    const action = await vscode.window.showInformationMessage(
        'Flow Studio MCP for Claude Code installed. Connect your tenant to start using Power Automate flows from Claude.',
        'Add Connection',
        'Get API Key',
    );
    if (action === 'Get API Key') {
        vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
    } else if (action === 'Add Connection') {
        vscode.commands.executeCommand('flowstudioClaude.addConnection');
    }
}

function deactivate() {}

module.exports = { activate, deactivate };
