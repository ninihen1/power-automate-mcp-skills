const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { installSkillsIfNeeded } = require('../lib/skills-installer');

function makeTempHome() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'fsclaude-skills-'));
}

function makeBundledSkills(tmpRoot, names) {
    const dir = path.join(tmpRoot, 'bundled');
    fs.mkdirSync(dir, { recursive: true });
    for (const name of names) {
        const skillDir = path.join(dir, name);
        fs.mkdirSync(skillDir, { recursive: true });
        fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `# ${name}\n`);
    }
    return dir;
}

test('installSkillsIfNeeded copies all bundled skills with namespacing on first run', () => {
    const home = makeTempHome();
    const bundled = makeBundledSkills(home, ['power-automate-mcp', 'power-automate-debug']);
    const result = installSkillsIfNeeded(home, bundled, '0.1.0');
    assert.strictEqual(result.installed, true);
    assert.deepStrictEqual(result.skills.sort(), ['flowstudio-power-automate-debug', 'flowstudio-power-automate-mcp']);
    assert.ok(fs.existsSync(path.join(home, '.claude', 'skills', 'flowstudio-power-automate-mcp', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(home, '.claude', 'skills', 'flowstudio-power-automate-debug', 'SKILL.md')));
});

test('installSkillsIfNeeded writes version stamp', () => {
    const home = makeTempHome();
    const bundled = makeBundledSkills(home, ['power-automate-mcp']);
    installSkillsIfNeeded(home, bundled, '0.1.0');
    const stamp = fs.readFileSync(path.join(home, '.claude', 'skills', '.flowstudio-mcp-version'), 'utf8');
    assert.strictEqual(stamp.trim(), '0.1.0');
});

test('installSkillsIfNeeded is no-op when stamp matches', () => {
    const home = makeTempHome();
    const bundled = makeBundledSkills(home, ['power-automate-mcp']);
    installSkillsIfNeeded(home, bundled, '0.1.0');
    // Mutate the installed skill — second call must NOT overwrite.
    const skillFile = path.join(home, '.claude', 'skills', 'flowstudio-power-automate-mcp', 'SKILL.md');
    fs.writeFileSync(skillFile, 'tampered');
    const result = installSkillsIfNeeded(home, bundled, '0.1.0');
    assert.strictEqual(result.installed, false);
    assert.strictEqual(fs.readFileSync(skillFile, 'utf8'), 'tampered');
});

test('installSkillsIfNeeded re-copies when version differs', () => {
    const home = makeTempHome();
    const bundled = makeBundledSkills(home, ['power-automate-mcp']);
    installSkillsIfNeeded(home, bundled, '0.1.0');
    const skillFile = path.join(home, '.claude', 'skills', 'flowstudio-power-automate-mcp', 'SKILL.md');
    fs.writeFileSync(skillFile, 'tampered');
    const result = installSkillsIfNeeded(home, bundled, '0.2.0');
    assert.strictEqual(result.installed, true);
    assert.strictEqual(fs.readFileSync(skillFile, 'utf8'), '# power-automate-mcp\n');
    assert.strictEqual(fs.readFileSync(path.join(home, '.claude', 'skills', '.flowstudio-mcp-version'), 'utf8').trim(), '0.2.0');
});

test('installSkillsIfNeeded creates ~/.claude/skills/ if missing', () => {
    const home = makeTempHome();
    const bundled = makeBundledSkills(home, ['power-automate-mcp']);
    assert.strictEqual(fs.existsSync(path.join(home, '.claude')), false);
    installSkillsIfNeeded(home, bundled, '0.1.0');
    assert.ok(fs.existsSync(path.join(home, '.claude', 'skills')));
});

test('installSkillsIfNeeded throws if bundled dir missing', () => {
    const home = makeTempHome();
    assert.throws(() => installSkillsIfNeeded(home, path.join(home, 'nonexistent'), '0.1.0'));
});
