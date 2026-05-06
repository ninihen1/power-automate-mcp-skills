const vscode = require('vscode');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const copilotCli = require('./lib/copilot-cli-bridge');

const DEFAULT_URL = 'https://mcp.flowstudio.app/mcp';
const SIGNUP_URL = 'https://mcp.flowstudio.app';
const SECRET_PREFIX = 'flowstudio.apiKey.';
const WELCOME_SHOWN_KEY = 'flowstudio.welcomeShownVersion';
const CURRENT_VERSION = '0.5.1';

/** @type {vscode.SecretStorage} */
let secrets;

function getServers() {
    return vscode.workspace.getConfiguration('flowstudio.mcp').get('servers', []);
}

async function saveServers(servers) {
    await vscode.workspace.getConfiguration('flowstudio.mcp')
        .update('servers', servers, vscode.ConfigurationTarget.Global);
}

async function activate(context) {
    secrets = context.secrets;

    // Migrate legacy keys from settings to SecretStorage (one-time)
    await migrateKeys();

    // Backfill IDs on connections that don't have one
    await backfillIds();

    // Bootstrap GitHub Copilot CLI (writes ~/.copilot/skills/ + mcp-config.json)
    // when detected. Idempotent — version-stamped, skipped when current.
    bootstrapCopilotCli(context).catch((err) => {
        console.error('[flowstudio] Copilot CLI bootstrap failed:', err);
    });

    const provider = vscode.lm.registerMcpServerDefinitionProvider(
        'flowstudioMcp',
        {
            provideMcpServerDefinitions() {
                const servers = getServers();

                if (servers.length === 0) {
                    return [
                        new vscode.McpHttpServerDefinition(
                            'Flow Studio MCP',
                            vscode.Uri.parse(DEFAULT_URL),
                            { 'User-Agent': 'FlowStudio-MCP/1.0' },
                        ),
                    ];
                }

                return servers.map((server) => {
                    const url = server.serverUrl || DEFAULT_URL;
                    return new vscode.McpHttpServerDefinition(
                        server.label || 'Flow Studio MCP',
                        vscode.Uri.parse(url),
                        { 'User-Agent': 'FlowStudio-MCP/1.0', 'x-flowstudio-id': server.id },
                    );
                });
            },

            async resolveMcpServerDefinition(definition) {
                // Look up API key by stable ID stored in headers
                const id = definition.headers && definition.headers['x-flowstudio-id'];
                const apiKey = id ? await secrets.get(SECRET_PREFIX + id) : undefined;

                if (apiKey) {
                    definition.headers = {
                        ...definition.headers,
                        'x-api-key': apiKey,
                    };
                    delete definition.headers['x-flowstudio-id'];
                    return definition;
                }

                // No key — prompt user
                const action = await vscode.window.showInformationMessage(
                    `Flow Studio MCP needs an API key for "${definition.label}".`,
                    'Add API Key',
                    'Get API Key',
                );

                if (action === 'Add API Key') {
                    const key = await promptForApiKey(definition.label);
                    if (key) {
                        // Find or create connection
                        const servers = getServers();
                        let server = servers.find((s) => s.label === definition.label);
                        if (!server) {
                            server = { id: generateId(), label: definition.label };
                            servers.push(server);
                            await saveServers(servers);
                        }
                        await secrets.store(SECRET_PREFIX + server.id, key);
                        definition.headers = {
                            ...definition.headers,
                            'x-api-key': key,
                        };
                        delete definition.headers['x-flowstudio-id'];
                        return definition;
                    }
                } else if (action === 'Get API Key') {
                    vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
                }

                return undefined;
            },
        }
    );

    const addCmd = vscode.commands.registerCommand('flowstudio.addConnection', () => addConnection());
    const removeCmd = vscode.commands.registerCommand('flowstudio.removeConnection', removeConnection);
    const listCmd = vscode.commands.registerCommand('flowstudio.listConnections', listConnections);

    context.subscriptions.push(provider, addCmd, removeCmd, listCmd);

    // Show welcome once per version, only when no connections exist
    const shownVersion = context.globalState.get(WELCOME_SHOWN_KEY, '');
    if (getServers().length === 0 && shownVersion !== CURRENT_VERSION) {
        showWelcome();
        context.globalState.update(WELCOME_SHOWN_KEY, CURRENT_VERSION);
    }
}

function generateId() {
    return crypto.randomBytes(8).toString('hex');
}

async function bootstrapCopilotCli(context) {
    const homeDir = os.homedir();
    if (!copilotCli.isCopilotCliInstalled()) {
        return;
    }

    const bundledSkillsDir = path.join(context.extensionPath, 'skills');
    const skillResult = copilotCli.installSkillsIfNeeded(homeDir, bundledSkillsDir, CURRENT_VERSION);
    if (skillResult.installed) {
        console.log(`[flowstudio] installed ${skillResult.skills.length} skills to ~/.copilot/skills/: ${skillResult.skills.join(', ')}`);
    }

    // Sync existing VS Code connections into ~/.copilot/mcp-config.json so a user
    // who already added connections in VS Code gets them available in `gh copilot` too.
    const servers = getServers();
    for (const server of servers) {
        const apiKey = await secrets.get(SECRET_PREFIX + server.id);
        if (!apiKey) continue;
        try {
            copilotCli.upsertServer(homeDir, {
                label: server.label,
                url: server.serverUrl || DEFAULT_URL,
                apiKey,
            });
        } catch (err) {
            console.error(`[flowstudio] failed to sync "${server.label}" to Copilot CLI:`, err);
        }
    }
}

