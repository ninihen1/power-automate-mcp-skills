# Power Automate MCP Server by FlowStudio

Debug, build, and manage Power Automate cloud flows with AI — no portal needed.

## Setup

1. Get an API key at [mcp.flowstudio.app](https://mcp.flowstudio.app)
2. Set the environment variable: `FLOWSTUDIO_MCP_API_KEY=your-key`
3. Install this plugin in Cursor

## Available Tools

| Tool | Description |
|------|-------------|
| `list_live_flows` | List all flows in a Power Platform environment |
| `list_live_environments` | Discover all Power Platform environments |
| `list_live_connections` | List connectors and connection status |
| `get_live_flow` | Read the full flow definition |
| `get_live_flow_runs` | View recent run history |
| `get_live_flow_run_error` | Get per-action error breakdown for a failed run |
| `get_live_flow_run_action_outputs` | Inspect inputs/outputs of any action |
| `get_live_flow_http_schema` | Inspect HTTP trigger schema |
| `get_live_flow_trigger_url` | Get signed callback URL |
| `trigger_live_flow` | Run an HTTP, Button, or PowerApps flow |
| `update_live_flow` | Create or update a flow definition |
| `resubmit_live_flow_run` | Replay a failed run |
| `cancel_live_flow_run` | Cancel a running execution |
| `set_live_flow_state` | Start or stop a flow |
| `add_live_flow_to_solution` | Migrate a flow into a solution |

## Links

- [FlowStudio](https://flowstudio.app)
- [MCP Server](https://mcp.flowstudio.app)
- [Getting Started](https://learn.flowstudio.app/mcp-getting-started)
- [GitHub](https://github.com/ninihen1/power-automate-mcp-skills)
