# FlowStudio MCP — GitHub Copilot Agent Skills

GitHub Copilot agent skills for [FlowStudio](https://flowstudio.app), a
Power Automate MCP (Model Context Protocol) service that lets AI agents read,
modify, deploy, debug, and monitor Power Automate cloud flows programmatically.

## Skills

| Skill | Description |
|---|---|
| [`power-automate-mcp`](skills/power-automate-mcp/) | Connect to and operate Power Automate cloud flows — list flows, read definitions, check runs, resubmit, cancel |
| [`power-automate-debug`](skills/power-automate-debug/) | Step-by-step diagnostic process for investigating failing flows |
| [`power-automate-build`](skills/power-automate-build/) | Build, scaffold, and deploy Power Automate flow definitions from scratch |

Each skill is a self-contained folder with a `SKILL.md` instruction file and
bundled `references/` assets, following the
[Agent Skills specification](https://agentskills.io/specification) used by
[github/awesome-copilot](https://github.com/github/awesome-copilot).

## Prerequisites

- A [FlowStudio](https://flowstudio.app) MCP subscription (or compatible
  Power Automate MCP server)
- MCP endpoint URL (e.g. `https://<your-host>/mcp`)
- API key / JWT token (passed as `x-api-key` header — **not** Bearer)

## Quick Start

1. Copy the skill folder(s) you need into your project's `.github/skills/` directory
   (or wherever your agent discovers skills)
2. Configure your MCP server URL and JWT token
3. Ask your AI agent to "list my Power Automate flows" — the skill will guide it

## Repository Structure

```
.github/
  copilot-instructions.md   ← authoring standards & submission checklist
skills/
  power-automate-mcp/       ← core connection & operation skill
    SKILL.md
    references/
      TOOL-REFERENCE.md
      ACTION-TYPES.md
      CONNECTION-REFERENCES.md
  power-automate-debug/     ← debug workflow skill
    SKILL.md
    references/
      COMMON-ERRORS.md
      DEBUG-WORKFLOW.md
  power-automate-build/     ← build & deploy skill
    SKILL.md
    references/
      ACTION-PATTERNS.md
      FLOW-SCHEMA.md
      TRIGGER-TYPES.md
README.md                   ← this file
LICENSE                     ← MIT
```

## Contributing

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for
authoring standards and the awesome-copilot submission checklist.

## License

[MIT](LICENSE)
