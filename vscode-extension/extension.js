const vscode = require('vscode');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const fs = require('fs');
const copilotCli = require('./lib/copilot-cli-bridge');

const DEFAULT_URL = 'https://mcp.flowstudio.app/mcp';
const SIGNUP_URL = 'https://mcp.flowstudio.app';
const SECRET_PREFIX = 'flowstudio.apiKey.';
const WELCOME_SHOWN_KEY = 'flowstudio.welcomeShownVersion';
const BOOTSTRAP_NOTIFIED_KEY = 'flowstudio.cliBootstrapNotifiedVersion';
const CURRENT_VERSION = '0.6.0';

/** @type {vscode.SecretStorage} */
let secrets;
/** @type {vscode.OutputChannel} */
let output;

function getServers() {
    return vscode.workspace.getConfiguration('flowstudio.mcp').get('servers', []);
}

async function saveServers(servers) {
    await vscode.workspace.getConfiguration('flowstudio.mcp')
        .update('servers', servers, vscode.ConfigurationTarget.Global);
}

async function activate(context) {
    secrets = context.secrets;
    output = vscode.window.createOutputChannel('FlowStudio MCP');
    context.subscriptions.push(output);

    output.appendLine(`[activate] FlowStudio MCP v${CURRENT_VERSION} starting`);

    await migrateKeys();
    await backfillIds();

    // Bootstrap GitHub Copilot CLI in background. Show toast once per version
    // when something is wired up so the user knows to restart their CLI session.
    bootstrapCopilotCli(context).then((result) => {
        if (result && result.notify) {
            showCliBootstrapToast(result, context);
        }
    }).catch((err) => {
        output.appendLine(`[bootstrap] FAILED: ${err.message || err}`);
    });

    const provider = vscode.lm.registerMcpServerDefinitionProvider(
        'flowstudioMcp',
        {
            provideMcpServerDefinitions() {
                const servers = getServers();
                if (servers.length === 0) {
                    return [
                        new vscode.McpHttpServerDefinition(
                            'FlowStudio MCP',
                            vscode.Uri.parse(DEFAULT_URL),
                            { 'User-Agent': 'FlowStudio-MCP/1.0' },
                        ),
                    ];
                }
                return servers.map((server) => {
                    const url = server.serverUrl || DEFAULT_URL;
                    return new vscode.McpHttpServerDefinition(
                        server.label || 'FlowStudio MCP',
                        vscode.Uri.parse(url),
                        { 'User-Agent': 'FlowStudio-MCP/1.0', 'x-flowstudio-id': server.id },
                    );
                });
            },

            async resolveMcpServerDefinition(definition, token) {
                const id = definition.headers && definition.headers['x-flowstudio-id'];
                const apiKey = id ? await secrets.get(SECRET_PREFIX + id) : undefined;

                if (apiKey) {
                    // Probe before attaching auth — a dead server here causes
                    // VS Code Copilot Chat to spin "in progress" while it waits
                    // forever on handshake. 3s timeout, then skip the server.
                    const url = definition.uri && definition.uri.toString();
                    if (url) {
                        const probe = await copilotCli.probeServer({
                            url,
                            apiKey,
                            timeoutMs: 3000,
                            cancellationToken: token,
                        });
                        if (token && token.isCancellationRequested) {
                            output && output.appendLine(`[resolve] cancelled "${definition.label}"`);
                            return undefined;
                        }
                        if (!probe.ok) {
                            output && output.appendLine(`[resolve] probe FAIL "${definition.label}" → ${probe.error}; skipping`);
                            return undefined;
                        }
                        output && output.appendLine(`[resolve] probe OK "${definition.label}" (HTTP ${probe.status})`);
                    }
                    definition.headers = {
                        ...definition.headers,
                        'x-api-key': apiKey,
                    };
                    delete definition.headers['x-flowstudio-id'];
                    return definition;
                }

                const action = await vscode.window.showInformationMessage(
                    `FlowStudio MCP needs an API key for "${definition.label}".`,
                    'Add API Key',
                    'Get API Key',
                );

                if (action === 'Add API Key') {
                    const key = await promptForApiKey(definition.label);
                    if (key) {
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

    const addCmd = vscode.commands.registerCommand('flowstudio.addConnection', () => addConnection(context));
    const removeCmd = vscode.commands.registerCommand('flowstudio.removeConnection', () => removeConnection(context));
    const listCmd = vscode.commands.registerCommand('flowstudio.listConnections', () => listConnections(context));
    const statusCmd = vscode.commands.registerCommand('flowstudio.showStatus', () => showSetupStatus(context));
    const syncCmd = vscode.commands.registerCommand('flowstudio.syncToCopilotCli', () => syncToCopilotCli(context, true));

    context.subscriptions.push(provider, addCmd, removeCmd, listCmd, statusCmd, syncCmd);

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
    const cliInstalled = copilotCli.isCopilotCliInstalled();
    output.appendLine(`[bootstrap] Copilot CLI detected: ${cliInstalled}`);

    if (!cliInstalled) {
        return null;
    }

    const bundledSkillsDir = path.join(context.extensionPath, 'skills');
    const skillResult = copilotCli.installSkillsIfNeeded(homeDir, bundledSkillsDir, CURRENT_VERSION);
    if (skillResult.installed) {
        output.appendLine(`[bootstrap] installed ${skillResult.skills.length} skills to ~/.copilot/skills/: ${skillResult.skills.join(', ')}`);
    } else {
        output.appendLine(`[bootstrap] skills already current (${skillResult.skipped})`);
    }

    let serversWritten = 0;
    const failedServers = [];
    const servers = getServers();
    for (const server of servers) {
        const apiKey = await secrets.get(SECRET_PREFIX + server.id);
        if (!apiKey) {
            output.appendLine(`[bootstrap] skipping "${server.label}" — no stored API key`);
            try { copilotCli.removeServer(homeDir, server.label); } catch { /* ignore */ }
            continue;
        }

        const url = server.serverUrl || DEFAULT_URL;

        // Probe the endpoint before mirroring. A dead/slow server that lands in
        // ~/.copilot/mcp-config.json hangs Copilot CLI's startup handshake for
        // its full timeout (~30s). Skip unreachable servers and remove any
        // stale entry that's already in the config.
        const probe = await copilotCli.probeServer({ url, apiKey, timeoutMs: 3000 });
        if (!probe.ok) {
            output.appendLine(`[bootstrap] probe FAIL "${server.label}" → ${probe.error}; not mirroring (and removing if previously mirrored)`);
            failedServers.push({ label: server.label, error: probe.error });
            try { copilotCli.removeServer(homeDir, server.label); } catch { /* ignore */ }
            continue;
        }
        output.appendLine(`[bootstrap] probe OK "${server.label}" (HTTP ${probe.status})`);

        try {
            const r = copilotCli.upsertServer(homeDir, { label: server.label, url, apiKey });
            if (r.written) {
                serversWritten++;
                output.appendLine(`[bootstrap] mirrored connection "${server.label}" → ${r.key}`);
            }
        } catch (err) {
            output.appendLine(`[bootstrap] FAILED to mirror "${server.label}": ${err.message}`);
            failedServers.push({ label: server.label, error: err.message });
        }
    }

    const lastNotified = context.globalState.get(BOOTSTRAP_NOTIFIED_KEY, '');
    const skillsCurrent = countInstalledSkills(homeDir);

    return {
        notify: lastNotified !== CURRENT_VERSION || failedServers.length > 0,
        cliInstalled: true,
        skillsInstalled: skillResult.installed ? skillResult.skills.length : skillsCurrent,
        serversWritten,
        failedServers,
        configPath: path.join(homeDir, '.copilot', 'mcp-config.json'),
    };
}

function countInstalledSkills(homeDir) {
    const skillsDir = path.join(homeDir, '.copilot', 'skills');
    try {
        return fs.readdirSync(skillsDir).filter((d) => d.startsWith('flowstudio-')).length;
    } catch {
        return 0;
    }
}

async function showCliBootstrapToast(result, context) {
    const action = await vscode.window.showInformationMessage(
        buildCliStatusMessage(result),
        'Show Status',
        'Open Output',
        'Got it',
    );
    if (action === 'Open Output') output.show();
    if (action === 'Show Status') {
        showSetupStatus(context);
    }
    context.globalState.update(BOOTSTRAP_NOTIFIED_KEY, CURRENT_VERSION);
}

function buildCliStatusMessage(result) {
    const failedCount = result.failedServers ? result.failedServers.length : 0;
    if (failedCount > 0) {
        const connectionWord = failedCount === 1 ? 'connection' : 'connections';
        return `FlowStudio set up Copilot CLI skills (${result.skillsInstalled}). ${failedCount} saved tenant ${connectionWord} need attention before CLI sync: ${formatServerLabels(result.failedServers)}. They were left out of ~/.copilot/mcp-config.json. Restart \`copilot\` if a session is open.`;
    }

    const serverWord = result.serversWritten === 1 ? 'server' : 'servers';
    return `FlowStudio: wired into Copilot CLI (${result.skillsInstalled} skills, ${result.serversWritten} ${serverWord} in ~/.copilot/). Restart \`copilot\` if a session is open.`;
}

function formatServerLabels(servers, limit = 3) {
    const labels = servers.map((server) => `"${server.label}"`);
    if (labels.length <= limit) {
        return labels.join(', ');
    }
    return `${labels.slice(0, limit).join(', ')} and ${labels.length - limit} more`;
}

async function showSetupStatus(context) {
    const homeDir = os.homedir();
    const items = [];

    items.push({
        label: '$(check) VS Code Copilot Chat',
        description: 'wired (5 skills via chatSkills)',
        detail: 'Runs inside VS Code — no filesystem write needed. Skills available to Copilot Chat.',
    });

    const cliInstalled = copilotCli.isCopilotCliInstalled();
    if (cliInstalled) {
        const skillsDir = path.join(homeDir, '.copilot', 'skills');
        const stampPath = path.join(skillsDir, '.flowstudio-mcp-version');
        const installedSkillsVersion = fs.existsSync(stampPath)
            ? fs.readFileSync(stampPath, 'utf8').trim()
            : 'unknown';
        const skillCount = countInstalledSkills(homeDir);

        const configPath = path.join(homeDir, '.copilot', 'mcp-config.json');
        let serverCount = 0;
        let configMtime = 'never';
        if (fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                serverCount = Object.keys(config.mcpServers || {}).filter((k) => k.startsWith('flowstudio-')).length;
                configMtime = fs.statSync(configPath).mtime.toLocaleString();
            } catch (err) {
                output.appendLine(`[status] mcp-config.json parse error: ${err.message}`);
            }
        }
        items.push({
            label: '$(check) GitHub Copilot CLI',
            description: `wired (${skillCount} skills, ${serverCount} server${serverCount === 1 ? '' : 's'})`,
            detail: `Skills v${installedSkillsVersion} · Config last written ${configMtime} · Restart \`copilot\` after changes`,
        });
    } else {
        items.push({
            label: '$(circle-slash) GitHub Copilot CLI',
            description: 'not detected on PATH',
            detail: 'Install: npm install -g @github/copilot — then run "FlowStudio: Sync to Copilot CLI"',
        });
    }

    const servers = getServers();
    items.push({
        label: '$(server) VS Code Connections',
        description: `${servers.length} configured`,
        detail: servers.length > 0
            ? servers.map((s) => s.label).join(', ')
            : 'None yet — pick "Add a new connection" below',
    });

    items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });

    items.push({ label: '$(plus) Add a new tenant connection', action: 'add' });
    if (servers.length > 0) {
        items.push({ label: '$(trash) Remove a tenant connection', action: 'remove' });
        items.push({ label: '$(list-unordered) List connections', action: 'list' });
    }
    items.push({ label: '$(sync) Sync to Copilot CLI now', action: 'sync' });
    items.push({ label: '$(output) Open FlowStudio output log', action: 'output' });
    if (cliInstalled) {
        items.push({ label: '$(file-code) Open ~/.copilot/mcp-config.json', action: 'open-config' });
    }

    const picked = await vscode.window.showQuickPick(items, {
        title: 'FlowStudio Setup Status',
        placeHolder: 'Surface state — pick an action',
    });

    if (!picked || !picked.action) return;
    if (picked.action === 'add') {
        await addConnection(context);
    } else if (picked.action === 'remove') {
        await removeConnection(context);
    } else if (picked.action === 'list') {
        await listConnections(context);
    } else if (picked.action === 'sync') {
        await syncToCopilotCli(context, true);
    } else if (picked.action === 'output') {
        output.show();
    } else if (picked.action === 'open-config') {
        const configPath = vscode.Uri.file(path.join(homeDir, '.copilot', 'mcp-config.json'));
        try {
            await vscode.commands.executeCommand('vscode.open', configPath);
        } catch (err) {
            vscode.window.showErrorMessage(`Could not open config: ${err.message}`);
        }
    }
}

async function syncToCopilotCli(context, showToast) {
    output.show();
    output.appendLine('[sync] manual sync triggered');
    const result = await bootstrapCopilotCli(context);
    if (!result || !result.cliInstalled) {
        if (showToast) {
            const action = await vscode.window.showWarningMessage(
                'Copilot CLI not detected on PATH. Install with: npm install -g @github/copilot',
                'Open Output',
            );
            if (action === 'Open Output') output.show();
        }
        return;
    }
    if (showToast) {
        const action = await vscode.window.showInformationMessage(
            buildCliStatusMessage(result),
            'Show Status',
            'Open Output',
        );
        if (action === 'Show Status') {
            showSetupStatus(context);
        } else if (action === 'Open Output') {
            output.show();
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
        'FlowStudio MCP installed. Connect your AI agent to Power Automate cloud flows.',
        'Add Connection',
        'Get API Key',
    );
    if (action === 'Get API Key') {
        vscode.env.openExternal(vscode.Uri.parse(SIGNUP_URL));
    } else if (action === 'Add Connection') {
        await addConnection();
    }
}

async function addConnection(context) {
    const label = await vscode.window.showInputBox({
        title: 'FlowStudio: Add Connection (1/2)',
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

    let cliMessage = '';
    try {
        // Probe first — don't mirror dead endpoints, they'd hang Copilot CLI startup.
        const probe = await copilotCli.probeServer({ url: DEFAULT_URL, apiKey, timeoutMs: 3000 });
        if (!probe.ok) {
            cliMessage = ` Skipped Copilot CLI mirror — server probe failed (${probe.error}). Fix and run "FlowStudio: Sync to Copilot CLI" to retry.`;
            output && output.appendLine(`[add] probe FAIL "${label.trim()}" → ${probe.error}; not mirroring`);
        } else {
            const r = copilotCli.upsertServer(os.homedir(), {
                label: label.trim(),
                url: DEFAULT_URL,
                apiKey,
            });
            if (r.written) {
                cliMessage = ' Also wired into Copilot CLI — restart `copilot` if a session is open.';
                output && output.appendLine(`[add] mirrored "${label.trim()}" → ${r.key} (probe HTTP ${probe.status})`);
            }
        }
    } catch (err) {
        output && output.appendLine(`[add] FAILED to mirror "${label.trim()}": ${err.message}`);
    }

    vscode.window.showInformationMessage(
        `FlowStudio: "${label}" connected.${cliMessage} Reload to activate.`,
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
        title: `FlowStudio: Add Connection (2/2) — ${label}`,
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

async function removeConnection(context) {
    const servers = getServers();
    if (servers.length === 0) {
        vscode.window.showInformationMessage('No FlowStudio connections configured.');
        return;
    }
    const picked = await vscode.window.showQuickPick(
        servers.map((s, i) => ({ label: s.label, description: 'FlowStudio MCP', index: i, id: s.id })),
        { title: 'FlowStudio: Remove Connection', placeHolder: 'Select a connection to remove' },
    );
    if (!picked) return;

    await secrets.delete(SECRET_PREFIX + picked.id);
    servers.splice(picked.index, 1);
    await saveServers(servers);

    try {
        const r = copilotCli.removeServer(os.homedir(), picked.label);
        if (r.written) {
            output && output.appendLine(`[remove] removed "${picked.label}" from Copilot CLI config`);
        }
    } catch (err) {
        output && output.appendLine(`[remove] FAILED Copilot CLI sync: ${err.message}`);
    }

    vscode.window.showInformationMessage(
        `FlowStudio: "${picked.label}" removed. Reload to apply.`,
        'Reload Window',
    ).then((action) => {
        if (action === 'Reload Window') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    });
}

async function listConnections(context) {
    const servers = getServers();
    if (servers.length === 0) {
        const action = await vscode.window.showInformationMessage(
            'No FlowStudio connections configured.',
            'Add Connection',
        );
        if (action === 'Add Connection') {
            await addConnection(context);
        }
        return;
    }
    await vscode.window.showQuickPick(
        servers.map((s) => ({
            label: s.label,
            description: s.serverUrl || DEFAULT_URL,
            detail: 'API key stored securely',
        })),
        { title: `FlowStudio: ${servers.length} Connection(s)`, placeHolder: 'Your configured tenants' },
    );
}

function deactivate() {}

module.exports = { activate, deactivate };