async function migrateKeys() {
    const config = vscode.workspace.getConfiguration('flowstudio.mcp');
    const servers = config.get('servers', []);
    let migrated = false;

    for (const server of servers) {
        if (server.apiKey) {
            if (!server.id) {
                server.id = generateId();
            }
            await secrets.store(SECRET_PREFIX + server.id, server.apiKey);
            delete server.apiKey;
            migrated = true;
        }
    }

    if (migrated) {
        await config.update('servers', servers, vscode.ConfigurationTarget.Global);
    }
}

async function backfillIds() {
    const config = vscode.workspace.getConfiguration('flowstudio.mcp');
    const servers = config.get('servers', []);
    let changed = false;

    for (const server of servers) {
        if (!server.id) {
            server.id = generateId();
            changed = true;
        }
    }

    if (changed) {
        await config.update('servers', servers, vscode.ConfigurationTarget.Global);
    }
}

async function showWelcome() {
    const action = await vscode.window.showInformationMessage(
        'Flow Studio MCP installed. Connect your AI agent to Power Automate cloud flows.',
        'Add Connection',
        'Get API Key',
    );

    if (action === 'Get API Key') {
        vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
    } else if (action === 'Add Connection') {
        await addConnection();
    }
}

async function addConnection() {
    const label = await vscode.window.showInputBox({
        title: 'Flow Studio: Add Connection (1/2)',
        prompt: 'Name this connection (e.g. your tenant or client name)',
        placeHolder: 'e.g. Contoso, Northwind',
        ignoreFocusOut: true,
        validateInput(value) {
            if (!value || !value.trim()) return 'Name is required';
            const existing = getServers();
            if (existing.some((s) => s.label.toLowerCase() === value.trim().toLowerCase())) {
                return `"${value.trim()}" already exists. Use a different name.`;
            }
            return undefined;
        },
    });
    if (!label) return undefined;

    const apiKey = await promptForApiKey(label);
    if (!apiKey) return undefined;

    const id = generateId();
    const servers = getServers();
    servers.push({ id, label: label.trim() });
    await saveServers(servers);
    await secrets.store(SECRET_PREFIX + id, apiKey);

    // Mirror into Copilot CLI config if it's installed.
    let cliMessage = '';
    try {
        const result = copilotCli.upsertServer(os.homedir(), {
            label: label.trim(),
            url: DEFAULT_URL,
            apiKey,
        });
        if (result.written) {
            cliMessage = ' Also wired into Copilot CLI.';
        }
    } catch (err) {
        console.error('[flowstudio] Copilot CLI sync failed on add:', err);
    }

    vscode.window.showInformationMessage(
        `Flow Studio: "${label}" connected.${cliMessage} Reload to activate.`,
        'Reload Window',
    ).then((action) => {
        if (action === 'Reload Window') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    });

    return { id, label, apiKey };
}

async function promptForApiKey(label) {
    const result = await vscode.window.showInputBox({
        title: `Flow Studio: Add Connection (2/2) — ${label}`,
        prompt: 'Paste the API key for this tenant',
        placeHolder: 'API key from https://mcp.flowstudio.app',
        password: true,
        ignoreFocusOut: true,
    });

    if (result === undefined) {
        const action = await vscode.window.showInformationMessage(
            'Need an API key? Sign up at mcp.flowstudio.app',
            'Open Sign Up',
        );
        if (action === 'Open Sign Up') {
            vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
        }
    }

    return result || undefined;
}

async function removeConnection() {
    const servers = getServers();
    if (servers.length === 0) {
        vscode.window.showInformationMessage('No Flow Studio connections configured.');
        return;
    }

    const picked = await vscode.window.showQuickPick(
        servers.map((s, i) => ({ label: s.label, description: 'Flow Studio MCP', index: i, id: s.id })),
        { title: 'Flow Studio: Remove Connection', placeHolder: 'Select a connection to remove' },
    );
    if (!picked) return;

    await secrets.delete(SECRET_PREFIX + picked.id);
    servers.splice(picked.index, 1);
    await saveServers(servers);

    // Mirror removal into Copilot CLI config if present.
    try {
        copilotCli.removeServer(os.homedir(), picked.label);
    } catch (err) {
        console.error('[flowstudio] Copilot CLI sync failed on remove:', err);
    }

    vscode.window.showInformationMessage(
        `Flow Studio: "${picked.label}" removed. Reload to apply.`,
        'Reload Window',
    ).then((action) => {
        if (action === 'Reload Window') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    });
}

async function listConnections() {
    const servers = getServers();
    if (servers.length === 0) {
        const action = await vscode.window.showInformationMessage(
            'No Flow Studio connections configured.',
            'Add Connection',
        );
        if (action === 'Add Connection') {
            await addConnection();
        }
        return;
    }

    await vscode.window.showQuickPick(
        servers.map((s) => ({
            label: s.label,
            description: s.serverUrl || DEFAULT_URL,
            detail: 'API key stored securely',
        })),
        { title: `Flow Studio: ${servers.length} Connection(s)`, placeHolder: 'Your configured tenants' },
    );
}

function deactivate() {}

module.exports = { activate, deactivate };
