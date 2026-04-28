const fs = require('node:fs');
const path = require('node:path');

function getConfigPath(homeDir) {
    return path.join(homeDir, '.claude.json');
}

function readConfig(configPath) {
    if (!fs.existsSync(configPath)) return {};
    const raw = fs.readFileSync(configPath, 'utf8');
    if (!raw.trim()) return {};
    return JSON.parse(raw);
}

function writeConfig(configPath, cfg) {
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n');
    if (process.platform !== 'win32') {
        fs.chmodSync(configPath, 0o600);
    }
}

function listConnections(homeDir) {
    const cfg = readConfig(getConfigPath(homeDir));
    const servers = cfg.mcpServers || {};
    return Object.keys(servers)
        .filter((slug) => slug.startsWith('flowstudio-'))
        .map((slug) => {
            const entry = servers[slug];
            return {
                slug,
                label: entry._flowstudioLabel || slug.replace(/^flowstudio-/, ''),
                url: entry.url,
                hasKey: Boolean(entry.headers && entry.headers['x-api-key']),
            };
        });
}

function addConnection(homeDir, { slug, label, url, apiKey }) {
    const configPath = getConfigPath(homeDir);
    const cfg = readConfig(configPath);
    cfg.mcpServers = cfg.mcpServers || {};
    cfg.mcpServers[slug] = {
        type: 'http',
        url,
        headers: { 'x-api-key': apiKey },
        _flowstudioLabel: label,
    };
    writeConfig(configPath, cfg);
}

function removeConnection(homeDir, slug) {
    const configPath = getConfigPath(homeDir);
    if (!fs.existsSync(configPath)) return false;
    const cfg = readConfig(configPath);
    if (!cfg.mcpServers || !cfg.mcpServers[slug]) return false;
    delete cfg.mcpServers[slug];
    writeConfig(configPath, cfg);
    return true;
}

module.exports = { listConnections, addConnection, removeConnection, getConfigPath };
