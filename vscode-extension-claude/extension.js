const vscode = require('vscode');
const path = require('node:path');
const os = require('node:os');
const { installSkillsIfNeeded } = require('./lib/skills-installer');
const { listConnections, addConnection, removeConnection } = require('./lib/config-writer');

const SIGNUP_URL = 'https://mcp.flowstudio.app';
const WELCOME_SHOWN_KEY = 'flowstudioClaude.welcomeShownVersion';
const DEFAULT_URL = 'https://mcp.flowstudio.app/mcp';

function makeSlug(label) {
    const cleaned = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `flowstudio-${cleaned}`;
}

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
        vscode.commands.registerCommand('flowstudioClaude.addConnection', addConnectionCmd),
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

async function addConnectionCmd() {
    const label = await vscode.window.showInputBox({
        title: 'Flow Studio (Claude): Add Connection (1/2)',
        prompt: 'Name this connection (e.g. your tenant or client name)',
        placeHolder: 'e.g. Contoso, Northwind, OA',
        ignoreFocusOut: true,
        validateInput(value) {
            if (!value || !value.trim()) return 'Name is required';
            const slug = makeSlug(value);
            if (slug === 'flowstudio-') return 'Name must contain at least one letter or digit';
            const existing = listConnections(os.homedir());
            if (existing.some((c) => c.slug === slug)) {
                return `"${value.trim()}" already exists. Use a different name.`;
            }
            return undefined;
        },
    });
    if (!label) return;

    const apiKey = await vscode.window.showInputBox({
        title: `Flow Studio (Claude): Add Connection (2/2) — ${label.trim()}`,
        prompt: 'Paste the API key for this tenant',
        placeHolder: 'API key from https://mcp.flowstudio.app',
        password: true,
        ignoreFocusOut: true,
        validateInput(value) {
            if (!value || value.trim().length < 20) return 'API key looks too short — paste the full key';
            return undefined;
        },
    });
    if (!apiKey) {
        const action = await vscode.window.showInformationMessage(
            'Need an API key? Sign up at mcp.flowstudio.app',
            'Open Sign Up',
        );
        if (action === 'Open Sign Up') {
            vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
        }
        return;
    }

    try {
        addConnection(os.homedir(), {
            slug: makeSlug(label),
            label: label.trim(),
            url: DEFAULT_URL,
            apiKey: apiKey.trim(),
        });
    } catch (err) {
        vscode.window.showErrorMessage(`Flow Studio: failed to write ~/.claude.json — ${err.message}`);
        return;
    }

    const reload = await vscode.window.showInformationMessage(
        `Flow Studio: "${label.trim()}" connected. Reload Window to activate the MCP server in Claude Code.`,
        'Reload Window',
    );
    if (reload === 'Reload Window') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}

function deactivate() {}

module.exports = { activate, deactivate };
