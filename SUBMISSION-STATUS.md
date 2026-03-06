# Skill Distribution Status

> Reference doc for tracking skill submissions across all agent platforms.
> Last updated: 2026-03-06

---

## What We Did

### Cleanup (FlowStudio MCP repo)
- Added `.claude/` to `.gitignore` (commit `62432ee`) — prevents Claude worktree artifacts from leaking
- Deleted `skills/power-automate-build/examples/__pycache__/` from disk
- Confirmed `__pycache__/` was already in `.gitignore`
- Confirmed no private/tenant-specific files are tracked (examples/ is gitignored)

### Fork & Submission
1. Forked `github/awesome-copilot` → `ninihen1/awesome-copilot`
2. Cloned fork to `~/GitHub/awesome-copilot`
3. Created branch `add-power-automate-mcp` off `staged`
4. Copied `power-automate-mcp` skill (SKILL.md + 4 reference files) into `skills/power-automate-mcp/`
5. Ran `npm run skill:validate` — ✅ passed
6. Ran `npm run build` — ✅ passed
7. Committed as `9c81ea6`: "feat: add power-automate-mcp skill"
8. Pushed to `origin/add-power-automate-mcp`
9. PR opened: **https://github.com/github/awesome-copilot/pull/896**
   - Base: `staged`
   - Head: `ninihen1:add-power-automate-mcp`

---

## Distribution Overview

All three skills use the **Agent Skills standard** (SKILL.md with `name`/`description` YAML frontmatter).
This format is natively compatible with: GitHub Copilot, Claude Code, OpenAI Codex, OpenClaw, Gemini CLI,
OpenHands, Goose, Amp, and more.

### Master Status Table

