# FlowStudio MCP — GitHub Copilot Instructions

## Purpose of This Repository

This repository develops **GitHub Copilot agent skills** for [FlowStudio](https://flowstudio.app) — a Power Automate MCP (Model Context Protocol) service.

### Ultimate Goal

The primary goal is to publish high-quality, polished skills to
[github/awesome-copilot](https://github.com/github/awesome-copilot) for community visibility.
This drives awareness and subscription growth for the FlowStudio MCP service.

Every skill in this repo should be:
- **Genuinely useful** to any Power Automate developer using an MCP-capable agent
- **Self-contained** — a developer who has never heard of FlowStudio can pick it up and use it
- **Honest about the dependency** — skills should document that they require a FlowStudio MCP
  subscription (or compatible server), linking to https://flowstudio.app

### What is FlowStudio MCP?

FlowStudio exposes a JSON-RPC 2.0 MCP server (endpoint `/mcp`) that lets AI agents
read, modify, deploy, debug, and monitor Power Automate cloud flows programmatically.
The server supports multiple Power Platform tenants and environments, authenticated
via a per-workspace JWT passed as `x-api-key`.

---

## Repository Layout

```
.github/
  copilot-instructions.md   ← this file
skills/                     ← Public skills ready for awesome-copilot submission
  power-automate-mcp/       ← Core connection & operation skill
    SKILL.md
    references/
      TOOL-REFERENCE.md
      ACTION-TYPES.md
      CONNECTION-REFERENCES.md
  power-automate-debug/     ← Debug workflow skill
    SKILL.md
    references/
      COMMON-ERRORS.md
      DEBUG-WORKFLOW.md
  power-automate-build/     ← Build & deploy skill
    SKILL.md
    references/
      ACTION-PATTERNS-CORE.md
      ACTION-PATTERNS-DATA.md
      ACTION-PATTERNS-CONNECTORS.md
      FLOW-SCHEMA.md
      TRIGGER-TYPES.md
SKILL.md                    ← Opera Australia tenant-specific skill (gitignored, private)
README.md                   ← Repo overview & quick start
LICENSE                     ← MIT
.gitignore                  ← Excludes temp JSON files & private SKILL.md
```

---

## Coding / Authoring Standards

- Skill files must use the frontmatter format required by awesome-copilot:
  ```yaml
  ---
  name: skill-folder-name
  description: >-
    One-sentence description. Mention key trigger phrases so agents load it correctly.
  ---
  ```
- Folder names: lowercase, hyphen-separated (e.g. `power-automate-debug`)
- Each skill folder must contain at minimum a `SKILL.md`
- Keep bundled asset files under 5 MB each
- PowerShell examples in skills must use `-UseBasicParsing` on `Invoke-WebRequest`
  (avoids TLS parse prompt on Windows)
- Always demonstrate both the `tools/list` discovery step and actual tool calls
- Auth pattern: `x-api-key: <JWT>` header — never Bearer

---

## Submission Checklist (awesome-copilot PR)

1. Fork `github/awesome-copilot`
2. `npm run skill:create -- --name <skill-name> --description "<desc>"`
3. Copy content into the generated `SKILL.md`
4. Add any reference files under `skills/<name>/references/`
5. `npm run skill:validate`
6. `npm run build`
7. PR → target the **`staged`** branch (not `main`)
