const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { listConnections, addConnection, removeConnection, getConfigPath } = require('../lib/config-writer');

function makeTempHome() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'fsclaude-'));
}

test('getConfigPath returns ~/.claude.json under given home', () => {
    const home = '/tmp/x';
    assert.strictEqual(getConfigPath(home), path.join(home, '.claude.json'));
});

test('listConnections on missing config returns []', () => {
    const home = makeTempHome();
    assert.deepStrictEqual(listConnections(home), []);
});

test('listConnections on empty config returns []', () => {
    const home = makeTempHome();
    fs.writeFileSync(path.join(home, '.claude.json'), '{}');
    assert.deepStrictEqual(listConnections(home), []);
});

test('listConnections returns only flowstudio-* entries', () => {
    const home = makeTempHome();
    fs.writeFileSync(path.join(home, '.claude.json'), JSON.stringify({
        mcpServers: {
            'flowstudio-contoso': { type: 'http', url: 'https://x', headers: { 'x-api-key': 'k' }, _flowstudioLabel: 'Contoso' },
            'other-server': { type: 'http', url: 'https://y' },
        },
    }));
    const list = listConnections(home);
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].slug, 'flowstudio-contoso');
    assert.strictEqual(list[0].label, 'Contoso');
    assert.strictEqual(list[0].hasKey, true);
});

test('addConnection creates config and entry when file missing', () => {
    const home = makeTempHome();
    addConnection(home, { slug: 'flowstudio-oa', label: 'OA', url: 'https://mcp.flowstudio.app/mcp', apiKey: 'secret123' });
    const cfg = JSON.parse(fs.readFileSync(path.join(home, '.claude.json'), 'utf8'));
    assert.deepStrictEqual(cfg.mcpServers['flowstudio-oa'], {
        type: 'http',
        url: 'https://mcp.flowstudio.app/mcp',
        headers: { 'x-api-key': 'secret123' },
        _flowstudioLabel: 'OA',
    });
});

test('addConnection preserves existing non-flowstudio entries', () => {
    const home = makeTempHome();
    fs.writeFileSync(path.join(home, '.claude.json'), JSON.stringify({
        mcpServers: { 'other': { type: 'stdio', command: 'foo' } },
        otherTopLevel: { keep: true },
    }));
    addConnection(home, { slug: 'flowstudio-oa', label: 'OA', url: 'https://x', apiKey: 'k' });
    const cfg = JSON.parse(fs.readFileSync(path.join(home, '.claude.json'), 'utf8'));
    assert.deepStrictEqual(cfg.mcpServers['other'], { type: 'stdio', command: 'foo' });
    assert.deepStrictEqual(cfg.otherTopLevel, { keep: true });
});

test('addConnection overwrites existing entry with same slug', () => {
    const home = makeTempHome();
    addConnection(home, { slug: 'flowstudio-oa', label: 'OA', url: 'https://x', apiKey: 'old' });
    addConnection(home, { slug: 'flowstudio-oa', label: 'OA', url: 'https://x', apiKey: 'new' });
    const cfg = JSON.parse(fs.readFileSync(path.join(home, '.claude.json'), 'utf8'));
    assert.strictEqual(cfg.mcpServers['flowstudio-oa'].headers['x-api-key'], 'new');
});

test('addConnection chmods file to 600 on non-Windows', { skip: process.platform === 'win32' }, () => {
    const home = makeTempHome();
    addConnection(home, { slug: 'flowstudio-oa', label: 'OA', url: 'https://x', apiKey: 'k' });
    const stat = fs.statSync(path.join(home, '.claude.json'));
    assert.strictEqual(stat.mode & 0o777, 0o600);
});

test('removeConnection returns true and removes entry when present', () => {
    const home = makeTempHome();
    addConnection(home, { slug: 'flowstudio-oa', label: 'OA', url: 'https://x', apiKey: 'k' });
    const removed = removeConnection(home, 'flowstudio-oa');
    assert.strictEqual(removed, true);
    const cfg = JSON.parse(fs.readFileSync(path.join(home, '.claude.json'), 'utf8'));
    assert.strictEqual(cfg.mcpServers['flowstudio-oa'], undefined);
});

test('removeConnection returns false when entry absent', () => {
    const home = makeTempHome();
    fs.writeFileSync(path.join(home, '.claude.json'), '{}');
    assert.strictEqual(removeConnection(home, 'flowstudio-nope'), false);
});

test('removeConnection returns false when config file missing', () => {
    const home = makeTempHome();
    assert.strictEqual(removeConnection(home, 'flowstudio-nope'), false);
});
