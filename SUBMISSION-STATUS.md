# Skill Distribution Status

> Reference doc for tracking skill submissions across all agent platforms.
> Last updated: 2026-04-04 (added Open VSX, Cursor, Gemini CLI, mcp.so, Glama, PulseMCP)

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
| **anthropics/skills** | Claude Code (85.2k ⭐, 9k forks) | ❌ [PR #555](https://github.com/anthropics/skills/pull/555) — repo only merges internal PRs. 267 open PRs, none merged externally. Superseded by Claude Code Plugin submission | ❌ PR #555 | ❌ PR #555 |
| **openai/skills** | Codex (11.2k ⭐, 622 forks) | ❌ [PR #231](https://github.com/openai/skills/pull/231) — repo only merges internal/partner PRs. 87 open PRs, none merged externally. Superseded by skills.sh + community forum | ❌ PR #231 | ❌ PR #231 |
| **Smithery** (skills) | 125k+ skills, 4.8k+ MCPs | ✅ Published ([flowstudio/power-automate-mcp](https://smithery.ai/skills/flowstudio/power-automate-mcp)) | ✅ Published ([flowstudio/power-automate-debug](https://smithery.ai/skills/flowstudio/power-automate-debug)) | ✅ Published ([flowstudio/power-automate-build](https://smithery.ai/skills/flowstudio/power-automate-build)) |
| **Smithery** (MCP server) | 4.8k+ MCPs | ✅ [Published](https://smithery.ai/servers/flowstudio-mcp/power-automate) — 28 tools discovered, namespace `flowstudio-mcp/power-automate` | N/A (server) | N/A (server) |
| **Official MCP Registry + VS Code Gallery** | All MCP clients, VS Code | ✅ [Published](https://registry.modelcontextprotocol.io/v0/servers?search=flowstudio) `io.github.ninihen1/flowstudio-mcp` v1.0.0 | N/A (skill, not server) | N/A (skill, not server) |
| **OpenAI Apps Directory** | ChatGPT Apps + Codex Plugins | ⚠️ Transport unblocked — still needs tool hint annotations on all 15 tools. Only blocks official app store listing; Codex users can already connect directly via config.toml or skills CLI | N/A (server) | N/A (server) |
| **copilot-mcp** (VS Code extension) | 482 ⭐, skills + MCP registry UI | ✅ Skills via skills.sh + registry via Official MCP Registry | ✅ Via skills.sh | ✅ Via skills.sh |
| **skills.sh** (Vercel) | Agent skills directory | ✅ Auto-indexed via awesome-copilot ([3K+ installs](https://skills.sh/?q=flowstudio)) | ✅ Auto-indexed (691 installs) | ✅ Auto-indexed (689 installs) |
| **skills CLI** (direct repo) | All 40+ agents | ✅ `npx skills add ninihen1/power-automate-mcp-skills -g -y` — tested, installs to 12+ agents | ✅ Installed | ✅ Installed |
| **awesome-mcp-servers** (appcypher) | 5.3k ⭐ GitHub list | ❌ PRs disabled on repo — PR #757 lost | N/A (server listing) | N/A (server listing) |
| **awesome-remote-mcp-servers** (jaw9c) | 1k ⭐ remote-only list | ⚠️ [PR #176](https://github.com/jaw9c/awesome-remote-mcp-servers/pull/176) — repo hasn't merged a community PR since May 2025 | N/A (server listing) | N/A (server listing) |
| **Claude Code Plugin** (official marketplace) | Claude Code + Claude.ai users (15.8k ⭐) | ⏳ Submitted 2026-04-03 via claude.ai/settings/plugins/submit + platform.claude.com/plugins/submit | ✅ Bundled | ✅ Bundled |
| **awesome-openclaw-skills** (VoltAgent) | 28.5k ⭐ curated list | ⚠️ [PR #372](https://github.com/VoltAgent/awesome-openclaw-skills/pull/372) — repo closing all PRs without merge | ⚠️ PR #372 | ⚠️ PR #372 |
| **community.openai.com** | OpenAI dev forum (Codex category) | ✅ [Posted 2026-04-03](https://community.openai.com/t/flow-studio-mcp-power-automate-debugging-and-building-skills-for-codex/1378409) | Linked | Linked |
| **openai/openai-cookbook** | OpenAI cookbook (9.2k ⭐) | ❌ Internal-only repo — all merged PRs from `*-oai` accounts. Cookbook content lives in `examples/codex-mcp-power-automate-cookbook.md` and is linked from the community forum post | N/A | N/A |
| **Docker MCP Registry** | Docker Desktop MCP Toolkit (461 ⭐, 702 forks) | ❌ Blocked — needs Streamable HTTP transport. Submit via [PR to docker/mcp-registry](https://github.com/docker/mcp-registry) once resolved | N/A (server listing) | N/A (server listing) |
| **mcpservers.org** (wong2) | 3.8k ⭐ + web directory | ⏳ Submitted 2026-04-04 via web form — awaiting approval | N/A (server listing) | N/A (server listing) |
| **Glama** | 20.8k MCP servers | ⏳ Submitted 2026-04-04 via Add Server | N/A (server listing) | N/A (server listing) |
| **PulseMCP** | 11.1k+ servers + newsletter | ⏳ Auto-ingests from Official MCP Registry weekly — no action needed | N/A (server listing) | N/A (server listing) |
| **VS Code Marketplace** (extension) | All VS Code users | ✅ [Published](https://marketplace.visualstudio.com/items?itemName=FlowStudio.flowstudio-mcp) v0.2.0 — multi-tenant, guided setup | ✅ Bundled | ✅ Bundled |
| **Open VSX** (extension) | VSCodium, Gitpod, Eclipse Theia | ✅ [Published](https://open-vsx.org/extension/FlowStudio/flowstudio-mcp) v0.2.0 | ✅ Bundled | ✅ Bundled |
| **Cursor Marketplace** (plugin) | Cursor IDE users | ⏳ Submitted 2026-04-04 — [repo](https://github.com/ninihen1/flowstudio-cursor-plugin) | N/A (server) | N/A (server) |
| **Gemini CLI Extensions** | Gemini CLI users | ⏳ Auto-indexing — `gemini-cli-extension` topic + `gemini-extension.json` in repo | N/A (server) | N/A (server) |
| **mcp.so** | MCP server directory | ⏳ Submitted 2026-04-04 via web form | N/A (server listing) | N/A (server listing) |

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
  -d '{"gitUrl": "https://github.com/ninihen1/power-automate-mcp-skills/tree/master/skills/power-automate-mcp"}'
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

### Status: ✅ Published

- `registry.modelcontextprotocol.io` — canonical MCP server directory
- Published 2026-04-03 as `io.github.ninihen1/flowstudio-mcp` v1.0.0
- Powers the **VS Code `@mcp` gallery** and **copilot-mcp registry tab**
- Auth: GitHub (`mcp-publisher login github`)
- Server transport: Streamable HTTP (upgraded 2026-04-03)

### Blocker: Transport Incompatibility

- Registry `remotes` only supports `"type": "streamable-http"` or `"type": "sse"`
- **FlowStudio MCP currently uses JSON-RPC POST** (function-based), which is not a recognized transport type
- This also affects: Smithery server scan, OpenAI Apps Directory, copilot-mcp registry tab, Docker MCP Registry
- **70% of servers** on the Official MCP Registry use streamable-http; it is the dominant transport

### Current server state (audited 2026-04-03)

| Aspect | Current | Required |
|--------|---------|----------|
| Protocol version | `2024-11-05` | `2025-03-26` |
| POST response | `application/json` (JSON-RPC) | `application/json` OK (SSE streaming optional) |
| Notification-only POSTs | Unknown | Must return `202 Accepted` (empty body) |
| GET endpoint | Returns 200 welcome page | Must return `405 Method Not Allowed` (or SSE stream) |
| DELETE endpoint | Returns 404 | Should return `405` (close enough, but 405 is correct) |
| `Mcp-Session-Id` header | Not returned | Optional (MAY assign) |
| `Origin` header validation | Not validated | MUST validate (DNS rebinding protection) |
| CORS headers | Already include `mcp-session-id`, `GET,POST,DELETE,OPTIONS` | Already set up |

### What's needed (server-side, coordinated with John)

The gap from current state to **minimum-viable streamable-http** is small. The core JSON-RPC POST/response flow stays the same — no SSE streaming required.

**Required changes:**
1. Return `protocolVersion: "2025-03-26"` in InitializeResult
2. Return `202 Accepted` (empty body) for notification-only POSTs (no `id` field)
3. Change GET to return `405 Method Not Allowed` instead of welcome page
4. Validate `Origin` header on all requests
5. Optionally return `Mcp-Session-Id` header on InitializeResult

**Not required (optional, can add later):**
- SSE streaming responses (server can always respond with `application/json`)
- GET SSE stream for server-initiated push (405 is valid)
- DELETE session termination (405 is valid)
- Resumability (`Last-Event-ID`)

**Spec reference:** https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http

Once transport is supported, proceed with publishing below.

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

## 7. OpenAI Apps Directory (ChatGPT + Codex Plugins)

### Status: ❌ Blocked — needs Streamable HTTP transport + tool hint annotations

- Submission portal: https://developers.openai.com/apps-sdk/deploy/submission
- Approved apps appear in ChatGPT Apps Directory and auto-create a Codex plugin
- Zero Power Automate apps exist — first-mover opportunity

### Blockers (2 items)

**1. Streamable HTTP transport** (same as MCP Registry blocker above)
- The submission requires a publicly accessible MCP server
- Server must support standard MCP transports — plain JSON-RPC POST is not recognized

**2. Tool hint annotations** (server-side)
- All 15 MCP tools need `readOnlyHint`, `destructiveHint`, `openWorldHint` annotations
- Review team checks that hints match actual behavior — misalignment causes rejection

| Category | Tools | Hints needed |
|----------|-------|-------------|
| Read-only (9) | `list_live_flows`, `list_live_environments`, `list_live_connections`, `get_live_flow`, `get_live_flow_http_schema`, `get_live_flow_trigger_url`, `get_live_flow_runs`, `get_live_flow_run_error`, `get_live_flow_run_action_outputs` | `readOnlyHint: true` |
| State-changing (6) | `trigger_live_flow`, `update_live_flow`, `add_live_flow_to_solution`, `resubmit_live_flow_run`, `cancel_live_flow_run`, `set_live_flow_state` | `readOnlyHint: false` + per-tool `destructiveHint`/`openWorldHint` |

Key annotations:
- `trigger_live_flow`: `destructiveHint: true`, `openWorldHint: true` (executes flow — may send emails, call external APIs)
- `update_live_flow`: `destructiveHint: true`, `openWorldHint: false` (overwrites definition, closed system)
- `resubmit_live_flow_run`: `destructiveHint: true`, `openWorldHint: true` (re-executes, same downstream effects)
- `cancel_live_flow_run`: `destructiveHint: true`, `openWorldHint: false` (irreversible for that run)
- `add_live_flow_to_solution`: `destructiveHint: false`, `openWorldHint: false` (reversible, closed system)
- `set_live_flow_state`: `destructiveHint: false`, `openWorldHint: false` (reversible toggle)

### Other submission requirements
- Organization verification (individual or business) on OpenAI Platform Dashboard
- Owner role required to submit
- Demo account with **no MFA** for review team
- Credentials tested **outside company network/VPN**
- CSP configured for exact domains the server fetches from (Power Automate API domains)
- Tools must return only necessary data — strip unnecessary PII, internal IDs, auth secrets

---

## 8. copilot-mcp (VS Code Extension)

### Status: ✅ Skills discoverable | ❌ Registry listing blocked

- Extension: [vikashloomba/copilot-mcp](https://github.com/vikashloomba/copilot-mcp) (482 stars, v0.0.92)
- Two discovery channels within the extension:

**Skills tab (via skills.sh):** ✅ Working
- Users searching "power automate" find all 3 Flow Studio skills
- Install: `npx skills add github/awesome-copilot@flowstudio-power-automate-mcp`

**Registry tab (via Official MCP Registry):** ❌ Blocked
- The extension's `buildRemoteInstall()` only accepts `streamable-http` or `sse` transport types
- Any other transport type returns `unavailableReason: "Remote transport '${remote.type}' is not supported"`
- Blocked by the same Streamable HTTP transport requirement as items 6 and 7

### Once Streamable HTTP is supported
- Publishing to the Official MCP Registry (item 6) automatically makes Flow Studio visible in this extension's registry tab
- No separate submission to copilot-mcp needed

---

## 9. skills CLI (direct repo install)

### Status: ✅ Working — tested 2026-04-03

- `npx skills add ninihen1/power-automate-mcp-skills -g -y` successfully installs all 3 skills
- Discovered 3 skills, installed to 12+ agents: Antigravity, Claude Code (symlinked), Codex, Cursor, Gemini CLI, GitHub Copilot, and 7 more
- Files land at `~/.agents/skills/power-automate-{mcp,build,debug}/`
- `npx skills list` confirms installation
- No submission needed — works directly from the GitHub repo

### Two install paths available to users
```bash
# Via awesome-copilot (indexed on skills.sh)
npx skills add github/awesome-copilot@flowstudio-power-automate-mcp

# Direct from repo (all 3 skills at once)
npx skills add ninihen1/power-automate-mcp-skills -g -y
```

---

## 10. VS Code Marketplace (Extension)

### Status: ✅ Published — verifying

- Publisher: [Flow Studio Solutions](https://marketplace.visualstudio.com/manage/publishers/FlowStudio) (ID: `FlowStudio`)
- Extension: [FlowStudio.flowstudio-mcp](https://marketplace.visualstudio.com/items?itemName=FlowStudio.flowstudio-mcp) v0.1.0
- Source: `vscode-extension/` directory in this repo
- Published: 2026-04-03 via `vsce publish`

### What it does
- Registers Flow Studio MCP server with GitHub Copilot Chat on install
- Multi-tenant support: users configure multiple connections for different tenants
- Guided onboarding: welcome notification with "Add Connection" / "Get API Key"
- Commands: `Flow Studio: Add Tenant Connection`, `Remove Tenant Connection`, `List Connections`
- API key prompt if user tries to use without configuring

### Technical details
- Uses `McpHttpServerDefinition` API (VS Code 1.101+)
- `contributes.mcpServerDefinitionProviders` in package.json
- ~100 lines of extension code in `extension.js`
- Settings stored in `flowstudio.mcp.servers` array (label + apiKey per tenant)

### Publishing
```bash
cd vscode-extension
npx @vscode/vsce package --allow-missing-repository
npx @vscode/vsce publish --pat "<PAT>"
```
PAT requires: Azure DevOps → Personal Access Tokens → Organization: "All accessible organizations" → Scope: Marketplace > Manage

### Does NOT require Streamable HTTP
This extension works with the current JSON-RPC over HTTP transport. It bypasses the MCP Registry entirely — users install the extension directly, which configures the MCP server connection.

---

## Priority & Execution Order

| Priority | Action | Effort | Status |
|----------|--------|--------|--------|
| 1 | ✅ awesome-copilot PR #896 | Done | ✅ Merged |
| 1b | awesome-copilot: debug + build + plugin | Done | ✅ [PR #899](https://github.com/github/awesome-copilot/pull/899) merged 2026-03-08 |
| 2 | ✅ Publish 3 skills to ClawHub | Done | ✅ v1.1.0 (metadata fix) |
| 3 | PR to anthropics/skills (all 3 skills) | Dead | ❌ [PR #555](https://github.com/anthropics/skills/pull/555) — repo only merges internal PRs |
| 4 | PR to openai/skills (all 3 skills) | Dead | ❌ [PR #231](https://github.com/openai/skills/pull/231) — repo only merges internal PRs |
| 5 | ✅ Publish 3 skills to Smithery | Done | ✅ Published (namespace: flowstudio) |
| 6 | ✅ Publish MCP server to Smithery | Done | ✅ [Published](https://smithery.ai/servers/flowstudio-mcp/power-automate) — 28 tools, new namespace `flowstudio-mcp` |
| 7 | ✅ Publish to MCP Registry + VS Code Gallery | Done | ✅ [Published](https://registry.modelcontextprotocol.io/v0/servers?search=flowstudio) `io.github.ninihen1/flowstudio-mcp` v1.0.0 |
| 8 | ✅ skills.sh (Vercel) | Auto-indexed | ✅ Live — [3K+ installs](https://skills.sh/?q=flowstudio) |
| 9 | awesome-mcp-servers (appcypher) | Dead | ❌ PRs disabled on repo — PR #757 lost |
| 10 | awesome-remote-mcp-servers (jaw9c) | Done | ⏳ [PR #176](https://github.com/jaw9c/awesome-remote-mcp-servers/pull/176) awaiting review |
| 11 | ⏳ mcpservers.org (wong2) | Submitted | ⏳ Submitted 2026-04-04 — awaiting approval |
| 12 | awesome-openclaw-skills (VoltAgent) | Done | ⏳ [PR #372](https://github.com/VoltAgent/awesome-openclaw-skills/pull/372) awaiting review |
| 13 | OpenAI Apps Directory (ChatGPT + Codex) | Transport unblocked — needs tool hints | ⚠️ Needs tool hint annotations on 15 tools |
| 14 | ✅ copilot-mcp extension (registry tab) | Auto-resolved | ✅ Visible via MCP Registry |
| 15 | ✅ skills CLI (direct repo install) | Tested | ✅ `npx skills add ninihen1/power-automate-mcp-skills -g -y` |
| 16 | ✅ VS Code Marketplace extension | Published | ✅ [FlowStudio.flowstudio-mcp](https://marketplace.visualstudio.com/items?itemName=FlowStudio.flowstudio-mcp) v0.2.0 |
| 17 | ✅ Open VSX extension | Published | ✅ [FlowStudio.flowstudio-mcp](https://open-vsx.org/extension/FlowStudio/flowstudio-mcp) v0.2.0 |
| 18 | ⏳ Cursor Marketplace plugin | Submitted | ⏳ Submitted 2026-04-04 |
| 19 | ⏳ Gemini CLI extension | Auto-indexing | ⏳ Topic + manifest in repo, crawler picks up within 24h |
| 20 | ⏳ mcp.so | Submitted | ⏳ Submitted 2026-04-04 via web form |
| 21 | ⏳ Glama | Submitted | ⏳ Submitted 2026-04-04 via Add Server |
| 22 | ⏳ PulseMCP | Auto-ingesting | ⏳ Ingests from MCP Registry weekly |

### Streamable HTTP Transport — Upgrade Complete (2026-04-03)

John deployed minimum-viable Streamable HTTP support. This unblocked:

| Channel | What it unblocks |
|---------|-----------------|
| Official MCP Registry + VS Code Gallery | ✅ Published |
| OpenAI Apps Directory | ✅ Transport unblocked (still needs tool hints) |
| copilot-mcp (registry tab) | ✅ Auto-visible |
| Docker MCP Registry | ✅ PR #2293 submitted |

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
