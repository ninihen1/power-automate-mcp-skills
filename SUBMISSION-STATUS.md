# Skill Distribution Status

> Reference doc for tracking skill submissions across all agent platforms.
> Last updated: 2026-04-03

---

## Distribution Overview

All three skills use the **Agent Skills standard** (SKILL.md with `name`/`description` YAML frontmatter).
This format is natively compatible with: GitHub Copilot, Claude Code, OpenAI Codex, OpenClaw, Gemini CLI,
OpenHands, Goose, Amp, and more.

### Master Status Table

| Channel | Audience | `power-automate-mcp` | `power-automate-debug` | `power-automate-build` |
|---------|----------|---------------------|----------------------|----------------------|
| **awesome-copilot** | GitHub Copilot | ✅ [PR #896](https://github.com/github/awesome-copilot/pull/896) merged (as `flowstudio-power-automate-mcp`) | ✅ [PR #899](https://github.com/github/awesome-copilot/pull/899) merged 2026-03-08 | ✅ [PR #899](https://github.com/github/awesome-copilot/pull/899) merged 2026-03-08 |
| **ClawHub** (OpenClaw) | 240k monthly visitors | ✅ v1.1.0 published (metadata fix) | ✅ v1.1.0 published (metadata fix) | ✅ v1.1.0 published (metadata fix) |
| **anthropics/skills** | Claude Code (85.2k ⭐, 9k forks) | ⚠️ [PR #555](https://github.com/anthropics/skills/pull/555) — repo only merges internal PRs | ⚠️ PR #555 | ⚠️ PR #555 |
| **openai/skills** | Codex (11.2k ⭐, 622 forks) | ⚠️ [PR #231](https://github.com/openai/skills/pull/231) — repo only merges internal/partner PRs | ⚠️ PR #231 | ⚠️ PR #231 |
| **Smithery** (skills) | 125k+ skills, 4.8k+ MCPs | ✅ Published ([flowstudio/power-automate-mcp](https://smithery.ai/skills/flowstudio/power-automate-mcp)) | ✅ Published ([flowstudio/power-automate-debug](https://smithery.ai/skills/flowstudio/power-automate-debug)) | ✅ Published ([flowstudio/power-automate-build](https://smithery.ai/skills/flowstudio/power-automate-build)) |
| **Smithery** (MCP server) | 4.8k+ MCPs | ⚠️ [Created](https://smithery.ai/servers/flowstudio/flowstudio-mcp) — scan blocked by Cloudflare | N/A (server) | N/A (server) |
| **Official MCP Registry + VS Code Gallery** | All MCP clients, VS Code | ❌ Blocked — needs Streamable HTTP transport | N/A (skill, not server) | N/A (skill, not server) |
| **skills.sh** (Vercel) | Agent skills directory | ✅ Auto-indexed via awesome-copilot ([3K+ installs](https://skills.sh/?q=flowstudio)) | ✅ Auto-indexed (691 installs) | ✅ Auto-indexed (689 installs) |
| **awesome-mcp-servers** (appcypher) | 5.3k ⭐ GitHub list | ❌ PRs disabled on repo — PR #757 lost | N/A (server listing) | N/A (server listing) |
| **awesome-remote-mcp-servers** (jaw9c) | 1k ⭐ remote-only list | ⏳ [PR #176](https://github.com/jaw9c/awesome-remote-mcp-servers/pull/176) awaiting review | N/A (server listing) | N/A (server listing) |
| **awesome-openclaw-skills** (VoltAgent) | 28.5k ⭐ curated list | ⏳ [PR #372](https://github.com/VoltAgent/awesome-openclaw-skills/pull/372) awaiting review | ⏳ PR #372 | ⏳ PR #372 |
| **mcpservers.org** (wong2) | 3.8k ⭐ + web directory | 🔲 Submit via web form | N/A (server listing) | N/A (server listing) |

---

## 1. GitHub Copilot — awesome-copilot

### Status: ✅ Merged

- Fork: `ninihen1/awesome-copilot` → cloned to `~/GitHub/awesome-copilot`
- Branch: `add-power-automate-mcp` off `staged`
- PR: **[#896](https://github.com/github/awesome-copilot/pull/896)** — merged by @aaronpowell on 2026-03-06
- Skill folder: `skills/flowstudio-power-automate-mcp/`

### What happened
1. Initial PR submitted as `power-automate-mcp` (commit `9c81ea6`)
2. @aaronpowell (code owner) requested: "have FlowStudio as part of the name"
3. Copilot AI posted 8 review comments on response shapes, syntax, User-Agent, docs
4. **All 8 comments verified against live FlowStudio MCP server** using real API calls
5. Renamed to `flowstudio-power-automate-mcp`, applied all valid fixes (commit `0962c47`)
6. Posted [review reply comment](https://github.com/github/awesome-copilot/pull/896#issuecomment-4009420759) with verdict table for each Copilot suggestion
7. Validation: `npm run skill:validate` ✅ (208 skills valid), `npm run build` ✅

### Status: ✅ PR #899 merged

- Fork: `ninihen1/awesome-copilot` → cloned to `~/GitHub/awesome-copilot`
- Branch: `add-power-automate-debug-build` off `staged`
- PR: **[#899](https://github.com/github/awesome-copilot/pull/899)** — merged by @aaronpowell on 2026-03-08
- Skill folders: `skills/flowstudio-power-automate-debug/`, `skills/flowstudio-power-automate-build/`
- Plugin: `plugins/flowstudio-power-automate/` (bundles all 3 skills)
- CI: All 4 checks passed (line-endings, materialized-files, codespell, validate-readme)

### Key Details
- PRs target the **`staged`** branch (not `main`)
- Validate: `npm run skill:validate` then `npm run build`
- Fork: `~/GitHub/awesome-copilot` (`origin` = ninihen1, `upstream` = github)

---

## 2. OpenClaw — ClawHub

### Status: ✅ All 3 skills published (v1.1.0)

- **ClawHub** (clawhub.ai): 13,729 skills, 240k monthly visitors
- **awesome-openclaw-skills** (VoltAgent/awesome-openclaw-skills): 28.5k stars curated list

### What happened
1. v1.0.0 uploaded manually via web UI on 2026-03-06
2. Security scan flagged `mcp` and `build` as "Suspicious (medium confidence)" — missing credential declarations
3. Added `metadata.openclaw` to all 3 SKILL.md frontmatters declaring `FLOWSTUDIO_MCP_TOKEN` env var
4. Published v1.1.0 via `clawhub` CLI on 2026-03-07
5. `debug` skill already passed as "Benign (high confidence)"

### CLI Setup
```bash
npx clawhub login --token "<token>" --no-browser
npx clawhub publish skills/power-automate-mcp --version 1.1.0
npx clawhub publish skills/power-automate-debug --version 1.1.0
npx clawhub publish skills/power-automate-build --version 1.1.0
```

### Installation by Users
```bash
npx clawhub@latest install power-automate-mcp
```

### awesome-openclaw-skills Listing (Deferred)
- PR to `VoltAgent/awesome-openclaw-skills` once skills get community traction on ClawHub
- Category: **DevOps & Cloud** (408 skills)
- ⚠️ Requires proven adoption — don't submit until download metrics warrant it

---

## 3. Claude Code — anthropics/skills

### Status: ⏳ PR #555 submitted — awaiting review

- Repo: `anthropics/skills` (85.2k ⭐, 9k forks, 267 open PRs)
- Fork: `ninihen1/skills` → cloned to `~/GitHub/skills`
- Branch: `add-flowstudio-power-automate-skills`
- PR: **[#555](https://github.com/anthropics/skills/pull/555)** — submitted 2026-03-07
- Skill folders (with `flowstudio-` prefix per convention):
  - `skills/flowstudio-power-automate-mcp/`
  - `skills/flowstudio-power-automate-debug/`
  - `skills/flowstudio-power-automate-build/`
- 15 files total (3 SKILL.md + 12 reference files)

### How to Submit
1. Fork `anthropics/skills`
2. Add skill folders under `skills/`:
   - `skills/power-automate-mcp/SKILL.md` + `references/`
   - `skills/power-automate-debug/SKILL.md` + `references/`
   - `skills/power-automate-build/SKILL.md` + `references/`
3. PR to `main`

```bash
# Fork & clone
gh repo fork anthropics/skills --clone
cd skills

# Copy all 3 skills
for skill in power-automate-mcp power-automate-debug power-automate-build; do
  mkdir -p "skills/$skill/references"
  cp ~/GitHub/"FlowStudio MCP"/skills/$skill/SKILL.md "skills/$skill/"
  cp ~/GitHub/"FlowStudio MCP"/skills/$skill/references/* "skills/$skill/references/" 2>/dev/null
done

# Commit & PR
git checkout -b add-flowstudio-skills
git add skills/power-automate-*
git commit -m "feat: add FlowStudio Power Automate skills (mcp, debug, build)"
git push origin add-flowstudio-skills
gh pr create --base main --title "feat: add FlowStudio Power Automate skills" \
  --body "Three skills for Power Automate cloud flow management via FlowStudio MCP server.
- **power-automate-mcp**: Core connection & CRUD operations
- **power-automate-debug**: Debug workflow for failed flow runs
- **power-automate-build**: Build & deploy flows from natural language

Requires FlowStudio MCP subscription: https://flowstudio.app"
```

### Users Connect FlowStudio MCP in Claude Code
```bash
claude mcp add --transport http flowstudio https://mcp.flowstudio.app/mcp \
  --header "x-api-key: <JWT>"
```

### Notes
- 267 open PRs suggest review backlog — submit early, expect wait
- All 3 skills can go in one PR since anthropics/skills has no tier system

---

## 4. OpenAI Codex — openai/skills

### Status: ⏳ PR #231 submitted — awaiting review

- Repo: `openai/skills` (11.2k ⭐, 622 forks, 87 open PRs)
- Fork: `ninihen1/openai-skills` (renamed to avoid collision with anthropics fork)
- Branch: `add-flowstudio-power-automate-skills`
- PR: **[#231](https://github.com/openai/skills/pull/231)** — submitted 2026-03-07
- Skill folders under `skills/.experimental/` (with `flowstudio-` prefix):
  - `skills/.experimental/flowstudio-power-automate-mcp/`
  - `skills/.experimental/flowstudio-power-automate-debug/`
  - `skills/.experimental/flowstudio-power-automate-build/`
- Skills organized by tiers: `.system` (built-in), `.curated` (vetted), `.experimental` (community)

### How to Submit
1. Fork `openai/skills`
2. Add skill folders under `skills/.experimental/`:
   - `skills/.experimental/power-automate-mcp/SKILL.md` + `references/`
   - `skills/.experimental/power-automate-debug/SKILL.md` + `references/`
   - `skills/.experimental/power-automate-build/SKILL.md` + `references/`
3. PR to `main`

```bash
# Fork & clone
gh repo fork openai/skills --clone
cd skills

# Copy all 3 skills into .experimental
for skill in power-automate-mcp power-automate-debug power-automate-build; do
  mkdir -p "skills/.experimental/$skill/references"
  cp ~/GitHub/"FlowStudio MCP"/skills/$skill/SKILL.md "skills/.experimental/$skill/"
  cp ~/GitHub/"FlowStudio MCP"/skills/$skill/references/* "skills/.experimental/$skill/references/" 2>/dev/null
done

# Commit & PR
git checkout -b add-flowstudio-skills
git add skills/.experimental/power-automate-*
git commit -m "feat: add FlowStudio Power Automate skills"
git push origin add-flowstudio-skills
gh pr create --base main --title "feat: add FlowStudio Power Automate skills (.experimental)" \
  --body "Three experimental skills for Power Automate cloud flow management via FlowStudio MCP.
- **power-automate-mcp**: Core connection & CRUD operations
- **power-automate-debug**: Debug workflow for failed flow runs
- **power-automate-build**: Build & deploy flows from natural language

Requires FlowStudio MCP subscription: https://flowstudio.app"
```

### Users Connect FlowStudio MCP in Codex
In `~/.codex/config.toml`:
```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<JWT>"
```

### Users Install Skills
```
$skill-installer install the power-automate-mcp skill from the .experimental folder
```

---

## 5. Smithery

### Status: ✅ All 3 skills published

- smithery.ai — 4,824+ MCP servers, 125,300+ skills
- Namespace: `flowstudio` (created 2026-03-07)
- Skills published via REST API: `PUT https://api.smithery.ai/skills/{namespace}/{slug}`
- All skills link to GitHub repo subdirs and auto-sync from SKILL.md

### Published Skills
| Skill | Smithery URL |
|-------|-------------|
| `power-automate-mcp` | [flowstudio/power-automate-mcp](https://smithery.ai/skills/flowstudio/power-automate-mcp) |
| `power-automate-debug` | [flowstudio/power-automate-debug](https://smithery.ai/skills/flowstudio/power-automate-debug) |
| `power-automate-build` | [flowstudio/power-automate-build](https://smithery.ai/skills/flowstudio/power-automate-build) |

### CLI Publishing Commands (for reference)
```bash
# Authenticate
export SMITHERY_API_KEY="<api-key>"

# Publish/update a skill (idempotent PUT)
curl -X PUT "https://api.smithery.ai/skills/flowstudio/power-automate-mcp" \
  -H "Authorization: Bearer $SMITHERY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"gitUrl": "https://github.com/ninihen1/FlowStudio-MCP/tree/master/skills/power-automate-mcp"}'
```

### Installation by Users
```bash
npx smithery skill add flowstudio/power-automate-mcp
```

### MCP Server Publishing — ⚠️ Created but scan blocked by Cloudflare

- Server created: [flowstudio/flowstudio-mcp](https://smithery.ai/servers/flowstudio/flowstudio-mcp)
- Proxy URL: `https://flowstudio-mcp--flowstudio.run.tools`
- Config schema: `smithery-config-schema.json` (declares `x-api-key` via `x-from: header:x-api-key`)
- Description: ✅ Updated via PATCH API
- **Scan failed**: Cloudflare Bot Fight Mode blocks `SmitheryBot/1.0` User-Agent, returning HTML instead of JSON
- Server page shows "No capabilities found" / "No deployments found"

**To fix (requires FlowStudio server-side change — pick one):**
1. **Whitelist SmitheryBot UA** in Cloudflare WAF: Security > WAF > Tools > IP Access Rules, or create skip rule for `(http.user_agent contains "SmitheryBot")`
2. **Serve `/.well-known/mcp/server-card.json`** endpoint to bypass scanning entirely:
   ```json
   {
     "serverInfo": { "name": "FlowStudio MCP", "version": "1.0.0" },
     "authentication": { "required": true, "schemes": ["apiKey"] },
     "tools": [
       { "name": "list_live_flows", "description": "List flows in an environment", "inputSchema": { "type": "object" } },
       { "name": "get_live_flow", "description": "Fetch complete flow definition", "inputSchema": { "type": "object" } }
     ]
   }
   ```
3. **Disable Bot Fight Mode** in Cloudflare (Security > Bots)

**After Cloudflare fix, re-publish:**
```bash
SMITHERY_API_KEY="<key>" npx smithery mcp publish "https://mcp.flowstudio.app/mcp" \
  -n flowstudio/flowstudio-mcp --config-schema smithery-config-schema.json
```

---

## 6. Official MCP Registry + VS Code MCP Gallery

### Status: ❌ Blocked — requires Streamable HTTP transport

- `registry.modelcontextprotocol.io` — canonical MCP server directory (currently in preview)
- Powers the **VS Code MCP Servers Marketplace** (via GitHub MCP Registry as intermediary)
- Pipeline: publish to Official MCP Registry → GitHub MCP Registry syncs → VS Code gallery displays
- Uses `mcp-publisher` CLI tool + `server.json` metadata file

### Blocker: Transport Incompatibility

- Registry `remotes` only supports `"type": "streamable-http"` or `"type": "sse"`
- **FlowStudio MCP currently uses JSON-RPC POST** (function-based), which is not a recognized transport type
- This also affects the Smithery server scan (item 6 above) — Streamable HTTP would resolve both

### What's needed (server-side, coordinated with John)

1. **Add Streamable HTTP transport support** to `mcp.flowstudio.app/mcp`:
   - `Mcp-Session-Id` header handling
   - `Accept: text/event-stream` support for streaming responses
   - Session initialization via `initialize` method
   - Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http
2. Once transport is supported, proceed with publishing below

### Namespace Options

| Auth method | Namespace | Requires |
|-------------|-----------|----------|
| Domain (preferred) | `app.flowstudio/power-automate-mcp` | Host `.well-known/mcp-registry-auth` on flowstudio.app |
| GitHub | `io.github.ninihen1/flowstudio-mcp` | `mcp-publisher login github` |

### How to Publish (once Streamable HTTP is supported)

```bash
# Install mcp-publisher
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher
sudo mv mcp-publisher /usr/local/bin/

# Authenticate (domain method — preferred for branding)
# First, host verification file at https://flowstudio.app/.well-known/mcp-registry-auth
mcp-publisher login http --domain "flowstudio.app" --private-key "${PRIVATE_KEY}"

# Or authenticate via GitHub (simpler, less branded namespace)
# mcp-publisher login github

# server.json already in repo root
mcp-publisher publish
```

### server.json (draft — ready to use once transport is supported)

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "app.flowstudio/power-automate-mcp",
  "title": "Flow Studio",
  "description": "AI agent tools to read, debug, and modify Power Automate cloud flows",
  "websiteUrl": "https://flowstudio.app",
  "version": "1.0.0",
  "repository": {
    "url": "https://github.com/ninihen1/FlowStudio-MCP",
    "source": "github"
  },
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://mcp.flowstudio.app/mcp",
      "headers": [
        {
          "name": "x-api-key",
          "description": "Flow Studio MCP API key (get from https://flowstudio.app)",
          "isRequired": true,
          "isSecret": true
        }
      ]
    }
  ]
}
```

---

## Priority & Execution Order

| Priority | Action | Effort | Status |
|----------|--------|--------|--------|
| 1 | ✅ awesome-copilot PR #896 | Done | ✅ Merged |
| 1b | awesome-copilot: debug + build + plugin | Done | ✅ [PR #899](https://github.com/github/awesome-copilot/pull/899) merged 2026-03-08 |
| 2 | ✅ Publish 3 skills to ClawHub | Done | ✅ v1.1.0 (metadata fix) |
| 3 | ✅ PR to anthropics/skills (all 3 skills) | Done | ⏳ [PR #555](https://github.com/anthropics/skills/pull/555) awaiting review |
| 4 | ✅ PR to openai/skills (all 3 skills) | Done | ⏳ [PR #231](https://github.com/openai/skills/pull/231) awaiting review |
| 5 | ✅ Publish 3 skills to Smithery | Done | ✅ Published (namespace: flowstudio) |
| 6 | ⚠️ Publish MCP server to Smithery | Done | ⚠️ Created — scan blocked by Cloudflare Bot Fight Mode |
| 7 | Publish to MCP Registry + VS Code Gallery | Blocked — needs Streamable HTTP transport | ❌ Blocked |
| 8 | ✅ skills.sh (Vercel) | Auto-indexed | ✅ Live — [3K+ installs](https://skills.sh/?q=flowstudio) |
| 9 | awesome-mcp-servers (appcypher) | Dead | ❌ PRs disabled on repo — PR #757 lost |
| 10 | awesome-remote-mcp-servers (jaw9c) | Done | ⏳ [PR #176](https://github.com/jaw9c/awesome-remote-mcp-servers/pull/176) awaiting review |
| 11 | mcpservers.org (wong2) | Low — web form | 🔲 Submit at https://mcpservers.org/submit |
| 12 | awesome-openclaw-skills (VoltAgent) | Done | ⏳ [PR #372](https://github.com/VoltAgent/awesome-openclaw-skills/pull/372) awaiting review |

---

## Key Details to Remember
- All skills use Agent Skills standard format (SKILL.md with name/description frontmatter)
- In awesome-copilot, the skill is named `flowstudio-power-automate-mcp` (renamed per reviewer)
- In all other platforms, skills keep original names: `power-automate-mcp`, `-debug`, `-build`
- Auth in all skills uses `x-api-key` header, never Bearer
- User-Agent `FlowStudio-MCP/1.0` required in all HTTP examples (Cloudflare blocks empty UA)
- PowerShell examples must include `-UseBasicParsing`
- awesome-copilot PRs target the **`staged`** branch; anthropics/skills and openai/skills target `main`
- The `skills/*/examples/` directory in FlowStudio MCP is gitignored (tenant-specific data)
