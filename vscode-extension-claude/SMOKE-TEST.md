# Smoke Test Checklist

Run this before each marketplace publish. Three platforms; Windows first.

## Windows 11

- [ ] Fresh VS Code window with no FlowStudio connections.
- [ ] Install the .vsix: `code --install-extension flowstudio-mcp-claude-0.1.0.vsix`
- [ ] Reload window if prompted.
- [ ] Welcome notification appears on activation.
- [ ] `~/.claude/skills/` contains 5 `flowstudio-power-automate-*` directories and `.flowstudio-mcp-version` matches `0.1.0`.
- [ ] Run `FlowStudio (Claude): Add Tenant Connection`. Use a real API key for a real tenant.
- [ ] `~/.claude.json` contains `mcpServers.flowstudio-<slug>` with the URL and headers.
- [ ] Click "Reload Window".
- [ ] After reload, in Claude Code: `claude mcp list` shows `flowstudio-<slug>`.
- [ ] Ask Claude: "List my Power Automate flows". Verify it returns real flows.
- [ ] Run `FlowStudio (Claude): List Connections` — entry shows up with "API key configured".
- [ ] Run `FlowStudio (Claude): Remove Tenant Connection` — entry is removed from `~/.claude.json` after reload.

## macOS

- [ ] Same checklist as Windows.
- [ ] Additionally: `stat -f %Lp ~/.claude.json` returns `600`.

## Linux (Ubuntu 22.04+)

- [ ] Same checklist as Windows.
- [ ] Additionally: `stat -c %a ~/.claude.json` returns `600`.

## If any step fails

Do not publish. File an issue, fix, bump patch version, re-run from the top.
