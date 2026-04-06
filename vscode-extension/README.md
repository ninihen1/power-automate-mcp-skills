# Power Automate MCP Server

Debug, build, manage, and govern Power Automate cloud flows with AI — no portal needed.

Ask Copilot why a flow failed, build new flows from natural language, audit your tenant, or check run history across environments. This extension connects the [Flow Studio](https://mcp.flowstudio.app) MCP server to GitHub Copilot Chat, giving your AI agent direct access to the Power Automate API and — with Pro+ — your tenant-wide governance and monitoring data.

## Why install this?

- **Find root causes in seconds** — get action-level error details, not just "An action failed". See exactly which action broke, what inputs it received, and what went wrong.
- **Build flows without the portal** — describe what you want in natural language and your AI agent creates the flow definition, wires connections, and deploys it.
- **Govern and monitor at tenant scale** _(Pro+)_ — query failing flows, maker inventory, and governance metadata across every flow in your tenant.
- **Work across multiple tenants** — connect to different clients or environments from a single VS Code window.
- **No context switching** — stay in your editor. No portal tabs, no clicking through run history.

## Setup

1. Install this extension
2. Get an API key at [mcp.flowstudio.app](https://mcp.flowstudio.app) — **free to start, 100 calls included**
3. When prompted, paste your API key — or use **Flow Studio: Add Tenant Connection** from the command palette

## Usage

In GitHub Copilot Chat, ask questions like:

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

## Skills

This extension works with five Flow Studio skills that tell Copilot when and how to use the tools.

| Skill                       | Purpose                                                                | Tier     |
| --------------------------- | ---------------------------------------------------------------------- | -------- |
| `power-automate-mcp`        | Core operations — list, read, inspect, trigger, resubmit, cancel flows | Basic    |
| `power-automate-debug`      | Diagnose failing flows with action-level inputs and outputs            | Basic    |
| `power-automate-build`      | Build and deploy new flows from natural language                       | Basic    |
| `power-automate-monitoring` | Tenant-wide flow health, failure rates, maker inventory                | **Pro+** |
| `power-automate-governance` | Classify, tag, audit, and manage flow compliance metadata              | **Pro+** |

Install skills via [skills.sh](https://skills.sh/?q=flowstudio) or browse them in [github/awesome-copilot](https://github.com/github/awesome-copilot).

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

- **Flow Studio: Add Tenant Connection** — add a new tenant
- **Flow Studio: Remove Tenant Connection** — remove a tenant
- **Flow Studio: List Connections** — view all configured tenants

Each tenant appears as a separate MCP server in Copilot Chat. API keys are stored securely in the OS keychain (Windows Credential Manager / macOS Keychain) — not in settings files.

## Requirements

- VS Code 1.101.0 or later
- GitHub Copilot Chat extension
- A [Flow Studio MCP](https://mcp.flowstudio.app) subscription (Basic or Pro+)

## Links

- [Flow Studio](https://flowstudio.app)
- [MCP Server](https://mcp.flowstudio.app)
- [Pricing](https://mcp.flowstudio.app/pricing)
- [Getting Started](https://learn.flowstudio.app/mcp-getting-started)
- [GitHub](https://github.com/ninihen1/power-automate-mcp-skills)
