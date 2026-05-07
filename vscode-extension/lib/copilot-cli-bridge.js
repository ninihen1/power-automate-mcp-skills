// Bridges the Copilot VS Code extension's connections into GitHub Copilot CLI's
// own filesystem-based config. As of May 2026, `gh copilot` reads:
//
//   ~/.copilot/skills/<skill>/SKILL.md   — agent skills
//   ~/.copilot/mcp-config.json           — MCP server config (mcpServers block)
//
// We write to both when the user has Copilot CLI installed (detected by the
// presence of ~/.copilot/). The chatSkills contribution still handles VS Code
// Copilot Chat in-process; this module extends reach to the CLI.

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');

const SKILLS_STAMP = '.flowstudio-mcp-version';
const COPILOT_DIR = '.copilot';
const SKILLS_SUBDIR = 'skills';
const MCP_CONFIG_FILE = 'mcp-config.json';
const FLOWSTUDIO_KEY_PREFIX = 'flowstudio';
const BRIDGE_VERSION = '0.6.0';
const USER_AGENT = `FlowStudio-MCP/${BRIDGE_VERSION}`;

function copilotDir(homeDir) {
    return path.join(homeDir, COPILOT_DIR);
}

// Cache the detection result for the lifetime of this Node process.
let _detected;

// Detect whether GitHub Copilot CLI is actually installed.
//
// Cannot rely on ~/.copilot/ existence — VS Code's Copilot extension
// creates that directory (with `ide/` and `plugins/` subdirs) even when the
// `copilot` CLI binary is not installed.
//
// Walk the PATH looking for the `copilot` binary directly. Avoids spawning
// a child process at activate time, which is faster and dodges the
// Windows `.cmd`/`.exe` resolution dance.
function isCopilotCliInstalled() {
    if (_detected !== undefined) return _detected;

    const pathEnv = process.env.PATH || process.env.Path || '';
    const sep = process.platform === 'win32' ? ';' : ':';
    const dirs = pathEnv.split(sep).filter(Boolean);

    const candidates = process.platform === 'win32'
        ? ['copilot.cmd', 'copilot.exe', 'copilot.bat', 'copilot']
        : ['copilot'];

    for (const dir of dirs) {
        for (const name of candidates) {
            try {
                if (fs.existsSync(path.join(dir, name))) {
                    _detected = true;
                    return true;
                }
            } catch {
                // ignore unreadable PATH entries
            }
        }
    }

    _detected = false;
    return false;
}

function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function installSkillsIfNeeded(homeDir, bundledSkillsDir, extensionVersion) {
    if (!isCopilotCliInstalled()) {
        return { installed: false, skipped: 'copilot-cli-not-detected', skills: [] };
    }
    if (!fs.existsSync(bundledSkillsDir)) {
        throw new Error(`Bundled skills directory not found: ${bundledSkillsDir}`);
    }

    const skillsRoot = path.join(copilotDir(homeDir), SKILLS_SUBDIR);
    const stampPath = path.join(skillsRoot, SKILLS_STAMP);

    if (fs.existsSync(stampPath)) {
        const installedVersion = fs.readFileSync(stampPath, 'utf8').trim();
        if (installedVersion === extensionVersion) {
            return { installed: false, skipped: 'already-current', skills: [] };
        }
    }

    fs.mkdirSync(skillsRoot, { recursive: true });

    const installed = [];
    for (const entry of fs.readdirSync(bundledSkillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const src = path.join(bundledSkillsDir, entry.name);
        const namespacedName = `flowstudio-${entry.name}`;
        const dest = path.join(skillsRoot, namespacedName);
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }
        copyDirSync(src, dest);
        installed.push(namespacedName);
    }

    fs.writeFileSync(stampPath, extensionVersion + '\n');
    return { installed: true, skills: installed };
}

function readMcpConfig(homeDir) {
    const configPath = path.join(copilotDir(homeDir), MCP_CONFIG_FILE);
    if (!fs.existsSync(configPath)) {
        return { mcpServers: {} };
    }
    try {
        const raw = fs.readFileSync(configPath, 'utf8').trim();
        if (!raw) return { mcpServers: {} };
        const parsed = JSON.parse(raw);
        if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
            parsed.mcpServers = {};
        }
        return parsed;
    } catch (err) {
        const error = new Error(`Cannot parse ${configPath}: ${err.message}`);
        error.code = 'PARSE_ERROR';
        error.path = configPath;
        throw error;
    }
}

