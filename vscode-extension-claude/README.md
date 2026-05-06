# Power Automate MCP for Claude Code

Debug, build, manage, and govern Power Automate cloud flows from Claude Code — no portal, no manual `claude mcp add`, no shell-pasted API keys.

Ask Claude why a flow failed, build new flows from natural language, audit your tenant, or check run history across environments. This extension connects the [Flow Studio](https://mcp.flowstudio.app) MCP server to [Claude Code](https://www.anthropic.com/claude-code), giving your AI agent direct access to the Power Automate API and — with Pro+ — your tenant-wide governance and monitoring data.

## Why install this?

- **Find root causes in seconds** — get action-level error details, not just "An action failed". See exactly which action broke, what inputs it received, and what went wrong.
- **Build flows without the portal** — describe what you want in natural language and Claude creates the flow definition, wires connections, and deploys it.
- **Govern and monitor at tenant scale** _(Pro+)_ — query failing flows, maker inventory, and governance metadata across every flow in your tenant.
- **Work across multiple tenants** — connect to different clients or environments from a single VS Code window.
- **One-click setup** — no manual `git clone`, no editing config files, no pasting keys into shell history.

## Setup

1. Install this extension. (VS Code will prompt to also install Claude Code — accept.)
2. Get an API key at [mcp.flowstudio.app](https://mcp.flowstudio.app) — **free to start, 100 calls included**.
3. Run **Flow Studio (Claude): Add Tenant Connection** from the command palette and paste your API key.
4. Reload the window when prompted. Claude Code will pick up the new MCP server and the 5 bundled skills.

## Works everywhere Claude Code runs

This extension is a one-time configurator, not a runtime broker. It writes the MCP server entry to `~/.claude.json` and the 5 skills to `~/.claude/skills/` — the same files Claude Code reads no matter how it's launched. So once you've added a connection from VS Code, you can use it everywhere:

| Surface                              | MCP server | Skills |
| ------------------------------------ | :--------: | :----: |
| Claude Code in VS Code               | ✅         | ✅     |
| Claude Code in terminal (`claude`)   | ✅         | ✅     |
| Claude Code Desktop                  | ✅         | ✅     |

The Add / Remove / List Tenant Connection commands themselves live in VS Code's command palette — but their effects are global to your machine's Claude Code installation.

## Usage

In Claude Code, ask questions like:

- "List my Power Automate flows"
- "Why did this flow fail?"
- "Show me the last 5 runs of the daily report flow"
- "Create a new flow that sends a Teams message when a SharePoint item is created"

## Subscription tiers

| Capability                                              | Basic | Pro+ |
| ------------------------------------------------------- | ----- | ---- |
| Live tools (15) — read, debug, build, deploy flows      | ✅     | ✅    |
| Store tools (13) — cached governance, monitoring, audit | ❌     | ✅    |
| Governance metadata (tags, owners, business impact)     | ❌     | ✅    |
| Maker & Power Apps inventory                            | ❌     | ✅    |

Upgrade at [mcp.flowstudio.app/pricing](https://mcp.flowstudio.app/pricing).

## Skills (included)

This extension bundles all five Flow Studio skills. Claude loads them automatically based on what you ask — no separate install needed.

| Skill                                  | Purpose                                                                | Tier     |
| -------------------------------------- | ---------------------------------------------------------------------- | -------- |
| `flowstudio-power-automate-mcp`        | Core operations — list, read, inspect, trigger, resubmit, cancel flows | Basic    |
| `flowstudio-power-automate-debug`      | Diagnose failing flows with action-level inputs and outputs            | Basic    |
| `flowstudio-power-automate-build`      | Build and deploy new flows from natural language                       | Basic    |
| `flowstudio-power-automate-monitoring` | Tenant-wide flow health, failure rates, maker inventory                | **Pro+** |
| `flowstudio-power-automate-governance` | Classify, tag, audit, and manage flow compliance metadata              | **Pro+** |

The Pro+ skills only call tools your subscription allows. If your tier doesn't include them, Claude will tell you and suggest upgrading.

### Want the skills in other AI agents?

This extension installs skills into `~/.claude/skills/`, which makes them available to Claude Code in **VS Code, the terminal CLI, and the Desktop app** — all on the same install.

If you also use Codex, Cursor, Antigravity, Gemini CLI, OpenHands, Goose, Amp, GitHub Copilot, or any of 12+ other AI agents on your machine, install the same skills there in one command:

```bash
npx skills add ninihen1/power-automate-mcp-skills -g -y
```

This pulls the canonical skills directly from the Flow Studio repo and writes them into each agent's known skills directory. You still need to configure the Flow Studio MCP server in each agent separately — the command only installs skills, not server connections.

## Tools

### Live tools (Basic + Pro+)

Real-time calls to the Power Automate API:

| Tool                               | Description                                                     |
| ---------------------------------- | --------------------------------------------------------------- |
| `list_live_flows`                  | List all flows in a Power Platform environment                  |
| `list_live_environments`           | Discover all environments visible to your account               |
| `list_live_connections`            | List connectors and connection status                           |
| `get_live_flow`                    | Read the full flow definition (triggers, actions, parameters)   |
| `get_live_flow_runs`               | View recent run history with status and timing                  |
| `get_live_flow_run_error`          | Get per-action error breakdown for a failed run                 |
| `get_live_flow_run_action_outputs` | Inspect inputs/outputs of any action, including loop iterations |
| `get_live_flow_http_schema`        | Inspect the request/response schema of HTTP-triggered flows     |
| `get_live_flow_trigger_url`        | Get the signed callback URL for HTTP-triggered flows            |
| `trigger_live_flow`                | Trigger an HTTP-triggered flow with a JSON payload              |
| `update_live_flow`                 | Create a new flow or update an existing definition              |
| `resubmit_live_flow_run`           | Replay a failed run using its original trigger data             |
| `cancel_live_flow_run`             | Cancel a currently running flow execution                       |
| `set_live_flow_state`              | Start or stop a flow                                            |
| `add_live_flow_to_solution`        | Migrate a flow into a solution                                  |

### Store tools (Pro+ only)

Cached tenant-wide data from the Power Clarity workspace, refreshed daily. Includes governance metadata (tags, owners, business impact) that is not visible through the live Power Automate API.

| Tool                         | Description                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `list_store_flows`           | List every flow in your tenant from the daily scan                           |
| `get_store_flow`             | Get full flow details including governance metadata                          |
| `get_store_flow_runs`        | Cached run history with status and duration                                  |
| `get_store_flow_errors`      | Failed runs with error details and remediation hints                         |
| `get_store_flow_summary`     | Aggregated run statistics over a time window                                 |
| `get_store_flow_trigger_url` | Cached trigger URL from the daily snapshot                                   |
| `list_store_environments`    | List environments with governance metadata                                   |
| `list_store_connections`     | List all connections in the tenant with health status                        |
| `list_store_makers`          | List flow makers and their flow counts                                       |
| `get_store_maker`            | Get details for a specific maker                                             |
| `list_store_power_apps`      | List Power Apps in the tenant                                                |
| `update_store_flow`          | Write governance metadata (tags, owner, business impact, notification rules) |
| `set_store_flow_state`       | Start or stop a flow via cached metadata                                     |

Requires a [FlowStudio for Teams or MCP Pro+ subscription](https://mcp.flowstudio.app/pricing).

## Multi-Tenant Support

Connect to multiple tenants from the command palette:

- **Flow Studio (Claude): Add Tenant Connection** — add a new tenant
- **Flow Studio (Claude): Remove Tenant Connection** — remove a tenant
- **Flow Studio (Claude): List Connections** — view all configured tenants

Each tenant becomes a separate MCP server entry in `~/.claude.json` under the name `flowstudio-<slug>`.

## Where is my API key stored?

The API key is written to `~/.claude.json` in the `headers` field of your tenant's MCP server entry. This is the same on-disk shape that `claude mcp add --header` produces. On macOS and Linux, the extension `chmod 600`s the file so only your user can read it. On Windows, default ACLs already restrict the file to your user account.

If you prefer a stricter security posture (key in OS keychain, not on disk), keep using the manual `claude mcp add` flow with environment variable substitution — this extension trades that capability for one-click setup.

## Requirements

- VS Code 1.101.0 or later
- [Claude Code extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) (auto-installed as a dependency)
- A [Flow Studio MCP](https://mcp.flowstudio.app) subscription (Basic or Pro+)

## Links

- [Flow Studio](https://flowstudio.app)
- [MCP Server](https://mcp.flowstudio.app)
- [Pricing](https://mcp.flowstudio.app/pricing)
- [Getting Started](https://learn.flowstudio.app/mcp-getting-started)
- [GitHub](https://github.com/ninihen1/power-automate-mcp-skills)
