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

const SKILLS_STAMP = '.flowstudio-mcp-version';
const COPILOT_DIR = '.copilot';
const SKILLS_SUBDIR = 'skills';
const MCP_CONFIG_FILE = 'mcp-config.json';
const FLOWSTUDIO_KEY_PREFIX = 'flowstudio';

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

module.exports = {
    isCopilotCliInstalled,
    installSkillsIfNeeded,
    upsertServer,
    removeServer,
    serverKey,
};