function writeMcpConfig(homeDir, config) {
    const dir = copilotDir(homeDir);
    fs.mkdirSync(dir, { recursive: true });
    const configPath = path.join(dir, MCP_CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

function serverKey(label) {
    const safe = String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return safe ? `${FLOWSTUDIO_KEY_PREFIX}-${safe}` : `${FLOWSTUDIO_KEY_PREFIX}-default`;
}

function upsertServer(homeDir, { label, url, apiKey }) {
    if (!isCopilotCliInstalled()) {
        return { written: false, skipped: 'copilot-cli-not-detected' };
    }
    const config = readMcpConfig(homeDir);
    const key = serverKey(label);
    config.mcpServers[key] = {
        type: 'http',
        url,
        headers: {
            'x-api-key': apiKey,
            'User-Agent': 'FlowStudio-MCP/1.0',
        },
        tools: ['*'],
    };
    writeMcpConfig(homeDir, config);
    return { written: true, key };
}

function removeServer(homeDir, label) {
    if (!isCopilotCliInstalled()) {
        return { written: false, skipped: 'copilot-cli-not-detected' };
    }
    const config = readMcpConfig(homeDir);
    const key = serverKey(label);
    if (!(key in config.mcpServers)) {
        return { written: false, skipped: 'not-found' };
    }
    delete config.mcpServers[key];
    writeMcpConfig(homeDir, config);
    return { written: true, key };
}

function isCancelled(cancellationToken) {
    return Boolean(cancellationToken && cancellationToken.isCancellationRequested);
}

function onCancelled(cancellationToken, callback) {
    if (!cancellationToken || typeof cancellationToken.onCancellationRequested !== 'function') {
        return undefined;
    }
    return cancellationToken.onCancellationRequested(callback);
}

// Probe an MCP server with a short-timeout `initialize` call. Returns
// { ok, status?, error? }. Used by the bootstrap to skip writing config
// entries for servers that don't respond — a dead/slow entry in
// ~/.copilot/mcp-config.json blocks Copilot CLI startup for ~30s while
// it tries to handshake.
function probeServer({ url, apiKey, timeoutMs = 3000, cancellationToken }) {
    return new Promise((resolve) => {
        let parsed;
        try {
            parsed = new URL(url);
        } catch {
            return resolve({ ok: false, error: 'invalid-url' });
        }
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return resolve({ ok: false, error: 'unsupported-protocol' });
        }

        if (isCancelled(cancellationToken)) {
            return resolve({ ok: false, error: 'cancelled' });
        }

        const lib = parsed.protocol === 'http:' ? http : https;
        const body = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'FlowStudio-VSCodeBridge', version: BRIDGE_VERSION },
            },
        });

        let settled = false;
        let req;
        let cancellationDisposable;
        let hardTimeout;

        const settle = (result) => {
            if (settled) return;
            settled = true;
            if (hardTimeout) {
                clearTimeout(hardTimeout);
            }
            if (cancellationDisposable) {
                cancellationDisposable.dispose();
            }
            if (req) {
                req.destroy();
            }
            resolve(result);
        };

        hardTimeout = setTimeout(() => {
            settle({ ok: false, error: 'timeout' });
        }, timeoutMs);
        if (typeof hardTimeout.unref === 'function') {
            hardTimeout.unref();
        }

        cancellationDisposable = onCancelled(cancellationToken, () => {
            settle({ ok: false, error: 'cancelled' });
        });

        try {
            req = lib.request({
                hostname: parsed.hostname,
                port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
                path: parsed.pathname + parsed.search,
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/event-stream',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                    'x-api-key': apiKey,
                    'User-Agent': USER_AGENT,
                },
                timeout: timeoutMs,
            }, (res) => {
                const status = res.statusCode || 0;
                res.on('error', (e) => settle({ ok: false, error: e.code || e.message || 'response-error' }));
                res.resume();
                if (status >= 200 && status < 300) {
                    settle({ ok: true, status });
                } else {
                    settle({ ok: false, status, error: `http-${status}` });
                }
            });
        } catch (err) {
            settle({ ok: false, error: err.code || err.message || 'request-error' });
            return;
        }

        req.on('error', (e) => settle({ ok: false, error: e.code || e.message || 'request-error' }));
        req.on('timeout', () => {
            settle({ ok: false, error: 'timeout' });
        });

        req.write(body);
        req.end();
    });
}

module.exports = {
    isCopilotCliInstalled,
    installSkillsIfNeeded,
    upsertServer,
    removeServer,
    serverKey,
    probeServer,
};
