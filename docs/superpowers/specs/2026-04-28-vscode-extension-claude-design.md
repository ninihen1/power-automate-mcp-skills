# Design: Power Automate MCP for Claude Code (VS Code Extension)

**Date:** 2026-04-28
**Owner:** Catherine Han
**Status:** Draft for review

## Summary

Ship a second VS Code extension — `flowstudio.flowstudio-mcp-claude` — that provides one-click Flow Studio MCP setup for Claude Code users, mirroring the UX of the existing `flowstudio.flowstudio-mcp` extension that targets GitHub Copilot. Today, Claude Code users have to clone the skills repo, run `claude --plugin-dir`, and shell-paste an API key into `claude mcp add`. This extension replaces all of that with: install, click "Add Tenant Connection", paste API key, reload window.

## Why this is needed

The existing Copilot extension uses VS Code's `mcpServerDefinitionProviders` and `chatSkills` contribution points — APIs that GitHub Copilot Chat consumes natively. Claude Code does not consume those APIs. It reads its own files: `~/.claude.json` for MCP servers, `~/.claude/skills/` for skills. There is no public extensibility hook a third-party VS Code extension can register against.

The published Claude Code install instructions are also currently incorrect: they reference 3 skills when 5 exist. We fix that as part of this work.

## Architecture

The extension is a thin installer/configurator. It does not run an MCP server, proxy traffic, or persist any runtime state beyond what's already on disk. Everything it does is filesystem and Node child-process work.

### Components

- **`extension.js`** — activation entry point. Registers commands. On first activation, copies bundled skills to `~/.claude/skills/` and shows a welcome notification if no connections exist.
- **`skills/` (bundled)** — five skill folders (`flowstudio-power-automate-mcp/`, `flowstudio-power-automate-debug/`, `flowstudio-power-automate-build/`, `flowstudio-power-automate-monitoring/`, `flowstudio-power-automate-governance/`), populated by `sync-skills.js` from the canonical `skills/` at repo root at build time.
- **`sync-skills.js`** (already exists, modified) — copies repo-root `skills/*` into both `vscode-extension/skills/` (existing) and `vscode-extension-claude/skills/` (new). Runs at `vscode:prepublish`.
- **`config-writer.js`** — pure functions for reading and writing `~/.claude.json`. Add/remove/list connections under the `mcpServers` key.
- **`skills-installer.js`** — copies bundled `skills/` folders to `~/.claude/skills/` with namespaced directory names (`flowstudio-power-automate-*`).

### Why this layout

Both extensions share the canonical `skills/` source at repo root. `sync-skills.js` mirrors that source into each extension's bundled `skills/` folder at build time, so neither extension references the other and packaging stays clean. No symlinks, no submodules.

The new extension lives at `vscode-extension-claude/` alongside `vscode-extension/`. They're sibling installer extensions for different agents — they share skill source but nothing else.

## Data flow

### First activation
1. Extension activates on `onStartupFinished`.
2. Verify `anthropic.claude-code` is installed (declared as `extensionDependencies`, so VS Code already auto-installed it; this is a sanity check).
3. Read `~/.claude/skills/flowstudio-power-automate-mcp/SKILL.md`. If absent or its version differs from the bundled version, copy all 5 bundled skill folders into `~/.claude/skills/` with namespaced names. Otherwise skip.
4. Read `~/.claude.json` to count existing `flowstudio-*` MCP entries.
5. If no Flow Studio connections exist and `globalState.welcomeShownVersion !== currentVersion`, show welcome notification with "Add Connection" / "Get API Key" buttons.

### Add Tenant Connection
1. User runs `Flow Studio: Add Tenant Connection` from command palette.
2. Prompt 1: connection label (e.g., "Contoso", "OA"). Validate uniqueness.
3. Prompt 2: API key (password input, `ignoreFocusOut: true`).
4. Compute slug (`label.toLowerCase().replace(/[^a-z0-9]/g, '-')`).
5. Read `~/.claude.json`, ensure `mcpServers` object exists, add entry:
    ```json
    "flowstudio-<slug>": {
      "type": "http",
      "url": "https://mcp.flowstudio.app/mcp",
      "headers": { "x-api-key": "<key>" }
    }
    ```
6. Write back. On Unix-likes, `chmod 600` the file.
7. Show "Connection added. Reload Window to activate." notification with Reload button.

### Remove Tenant Connection
1. User runs command. QuickPick of existing `flowstudio-*` entries from `~/.claude.json`.
2. Pick → confirm → remove the entry from `mcpServers`. Write back. Show "Reload Window" prompt.

### List Connections
1. Read `~/.claude.json`, filter `mcpServers` keys starting with `flowstudio-`.
2. QuickPick (read-only) showing label, URL, and "API key configured" detail.

## Key handling

API key is stored plaintext inside `~/.claude.json`'s `headers` field. This is identical to what `claude mcp add --header` already produces — we are automating an existing pattern, not introducing a new threat model.

