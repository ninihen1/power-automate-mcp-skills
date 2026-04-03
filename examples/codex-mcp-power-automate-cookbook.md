# Debugging Power Automate Flows with Codex and MCP

This guide shows how to use Codex with a remote MCP server to debug, inspect, and fix Microsoft Power Automate cloud flows. The examples are from real production investigations.

## The problem

Power Automate's Graph API only returns top-level run status — succeeded or failed. When your Codex agent tries to help with a failing flow, it can only see:

```json
{
  "status": "Failed",
  "error": {
    "code": "ActionFailed",
    "message": "An action failed. No dependent actions succeeded."
  }
}
```

That's not enough to diagnose anything. A human would open the portal, click into the run, expand each action, and trace the failure. But an agent can't do any of that through the Graph API.

## The solution: MCP server for Power Automate

[Flow Studio MCP](https://mcp.flowstudio.app) is a remote MCP server that exposes Power Automate action-level data to AI agents. With it, your Codex agent can:

- Retrieve inputs and outputs for every action in a flow run
- Trace failures through parent flows, child flows, and loop iterations
- Compare successful and failed runs side by side
- Read and modify flow definitions
- Resubmit failed runs or cancel stuck ones

## Setup

### 1. Configure the MCP server

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<YOUR_TOKEN>"
```

Get your token at [mcp.flowstudio.app](https://mcp.flowstudio.app).

### 2. Install skills (optional, improves agent behavior)

Inside a Codex session:

```
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/master/skills/power-automate-mcp
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/master/skills/power-automate-debug
```

### 3. Verify the connection

Ask Codex: "List my Power Automate environments"

The agent should call `list_live_environments` and return your Power Platform environments.

## Example 1: Data entry error, not a flow bug

**Scenario:** A user reports the email flow is "broken" — it sent to the wrong people twice today.

**What the agent does:**

1. Calls `list_live_flows` to find the flow
2. Calls `get_live_flow_runs` to get the two "failed" runs
3. Calls `get_live_flow_run_action_outputs` to retrieve the Send Email action inputs

**What the agent finds:**

```
"to": "alice@example.com bob@example.com"
```

Missing semicolon between the two email addresses. The flow read the value from a SharePoint column and sent exactly what was there. Not a flow bug — a data entry error.

**Second report:** The CC field only had one recipient. The agent retrieves the action inputs again and finds the SharePoint column only contained one email address. The flow did exactly what it was told.

**Time to resolution:** Under 60 seconds for both issues. No flow changes needed.

**Why this matters:** Without MCP, the agent would only see "run succeeded" from the Graph API. It would have no way to inspect the action inputs or compare them against what was expected.

## Example 2: Expression error in a child flow

**Scenario:** A parent flow calls a child flow that fails intermittently. The portal shows `ExpressionEvaluationFailed` with no context.

**What the agent does:**

1. Calls `get_live_flow_runs` on the parent flow — finds one succeeded, one failed
2. Calls `get_live_flow_run_action_outputs` on both runs to compare
3. Traces into the child flow using the child's run ID
4. Finds the failing action inside an `Apply to each` loop

**What the agent finds:**

The expression `contains(string(item()?['serviceExceptionJson']), 'error')` crashes when `serviceExceptionJson` is a nested object instead of a flat string. On successful runs, the field is null or a flat string. On the failing run, a Power BI data source timeout returned a nested retry structure.

**Root cause:** Intermittent SQL timeout in the Power BI data source, not the flow logic.

**Why this matters:** The Graph API showed `ExpressionEvaluationFailed`. The portal would show the same status code. Only by inspecting the action inputs could the agent determine *what value* caused the expression to fail and trace it upstream.

## Example 3: Null values crash a child flow

**Scenario:** "ArtsVision Technical Roster for TOIL" parent + child flow. Child flow crashes on a subset of records.

**What the agent does:**

1. Traces from parent flow to child flow to the failing action
2. Finds `split(item()?['Name'], ', ')` crashing when `Name` is null
3. Scans all loop iteration outputs to measure the scope

**What the agent finds:**

38% of ArtsVision records have null Name fields. This isn't an edge case — it's a systemic data quality issue. The agent also finds a `CostCentre` vs `CostCenter` spelling mismatch causing silent data loss.

**The fix:** The agent uses `update_live_flow` to change the `union()` operation order so new data takes priority over archive data, ensuring records with populated Name fields are preferred.

**Why this matters:** In the portal, a human would need to click through each loop iteration to find affected records. When iterations fail, the portal has a "next failed" button. But when iterations *succeed with bad data* (no error thrown), there's no shortcut. The agent with MCP can scan all iterations in bulk.

## Available MCP tools

| Tool | What it does |
|---|---|
| `list_live_environments` | List Power Platform environments |
| `list_live_flows` | List flows in an environment |
| `get_live_flow` | Read full flow definition |
| `get_live_flow_runs` | Get recent run history |
| `get_live_flow_run_action_outputs` | Retrieve action-level inputs and outputs |
| `get_live_flow_run_error` | Get top-level error (use action outputs for detail) |
| `update_live_flow` | Modify flow definition |
| `trigger_live_flow` | Trigger a flow run |
| `resubmit_live_flow_run` | Resubmit a failed run |
| `cancel_live_flow_run` | Cancel a running flow |
| `set_live_flow_state` | Turn a flow on or off |
| `list_live_connections` | List API connections |
| `get_live_flow_trigger_url` | Get the HTTP trigger URL |

## Key insight

The core value of MCP for Power Automate is one thing: **action-level inputs and outputs**. The Graph API doesn't give you this. The portal does — but only for humans clicking through the UI. MCP bridges that gap for agents.

Everything else (child flow tracing, loop iteration scanning, expression error context) follows from having access to the action data.

## Resources

- [Flow Studio MCP](https://mcp.flowstudio.app) — subscription and token
- [GitHub repo](https://github.com/ninihen1/power-automate-mcp-skills) — skills, examples, plugin manifests
- [skills.sh](https://skills.sh/?q=flowstudio) — 3K+ installs
- [More examples](https://github.com/ninihen1/power-automate-mcp-skills/tree/master/examples)
