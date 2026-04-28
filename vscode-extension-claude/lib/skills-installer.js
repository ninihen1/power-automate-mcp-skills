const fs = require('node:fs');
const path = require('node:path');

const STAMP_FILE = '.flowstudio-mcp-version';

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
    if (!fs.existsSync(bundledSkillsDir)) {
        throw new Error(`Bundled skills directory not found: ${bundledSkillsDir}`);
    }

    const skillsRoot = path.join(homeDir, '.claude', 'skills');
    const stampPath = path.join(skillsRoot, STAMP_FILE);

    if (fs.existsSync(stampPath)) {
        const installedVersion = fs.readFileSync(stampPath, 'utf8').trim();
        if (installedVersion === extensionVersion) {
            return { installed: false, skills: [] };
        }
    }

    fs.mkdirSync(skillsRoot, { recursive: true });

    const installed = [];
    const entries = fs.readdirSync(bundledSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
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

module.exports = { installSkillsIfNeeded };
