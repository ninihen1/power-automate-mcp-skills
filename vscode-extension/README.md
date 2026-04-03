# Power Automate MCP Server

Debug, build, and manage Power Automate cloud flows with AI — no portal needed.

Ask Copilot why a flow failed, build new flows from natural language, or check run history across tenants. This extension connects the [Flow Studio](https://mcp.flowstudio.app) MCP server to GitHub Copilot Chat, giving your AI agent direct access to the Power Automate API.

## Why install this?

- **Find root causes in seconds** — get action-level error details, not just "An action failed". See exactly which action broke, what inputs it received, and what went wrong.
- **Build flows without the portal** — describe what you want in natural language and your AI agent creates the flow definition, wires connections, and deploys it.
- **Work across multiple tenants** — connect to different clients or environments from a single VS Code window.
- **No context switching** — stay in your editor. No portal tabs, no clicking through run history.

## Setup

1. Install this extension
2. Get an API key at [mcp.flowstudio.app](https://mcp.flowstudio.app)
3. When prompted, paste your API key — or use **Flow Studio: Add Tenant Connection** from the command palette

## Usage

In GitHub Copilot Chat, ask questions like:

- "List my Power Automate flows"
- "Why did this flow fail?"
- "Show me the last 5 runs of the daily report flow"
- "Create a new flow that sends a Teams message when a SharePoint item is created"

## Available Tools

| Tool | Description |
|------|-------------|
| `list_live_flows` | List all flows in a Power Platform environment |
| `list_live_environments` | Discover all environments visible to your account |
| `list_live_connections` | List connectors and connection status |
| `get_live_flow` | Read the full flow definition (triggers, actions, parameters) |
| `get_live_flow_runs` | View recent run history with status and timing |
| `get_live_flow_run_error` | Get per-action error breakdown for a failed run |
| `get_live_flow_run_action_outputs` | Inspect inputs/outputs of any action, including loop iterations |
| `get_live_flow_http_schema` | Inspect the request/response schema of HTTP-triggered flows |
| `get_live_flow_trigger_url` | Get the signed callback URL for HTTP-triggered flows |
| `trigger_live_flow` | Trigger an HTTP-triggered flow with a JSON payload |
| `update_live_flow` | Create a new flow or update an existing definition |
| `resubmit_live_flow_run` | Replay a failed run using its original trigger data |
| `cancel_live_flow_run` | Cancel a currently running flow execution |
| `set_live_flow_state` | Start or stop a flow |
| `add_live_flow_to_solution` | Migrate a flow into a solution |

## Multi-Tenant Support

Connect to multiple tenants from the command palette:

- **Flow Studio: Add Tenant Connection** — add a new tenant
- **Flow Studio: Remove Tenant Connection** — remove a tenant
- **Flow Studio: List Connections** — view all configured tenants

Each tenant appears as a separate MCP server in Copilot Chat. API keys are stored securely in the OS keychain (Windows Credential Manager / macOS Keychain) — not in settings files.

## Requirements

- VS Code 1.101.0 or later
- GitHub Copilot Chat extension
- A [Flow Studio MCP](https://mcp.flowstudio.app) subscription

## Links

- [Flow Studio](https://flowstudio.app)
- [MCP Server](https://mcp.flowstudio.app)
- [Getting Started](https://learn.flowstudio.app/mcp-getting-started)
- [GitHub](https://github.com/ninihen1/power-automate-mcp-skills)