Mitigations:
- `chmod 600 ~/.claude.json` on Unix-likes (no equivalent needed on Windows; default ACLs already restrict to the user).
- README explicitly documents the storage location and reasoning.

The extension does not use VS Code SecretStorage. The Copilot extension uses it because VS Code's MCP provider API supports runtime header injection — Claude Code has no equivalent hook, so SecretStorage would only be a write-only backup with no recovery flow in v1, which is just two sources of truth that can drift. Single source of truth (`~/.claude.json`) is cleaner.

We considered (and rejected for v1) a stdio launcher shim that would read keys from the OS keychain at runtime. That approach has 3–4× the runtime surface area (subprocess management, `mcp-remote` dependency, native keychain bindings, three-OS testing) and the security gain is incremental over a chmod-protected file. Stability wins.

## Error handling

The extension's job is filesystem mutation. The error surface is small but real:

- **`~/.claude.json` malformed** — show error with the parse position; offer "Open File" to let the user fix manually. Do not auto-repair.
- **`~/.claude.json` not writable** — show error with path and required action. Most likely cause: file owned by root after a sudo install of Claude Code (rare but seen).
- **`~/.claude/skills/` not writable** — same.
- **Skill copy fails partway** — log which skill, which file. Do not roll back partial copies; on next activation we'll detect the mismatch and re-copy. Idempotent.
- **`anthropic.claude-code` extension missing** — should never happen (declared as `extensionDependencies`), but if VS Code's resolver fails, show a clear "Install Claude Code first" message with a marketplace link and refuse to activate further.
- **Invalid API key shape** — basic length check (>20 chars), reject empty. Server-side validation is the source of truth; we don't call the MCP server from the extension.

## Testing

The extension is small (~300 LoC including UI). Test approach:

- **Unit:** `config-writer.js` and `skills-installer.js` are pure-ish (parameterize the home dir). Test with a temp directory, snapshot output JSON.
- **Manual on three platforms:** Windows 11, macOS, Ubuntu. Walkthrough: install extension → add connection → verify `~/.claude.json` shape → verify skills in `~/.claude/skills/` → reload Claude Code window → confirm tools appear via `claude mcp list` and skill names appear via `claude /skills`.
- **Regression on the existing Copilot extension:** confirm `sync-skills.js` changes don't break the Copilot extension's `vscode:prepublish`.

No CI changes for v1. The existing repo has no CI for `vscode-extension/`; we mirror that.

## Naming and packaging

- Extension ID: `flowstudio.flowstudio-mcp-claude`
- Display name: `Power Automate MCP for Claude Code`
- Publisher: `flowstudio` (existing)
- Initial version: `0.1.0`
- License: MIT
- Repository: `https://github.com/ninihen1/power-automate-mcp-skills` (same repo as existing extension)
- Issue tracker: same repo, label `claude-code` for triage
- Distribution: VS Code Marketplace + Open VSX Registry (so Cursor, VSCodium, Windsurf users can install)
- No telemetry

The README is rewritten from the existing extension's README, keeping the structure and tone but replacing Copilot-specific copy with Claude Code copy. The "Subscription tiers" comparison table stays (server-side gating is unchanged). The "Skills" table stays (same 5 skills). The "Tools" table stays.

## Adjacent fix (in scope)

The current Claude Code install docs (referenced in landing repo, learn-site, awesome-copilot README, and elsewhere) say "all three agent skills (debug, build, operations)" and instruct users to `git clone` + `claude --plugin-dir`. This was written when there were 3 skills. There are now 5 (mcp, debug, build, monitoring, governance), and the manual flow is being superseded by this extension.

In-scope updates:
- README in `awesome-copilot/plugins/flowstudio-power-automate/` — update skill count and table.
- `learn.flowstudio.app` Claude Code page — replace manual install steps with "Install the VS Code extension" as primary, keep manual flow as a "advanced / no-VS-Code" fallback.
- Landing repo (`mcp.flowstudio.app`) — update Claude Code install card.
- Social copy / submission tracker — note the new install path.

These are documentation edits, not engineering. The implementation plan will list them as a final batch task.

## Out of scope (deferred)

- Workspace-scope `.mcp.json` writing — user-scope only for v1. Add later if requested.
- Migration from manual install — we use namespaced skill directories so no conflict; users with manual installs can clean up themselves per README.
- Stdio launcher shim with OS keychain — deferred until a security-conscious customer actually asks. A1 plaintext is sufficient.
- Telemetry / activation events — not in v1.
- Connection rename / edit — users remove + re-add. Add later if friction emerges.

## Effort estimate

- Extension code: 1 day
- `sync-skills.js` modifications: 1 hour
- README + adjacent doc updates: half a day
- Cross-platform manual testing: half a day
- Marketplace + Open VSX publish: 1 hour

**Total: ~2–3 days of focused work.**

## Open questions

None. All architectural decisions are locked.