| Channel | Audience | `power-automate-mcp` | `power-automate-debug` | `power-automate-build` |
|---------|----------|---------------------|----------------------|----------------------|
| **awesome-copilot** | GitHub Copilot | [PR #896](https://github.com/github/awesome-copilot/pull/896) — awaiting review | Submit after mcp merges | Submit after mcp merges |
| **ClawHub** (OpenClaw) | 240k monthly visitors | ✅ Uploaded 2026-03-06 | ✅ Uploaded 2026-03-06 | ✅ Uploaded 2026-03-06 |
| **anthropics/skills** | Claude Code (84.9k stars) | Not yet submitted | Not yet submitted | Not yet submitted |
| **openai/skills** | Codex (11k stars) | Not yet submitted | Not yet submitted | Not yet submitted |
| **Official MCP Registry** | All MCP clients | Not yet published | N/A (skill, not server) | N/A (skill, not server) |
| **Smithery** | 125k+ skills users | Not yet published | Not yet published | Not yet published |

---

## 1. GitHub Copilot — awesome-copilot

### What We Did
- Forked `github/awesome-copilot` → `ninihen1/awesome-copilot`
- Cloned fork to `~/GitHub/awesome-copilot`
- Submitted PR #896 for `power-automate-mcp` (branch `add-power-automate-mcp`)
- Files: SKILL.md + 4 reference files under `skills/power-automate-mcp/`

### Next Steps
1. **If changes requested**: Update on `add-power-automate-mcp` branch, commit, push.
2. **Once PR #896 merges**: Submit debug + build together:
   ```bash
   cd ~/GitHub/awesome-copilot
   git checkout staged && git pull upstream staged
   git checkout -b add-power-automate-debug-build

   cp -r ~/GitHub/"FlowStudio MCP"/skills/power-automate-debug/SKILL.md skills/power-automate-debug/SKILL.md
   mkdir -p skills/power-automate-debug/references
   cp ~/GitHub/"FlowStudio MCP"/skills/power-automate-debug/references/* skills/power-automate-debug/references/

   cp -r ~/GitHub/"FlowStudio MCP"/skills/power-automate-build/SKILL.md skills/power-automate-build/SKILL.md
   mkdir -p skills/power-automate-build/references
   cp ~/GitHub/"FlowStudio MCP"/skills/power-automate-build/references/* skills/power-automate-build/references/

   npm run skill:validate && npm run build
   git add skills/power-automate-debug skills/power-automate-build
   git commit -m "feat: add power-automate-debug and power-automate-build skills"
   git push origin add-power-automate-debug-build
   gh pr create --repo github/awesome-copilot --base staged \
     --head ninihen1:add-power-automate-debug-build \
     --title "feat: add power-automate-debug and power-automate-build skills"
   ```

### Key Details
- PRs target the **`staged`** branch (not `main`)
- Validate: `npm run skill:validate` then `npm run build`
- Fork: `~/GitHub/awesome-copilot` (`origin` = ninihen1, `upstream` = github)

---

## 2. OpenClaw — ClawHub

### Overview
- **OpenClaw** (formerly Clawdbot/Moltbot) by Peter Steinberger (@steipete)
- Locally-running AI assistant — users interact via WhatsApp, Telegram, Discord, Slack, iMessage
- **ClawHub** (clawhub.ai) is the skill registry: 13,729 skills, 240k monthly visitors
- **awesome-openclaw-skills** (VoltAgent/awesome-openclaw-skills): 28.5k stars curated list
- Skills in `openclaw/skills` repo are auto-synced from ClawHub uploads

### Format Compatibility
Our SKILL.md files are **directly compatible** — same frontmatter format:
```yaml
---
name: skill-name
description: "Short description"
---
# Skill content...
```

### How to Upload
1. Go to https://clawhub.ai/upload
2. Sign in with GitHub
3. Upload each skill folder (SKILL.md + references/)
4. Skills auto-publish to `openclaw/skills` repo on GitHub

### Installation by Users
```bash
# Via ClawHub CLI
npx clawhub@latest install power-automate-mcp

# Or manual copy to:
~/.openclaw/skills/power-automate-mcp/    # Global
<project>/skills/power-automate-mcp/      # Workspace
```

### awesome-openclaw-skills Listing (After Upload)
Once skills get some community traction on ClawHub:
- PR to `VoltAgent/awesome-openclaw-skills` (28.5k stars, 2.7k forks)
- Entry format: `- [skill-name](https://github.com/openclaw/skills/tree/main/skills/author/skill-name/SKILL.md) - Description ≤10 words`
- PR title: `Add skill: ninihen1/power-automate-mcp`
- Best category: **DevOps & Cloud** (408 skills)
- ⚠️ They require proven community adoption — don't submit immediately after upload

---

## 3. Claude Code — anthropics/skills

### Overview
- Official repo: `anthropics/skills` (84.9k stars)
- Same SKILL.md format as our skills
- Skills at `skills/<skill-name>/SKILL.md`
- Can also register as Claude Code Plugin marketplace

### How to Submit
PR to `anthropics/skills` with skill folders under `skills/`.
Structure: `skills/power-automate-mcp/SKILL.md` (+ reference files)

### Users Connect FlowStudio MCP
```bash
claude mcp add --transport http flowstudio https://mcp.flowstudio.app/mcp \
  --header "x-api-key: <JWT>"
```

---

## 4. OpenAI Codex — openai/skills

### Overview
- Official repo: `openai/skills` (11k stars)
- Same SKILL.md format + optional `agents/openai.yaml` for UI metadata
- Skills organized by tiers: `.system`, `.curated`, `.experimental`
- Install via `$skill-installer` in Codex

### How to Submit
PR to `openai/skills` with skill folders.
Optional: Add `agents/openai.yaml` with display_name, icon, brand_color, default_prompt.

### Users Connect FlowStudio MCP
In `~/.codex/config.toml`:
```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<JWT>"
```

---

## 5. Official MCP Registry

### Overview
- `registry.modelcontextprotocol.io` — the canonical MCP server directory
- One publish reaches ALL MCP-compatible clients
- Uses `mcp-publisher` CLI tool
- Note: This publishes the **FlowStudio MCP server** itself, not individual skills

### How to Publish
```bash
npx mcp-publisher login github
# Create server.json with server metadata
npx mcp-publisher publish
```
Server name format: `io.github.ninihen1/flowstudio-mcp`

---

## 6. Smithery

### Overview
- smithery.ai — 4,819+ MCP servers, 125,974+ skills
- Publish both MCP servers and skills
- GitHub sign-in at smithery.ai/servers/new
- Built-in OAuth and observability

---

## Priority & Execution Order

| Priority | Action | Effort | Blocked By |
|----------|--------|--------|------------|
| 1 | ✅ awesome-copilot PR #896 | Done | Awaiting review |
| 2 | Upload 3 skills to ClawHub | Low — no reformatting | GitHub sign-in |
| 3 | PR to anthropics/skills | Low — same format | Nothing |
| 4 | PR to openai/skills | Low — same format + optional yaml | Nothing |
| 5 | Publish FlowStudio MCP to MCP Registry | Medium — needs server.json | Nothing |
| 6 | Publish to Smithery | Low — GitHub sign-in | Nothing |
| 7 | PR to awesome-openclaw-skills | Low — but needs traction on ClawHub first | ClawHub upload + adoption |

---

## Key Details to Remember
- All skills use Agent Skills standard format (SKILL.md with name/description frontmatter)
- Auth in all skills uses `x-api-key` header, never Bearer
- PowerShell examples must include `-UseBasicParsing`
- The `skills/*/examples/` directory in FlowStudio MCP is gitignored (tenant-specific data)
- awesome-copilot PRs target the **`staged`** branch (not `main`)
