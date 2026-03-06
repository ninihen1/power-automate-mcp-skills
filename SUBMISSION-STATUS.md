# Skill Distribution Status

> Reference doc for tracking skill submissions across all agent platforms.
> Last updated: 2026-03-06

---

## Distribution Overview

All three skills use the **Agent Skills standard** (SKILL.md with `name`/`description` YAML frontmatter).
This format is natively compatible with: GitHub Copilot, Claude Code, OpenAI Codex, OpenClaw, Gemini CLI,
OpenHands, Goose, Amp, and more.

### Master Status Table

| Channel | Audience | `power-automate-mcp` | `power-automate-debug` | `power-automate-build` |
|---------|----------|---------------------|----------------------|----------------------|
| **awesome-copilot** | GitHub Copilot | ✅ [PR #896](https://github.com/github/awesome-copilot/pull/896) merged (as `flowstudio-power-automate-mcp`) | [PR #899](https://github.com/github/awesome-copilot/pull/899) submitted (as `flowstudio-power-automate-debug`) | [PR #899](https://github.com/github/awesome-copilot/pull/899) submitted (as `flowstudio-power-automate-build`) |
| **ClawHub** (OpenClaw) | 240k monthly visitors | ✅ Uploaded 2026-03-06 | ✅ Uploaded 2026-03-06 | ✅ Uploaded 2026-03-06 |
| **anthropics/skills** | Claude Code (85.2k ⭐, 9k forks) | Not yet submitted | Not yet submitted | Not yet submitted |
| **openai/skills** | Codex (11.2k ⭐, 622 forks) | Not yet submitted | Not yet submitted | Not yet submitted |
| **Smithery** | 125k+ skills, 4.8k+ MCPs | Not yet published | Not yet published | Not yet published |
| **Official MCP Registry** | All MCP clients | Not yet published | N/A (skill, not server) | N/A (skill, not server) |

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

### Next Steps
1. ~~Wait for @aaronpowell to re-review and merge~~ — **✅ Merged 2026-03-06**
2. Submit debug + build skills together:
   - Rename to `flowstudio-power-automate-debug` and `flowstudio-power-automate-build` (reviewer convention)
   - Update frontmatter `name:` field in each SKILL.md copy
   - Fixes already applied: User-Agent header, list_live_flows response shape
   ```bash
   cd ~/GitHub/awesome-copilot
   git checkout staged && git pull upstream staged
   git checkout -b add-power-automate-debug-build

   mkdir -p skills/flowstudio-power-automate-debug/references
   cp ~/GitHub/"FlowStudio MCP"/skills/power-automate-debug/SKILL.md skills/flowstudio-power-automate-debug/SKILL.md
   cp ~/GitHub/"FlowStudio MCP"/skills/power-automate-debug/references/* skills/flowstudio-power-automate-debug/references/
   # Update frontmatter name to flowstudio-power-automate-debug

   mkdir -p skills/flowstudio-power-automate-build/references
   cp ~/GitHub/"FlowStudio MCP"/skills/power-automate-build/SKILL.md skills/flowstudio-power-automate-build/SKILL.md
   cp ~/GitHub/"FlowStudio MCP"/skills/power-automate-build/references/* skills/flowstudio-power-automate-build/references/
   # Update frontmatter name to flowstudio-power-automate-build

   npm run skill:validate && npm run build
   git add skills/flowstudio-power-automate-debug skills/flowstudio-power-automate-build
   git commit -m "feat: add flowstudio-power-automate-debug and flowstudio-power-automate-build skills"
   git push origin add-power-automate-debug-build
   gh pr create --repo github/awesome-copilot --base staged \
     --head ninihen1:add-power-automate-debug-build \
     --title "feat: add flowstudio-power-automate-debug and flowstudio-power-automate-build skills"
   ```

### Key Details
- PRs target the **`staged`** branch (not `main`)
- Validate: `npm run skill:validate` then `npm run build`
- Fork: `~/GitHub/awesome-copilot` (`origin` = ninihen1, `upstream` = github)

---

## 2. OpenClaw — ClawHub

### Status: ✅ All 3 skills uploaded

- **ClawHub** (clawhub.ai): 13,729 skills, 240k monthly visitors
- **awesome-openclaw-skills** (VoltAgent/awesome-openclaw-skills): 28.5k stars curated list

### How We Uploaded
1. Went to https://clawhub.ai/upload
2. Signed in with GitHub
3. Uploaded each skill folder (SKILL.md + references/)
4. Skills auto-published to `openclaw/skills` repo on GitHub

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

### Status: Ready to submit

- Repo: `anthropics/skills` (85.2k ⭐, 9k forks, 267 open PRs)
- 17 official example skills in `skills/` directory
- Same `SKILL.md` format — our skills are directly compatible, no reformatting needed
- PRs target `main` branch
- Can also register as Claude Code Plugin marketplace

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

### Status: Ready to submit

- Repo: `openai/skills` (11.2k ⭐, 622 forks, 87 open PRs)
- Skills organized by tiers: `.system` (built-in), `.curated` (vetted), `.experimental` (community)
- Community contributions go to `skills/.experimental/`
- Same SKILL.md format — no reformatting needed
- Lightweight contributing guidelines (Contributor Covenant, no CLA)
- Install via `$skill-installer` in Codex

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

### Status: Ready to publish (skills + MCP server)

- smithery.ai — 4,824+ MCP servers, 125,300+ skills
- Supports **both** MCP server publishing AND Agent Skills publishing
- GitHub sign-in required

### Publishing Skills (3 skills)
1. Go to https://smithery.ai/skills/new
2. Sign in with GitHub
3. Upload each skill (SKILL.md + references)
4. Skills get a dedicated page and install count tracking

### Publishing the MCP Server
1. Go to https://smithery.ai/servers/new
2. Enter FlowStudio MCP URL: `https://mcp.flowstudio.app/mcp`
3. Smithery Gateway proxies to the upstream server
4. **⚠️ Cloudflare issue**: Smithery sends `User-Agent: SmitheryBot/1.0`. If Cloudflare Bot Fight Mode blocks it, options:
   - Whitelist `SmitheryBot/1.0` in Cloudflare WAF rules
   - Serve a `/.well-known/mcp/server-card.json` endpoint to bypass scanning
   - Ensure server returns 401 (not 403) for unauthenticated requests
5. Requires Streamable HTTP transport support

---

## 6. Official MCP Registry

### Status: Requires investigation — may not be compatible yet

- `registry.modelcontextprotocol.io` — canonical MCP server directory (currently in preview)
- Publishes the **FlowStudio MCP server** itself, not individual skills
- Uses `mcp-publisher` CLI tool + `server.json` metadata file

### Compatibility Considerations
- Registry expects either an **npm package** (stdio transport) or a **remote server** (Streamable HTTP/SSE)
- FlowStudio MCP uses JSON-RPC over HTTP with `x-api-key` auth — this maps to the `remotes` approach
- The `headers` property in `server.json` supports custom headers like `X-API-Key`
- Server name: `io.github.ninihen1/flowstudio-mcp` (GitHub auth prefix)
- **Question**: Does FlowStudio MCP support Streamable HTTP transport, or only JSON-RPC POST? The registry expects MCP protocol compliance.

### How to Publish (if compatible)
```bash
# Install mcp-publisher
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher
sudo mv mcp-publisher /usr/local/bin/

# Authenticate
mcp-publisher login github

# Create server.json
cat > server.json << 'EOF'
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "io.github.ninihen1/flowstudio-mcp",
  "title": "FlowStudio MCP",
  "description": "Read, modify, deploy, debug, and monitor Power Automate cloud flows via MCP",
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
          "description": "FlowStudio workspace JWT (get from https://flowstudio.app)",
          "isRequired": true,
          "isSecret": true
        }
      ]
    }
  ]
}
EOF

# Publish
mcp-publisher publish
```

---

## Priority & Execution Order

| Priority | Action | Effort | Status |
|----------|--------|--------|--------|
| 1 | ✅ awesome-copilot PR #896 | Done | ✅ Merged |
| 1b | awesome-copilot: debug + build skills | Done | [PR #899](https://github.com/github/awesome-copilot/pull/899) submitted |
| 2 | ✅ Upload 3 skills to ClawHub | Done | ✅ Complete |
| 3 | PR to anthropics/skills (all 3 skills) | Low — same format, one PR | Ready |
| 4 | PR to openai/skills (all 3 skills) | Low — same format, `.experimental/` | Ready |
| 5 | Publish 3 skills to Smithery | Low — GitHub sign-in, upload | Ready |
| 6 | Publish MCP server to Smithery | Low — enter URL | Ready (check Cloudflare) |
| 7 | Publish to MCP Registry | Medium — needs server.json, verify transport | Investigate |
| 8 | PR to awesome-openclaw-skills | Low — needs traction first | Deferred |

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
