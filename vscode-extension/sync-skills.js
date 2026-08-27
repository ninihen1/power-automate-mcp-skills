#!/usr/bin/env node
// Sync the 5 FlowStudio skills from ../skills/ into ./skills/
// so the VS Code extension bundles them via the chatSkills contribution point.
//
// Runs automatically before vsce package via the vscode:prepublish npm script.
// Can also be invoked manually: npm run sync-skills

const fs = require('fs');
const path = require('path');

const SKILLS = [
    'power-automate-mcp',
    'power-automate-debug',
    'power-automate-build',
    'power-automate-monitoring',
    'power-automate-governance',
];

const sourceRoot = path.resolve(__dirname, '..', 'skills');
const targetRoot = path.resolve(__dirname, 'skills');

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

function rmDirSync(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

console.log(`[sync-skills] source: ${sourceRoot}`);
console.log(`[sync-skills] target: ${targetRoot}`);

if (!fs.existsSync(sourceRoot)) {
    console.error(`[sync-skills] ERROR: source not found at ${sourceRoot}`);
    process.exit(1);
}

rmDirSync(targetRoot);
fs.mkdirSync(targetRoot, { recursive: true });

let copied = 0;
let missing = [];

for (const skill of SKILLS) {
    const src = path.join(sourceRoot, skill);
    const dest = path.join(targetRoot, skill);
    if (!fs.existsSync(src)) {
        missing.push(skill);
        continue;
    }
    copyDirSync(src, dest);
    const skillFile = path.join(dest, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
        console.error(`[sync-skills] WARNING: ${skill} copied but no SKILL.md found`);
    }
    copied++;
    console.log(`[sync-skills] ✓ ${skill}`);
}

if (missing.length > 0) {
    console.error(`[sync-skills] ERROR: missing skills: ${missing.join(', ')}`);
    process.exit(1);
}

console.log(`[sync-skills] done — ${copied}/${SKILLS.length} skills bundled`);
