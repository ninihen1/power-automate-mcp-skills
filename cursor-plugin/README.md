# Power Automate MCP Server by FlowStudio

Debug, build, and manage Power Automate cloud flows with AI — no portal needed.

## Setup

1. Get an API key at [mcp.flowstudio.app](https://mcp.flowstudio.app)
2. Set the environment variable: `FLOWSTUDIO_MCP_API_KEY=your-key`
3. Install this plugin in Cursor

## Available Tools

| Tool | Description |
|------|-------------|
| `list_live_environments` | Discover all environments visible to your account |
| `list_live_flows` | List all flows in a Power Platform environment |
| `get_live_flow` | Read the full flow definition; `includeTriggerUrl: true` adds the HTTP trigger URL |
| `get_live_flow_versions` | List a flow's earlier versions |
| `diff_live_flow` | Compare two versions of a flow |
| `get_live_flow_runs` | View recent run history with status and timing |
| `get_live_flow_run_error` | List the failed actions in a run, with their error codes |
| `get_live_flow_run_action_outputs` | Inspect inputs/outputs of any action, including loop iterations |
| `update_live_flow` | Create or update a flow (`dryRun: true` previews without saving) |
| `trigger_live_flow` | Run an HTTP, Button, PowerApps, Skills or scheduled flow |
| `resubmit_live_flow_run` | Replay a run using its original trigger data |
| `cancel_live_flow_run` | Cancel a currently running flow execution |
| `set_live_flow_state` | Start or stop a flow |
| `delete_live_flow` | Delete a flow; refused while your Delete Lock is on (the default) |
| `restore_live_flow` | Restore a deleted flow |
| `add_to_solution` | Add a flow or canvas app to a solution |
| `list_live_connections` | List connections and their status |
| `create_live_connection` | Create a connection, or sign one in again |
| `test_live_connection` | Test a connection |
| `describe_live_connector` | Describe a connector's operations, inputs and outputs |
| `resolve_live_parameters` | Get an action's dropdown options and list or table columns |
| `read_live_table` | Read rows from a Dataverse table, SharePoint list, SQL table or Excel table |

The server also offers `tool_search`, `list_skills`, `get_task`, `report_bug`, `grant_flow_studio_access`, and 15 Power Apps canvas tools (preview).

## Links

- [FlowStudio](https://flowstudio.app)
- [MCP Server](https://mcp.flowstudio.app)
- [Getting Started](https://learn.flowstudio.app/mcp-getting-started)
- [GitHub](https://github.com/ninihen1/power-automate-mcp-skills)
