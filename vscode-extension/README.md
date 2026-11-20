# Power Automate MCP Server

Debug, build, manage, and govern Power Automate cloud flows with AI — no portal needed.

Ask Copilot why a flow failed, build new flows from natural language, audit your tenant, or check run history across environments. This extension connects the [FlowStudio](https://mcp.flowstudio.app) MCP server to GitHub Copilot Chat, giving your AI agent direct access to the Power Automate API and — with Pro+ — your tenant-wide governance and monitoring data.

## Why install this?

- **Find root causes in seconds** — get action-level error details, not just "An action failed". See exactly which action broke, what inputs it received, and what went wrong.
- **Build flows without the portal** — describe what you want in natural language and your AI agent creates the flow definition, wires connections, and deploys it.
- **Govern and monitor at tenant scale** _(Pro+)_ — query failing flows, maker inventory, and governance metadata across every flow in your tenant.
- **Work across multiple tenants** — connect to different clients or environments from a single VS Code window.
- **No context switching** — stay in your editor. No portal tabs, no clicking through run history.

## Setup

1. Install this extension
2. Get an API key at [mcp.flowstudio.app](https://mcp.flowstudio.app) — **free for 21 days, up to 100 calls**
3. When prompted, paste your API key — or use **FlowStudio: Add Tenant Connection** from the command palette

## Usage

In GitHub Copilot Chat, ask questions like:

- "List my Power Automate flows"
- "Why did this flow fail?"
- "Show me the last 5 runs of the daily report flow"
- "Create a new flow that sends a Teams message when a SharePoint item is created"

## Subscription tiers

| Capability                                          | Starter / Pro | Pro+ |
| --------------------------------------------------- | ------------- | ---- |
| Live tools — read, debug, build, deploy flows       | ✅             | ✅    |
| Canvas app tools (preview)                          | ✅             | ✅    |
| Store tools — cached governance, monitoring, audit  | ❌             | ✅    |
| Governance metadata (tags, owners, business impact) | ❌             | ✅    |
| Maker & Power Apps inventory                        | ❌             | ✅    |

Upgrade at [mcp.flowstudio.app/pricing](https://mcp.flowstudio.app/pricing).

## Skills (included)

This extension bundles all nine FlowStudio skills. Copilot loads them automatically based on what you ask — no separate install needed.

| Skill                       | Purpose                                                                | Tier     |
| --------------------------- | ---------------------------------------------------------------------- | -------- |
| `power-automate-mcp`        | Core operations — list, read, inspect, trigger, resubmit, cancel flows | Any plan |
| `power-automate-debug`      | Diagnose failing flows with action-level inputs and outputs            | Any plan |
| `power-automate-build`      | Build and deploy new flows from natural language                       | Any plan |
| `power-automate-monitoring` | Tenant-wide flow health, failure rates, maker inventory                | **Pro+** |
| `power-automate-governance` | Classify, tag, audit, and manage flow compliance metadata              | **Pro+** |
| `power-apps-canvas-mcp`     | Canvas tool ground rules — sessions, draft vs live, timeouts           | Preview  |
| `power-apps-canvas-read`    | Inspect, audit, and diff canvas apps                                   | Preview  |
| `power-apps-canvas-edit`    | Build and change screens, controls, formulas, data sources             | Preview  |
| `power-apps-canvas-ship`    | Push and publish canvas changes safely                                 | Preview  |

The Preview skills use the Power Apps canvas tools, which are in preview and on for every plan.

The Pro+ skills only call tools your subscription allows. If your tier doesn't include them, Copilot will tell you and suggest upgrading.

### Reach: VS Code Copilot Chat **and** GitHub Copilot CLI

Installing this extension wires FlowStudio into both surfaces of GitHub Copilot:

- **VS Code Copilot Chat** — via the `chatSkills` contribution point (in-process, no filesystem write)
- **GitHub Copilot CLI (`gh copilot` / `copilot`)** — via filesystem bootstrap. On activation, the extension copies the bundled skills into `~/.copilot/skills/flowstudio-*/` and adds a `flowstudio-<connection>` entry to `~/.copilot/mcp-config.json`. Detected automatically by the presence of `~/.copilot/`. Each connection you Add or Remove in VS Code is mirrored into the CLI config in the same step.

If Copilot CLI isn't installed yet, that part is silently skipped. Install Copilot CLI later, then reload VS Code — the extension picks it up on next activation.

### Want the skills in other AI agents?

If you also use Claude Code, Codex, Cursor, Antigravity, Gemini CLI, OpenHands, Goose, Amp, or any of 12+ other AI agents on your machine, install the same skills there in one command:

```bash
npx skills add ninihen1/power-automate-mcp-skills -g -y
```

This pulls the canonical skills directly from the FlowStudio repo and writes them into each agent's known skills directory. You still need to configure the FlowStudio MCP server in each agent separately — the command only installs skills, not server connections.

## Tools

### Live tools (Basic + Pro+)

Real-time calls to the Power Automate API:

| Tool                               | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `list_live_environments`           | Discover all environments visible to your account                                  |
| `list_live_flows`                  | List all flows in a Power Platform environment                                     |
| `get_live_flow`                    | Read the full flow definition; `includeTriggerUrl: true` adds the HTTP trigger URL |
| `get_live_flow_versions`           | List a flow's earlier versions                                                     |
| `diff_live_flow`                   | Compare two versions of a flow                                                     |
| `get_live_flow_runs`               | View recent run history with status and timing                                     |
| `get_live_flow_run_error`          | List the failed actions in a run, with their error codes                           |
| `get_live_flow_run_action_outputs` | Inspect inputs/outputs of any action, including loop iterations                    |
| `update_live_flow`                 | Create or update a flow (`dryRun: true` previews without saving)                   |
| `trigger_live_flow`                | Run an HTTP, Button, PowerApps, Skills or scheduled flow                           |
| `resubmit_live_flow_run`           | Replay a run using its original trigger data                                       |
| `cancel_live_flow_run`             | Cancel a currently running flow execution                                          |
| `set_live_flow_state`              | Start or stop a flow                                                               |
| `delete_live_flow`                 | Delete a flow; refused while your Delete Lock is on (the default)                  |
| `restore_live_flow`                | Restore a deleted flow                                                             |
| `add_to_solution`                  | Add a flow or canvas app to a solution                                             |
| `list_live_connections`            | List connections and their status                                                  |
| `create_live_connection`           | Create a connection, or sign one in again                                          |
| `test_live_connection`             | Test a connection                                                                  |
| `describe_live_connector`          | Describe a connector's operations, inputs and outputs                              |
| `resolve_live_parameters`          | Get an action's dropdown options and list or table columns                         |
| `read_live_table`                  | Read rows from a Dataverse table, SharePoint list, SQL table or Excel table        |

The server also offers `tool_search`, `list_skills`, `get_task`, `report_bug`, `grant_flow_studio_access`, and 15 Power Apps canvas tools (preview).

### Store tools (Pro+ only)

Cached tenant-wide data from the Power Clarity workspace, refreshed daily. Includes governance metadata (tags, owners, business impact) that is not visible through the live Power Automate API.

| Tool                      | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `list_store_flows`        | List every flow in your tenant from the daily scan                             |
| `get_store_flow`          | Get full flow details including governance metadata                            |
| `get_store_flow_runs`     | Cached run history with status, duration, failed actions and remediation hints |
| `get_store_flow_summary`  | Aggregated run statistics over a time window                                   |
| `list_store_environments` | List environments with governance metadata                                     |
| `list_store_connections`  | List all connections in the tenant with health status                          |
| `list_store_makers`       | List flow makers and their flow counts                                         |
| `get_store_maker`         | Get details for a specific maker                                               |
| `list_store_power_apps`   | List Power Apps in the tenant                                                  |
| `update_store_flow`       | Write governance metadata (tags, owner, business impact, notification rules)   |

Requires an [MCP Pro+ subscription](https://mcp.flowstudio.app/pricing).

## Multi-Tenant Support

Connect to multiple tenants from the command palette:

- **FlowStudio: Add Tenant Connection** — add a new tenant
- **FlowStudio: Remove Tenant Connection** — remove a tenant
- **FlowStudio: List Connections** — view all configured tenants

Each tenant appears as a separate MCP server in Copilot Chat. API keys are stored securely in the OS keychain (Windows Credential Manager / macOS Keychain) — not in settings files.

## Requirements

- VS Code 1.101.0 or later
- GitHub Copilot Chat extension
- A [FlowStudio MCP](https://mcp.flowstudio.app) plan (Starter, Pro or Pro+)

## Links

- [FlowStudio](https://flowstudio.app)
- [MCP Server](https://mcp.flowstudio.app)
- [Pricing](https://mcp.flowstudio.app/pricing)
- [Getting Started](https://learn.flowstudio.app/mcp-getting-started)
- [GitHub](https://github.com/ninihen1/power-automate-mcp-skills)
