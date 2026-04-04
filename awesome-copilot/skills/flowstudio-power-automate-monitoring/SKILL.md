---
name: flowstudio-power-automate-monitoring
description: >-
  Monitor Power Automate flow health, track failure rates, and inventory tenant
  assets using the FlowStudio MCP cached store. The live API only returns
  top-level run status. Store tools surface aggregated stats, per-run failure
  details with remediation hints, maker activity, and Power Apps inventory —
  all from a fast Azure-table cache with no rate-limit pressure on the PA API.
  Load this skill when asked to: check flow health, find failing flows, get
  failure rates, review error trends, list all flows with monitoring enabled,
  check who built a flow, find inactive makers, inventory Power Apps, see
  environment or connection counts, get a flow summary, or any tenant-wide
  health overview. Requires a FlowStudio for Teams subscription —
  see https://mcp.flowstudio.app
metadata:
  openclaw:
    requires:
      env:
        - FLOWSTUDIO_MCP_TOKEN
    primaryEnv: FLOWSTUDIO_MCP_TOKEN
    homepage: https://mcp.flowstudio.app
---

# Power Automate Monitoring with FlowStudio MCP

Monitor flow health, track failure rates, and inventory tenant assets through
the FlowStudio MCP **cached store** — fast reads, no PA API rate limits, and
enriched with governance metadata and remediation hints.

> **Requires:** A [FlowStudio for Teams](https://mcp.flowstudio.app) subscription.
> Store tools read from Azure Table snapshots (`gFlows`, `gRuns`, `gMakers`,
> `gApps`, `gConnections`, `gEnvs`) in each customer's workspace storage.
> These tables are populated by the Flow Studio scanning pipeline — flows are
> only scanned when the `monitor` flag is toggled on. You will need:
> - MCP endpoint: `https://mcp.flowstudio.app/mcp`
> - API key / JWT token (`x-api-key` header — NOT Bearer)
> - Power Platform environment name (e.g. `Default-<tenant-guid>`)
>
> **Known limitation (April 2026):** The scanning pipeline that populates
> `gRuns` (run-level data) requires MS Graph and Power Platform Admin OAuth
> consent tokens in `gAccounts`, which are provisioned through the Flow Studio
> for Teams app — not through MCP onboarding. Until Graph consent is configured
> for a workspace, `get_store_flow_runs`, `get_store_flow_errors`, and
> `get_store_flow_summary` will return empty results. The `gFlows`-level stats
> (`runPeriodTotal`, `runPeriodFailRate`, etc.) and asset inventory tools
> (`list_store_flows`, `list_store_makers`, `list_store_power_apps`, etc.)
> work correctly. This is being fixed.

---

## Source of Truth

> **Always call `tools/list` first** to confirm available tool names and their
> parameter schemas. Tool names and parameters may change between server versions.
> This skill covers response shapes, behavioral notes, and monitoring patterns —
> things `tools/list` cannot tell you. If this document disagrees with `tools/list`
> or a real API response, the API wins.

---

## How Monitoring Works

Flow Studio has a scanning pipeline that runs daily for each FlowStudio for
Teams subscriber. The pipeline scans the Power Automate API and writes
results to per-workspace Azure Table Storage.

### Two levels of scanning

- **All flows** get their metadata scanned: definition, connections, owners,
  trigger type, and aggregate run counts (`runPeriodTotal`,
  `runPeriodFailRate`, etc. on the `gFlows` record). Environments, apps,
  connections, and makers are also scanned.
- **Monitored flows** (`monitor: true`) additionally get per-run detail
  scanning: individual run records written to `gRuns` with status, duration,
  failed action names, and remediation hints. This is what populates
  `get_store_flow_runs`, `get_store_flow_errors`, and `get_store_flow_summary`.

### Data freshness

Check the `scanned` field on any `get_store_flow` response to see when a
flow was last scanned. The `nextScan` field shows when the next scan is
scheduled. If `scanned` is stale (days old), the scanning pipeline may not
be running for that workspace.

### Setting monitoring flags

The `monitor` flag and notification settings (`rule_notify_onfail`,
`rule_notify_onmissingdays`, `rule_notify_email`) can be set via:
- The Flow Studio for Teams app in Microsoft Teams
  ([how to select flows](https://learn.flowstudio.app/teams-monitoring))
- The `update_store_flow` MCP tool (see `power-automate-governance` skill)

---

## Python Helper

```python
import json, urllib.request

MCP_URL   = "https://mcp.flowstudio.app/mcp"
MCP_TOKEN = "<YOUR_JWT_TOKEN>"

def mcp(tool, **kwargs):
    payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                          "params": {"name": tool, "arguments": kwargs}}).encode()
    req = urllib.request.Request(MCP_URL, data=payload,
        headers={"x-api-key": MCP_TOKEN, "Content-Type": "application/json",
                 "User-Agent": "FlowStudio-MCP/1.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=120)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"MCP HTTP {e.code}: {body[:200]}") from e
    raw = json.loads(resp.read())
    if "error" in raw:
        raise RuntimeError(f"MCP error: {json.dumps(raw['error'])}")
    return json.loads(raw["result"]["content"][0]["text"])

ENV = "<environment-id>"   # e.g. Default-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## What You Can Do

| Tool | What it does |
|---|---|
| `list_store_flows` | List flows with governance flags, failure rates, and monitoring filters |
| `get_store_flow` | Full cached `gFlows` record: run stats, owners, tier, connections, definition |
| `get_store_flow_summary` | Aggregated run stats from `gRuns`: success/fail rate, avg/max duration |
| `get_store_flow_runs` | Per-run history from `gRuns` with duration, status, failed actions, remediation |
| `get_store_flow_errors` | Failed-only runs from `gRuns` with action names and remediation hints |
| `get_store_flow_trigger_url` | Trigger URL from cache (instant, no PA API call) |
| `set_store_flow_state` | Start or stop a flow via live PA API and sync state back to cache |
| `list_store_environments` | All Power Platform environments from `gEnvs` cache |
| `list_store_connections` | All connections from `gConnections` cache |
| `list_store_makers` | All makers (citizen developers) from `gMakers` cache |
| `get_store_maker` | Full maker record: flow/app counts, licenses, account status |
| `list_store_power_apps` | All Power Apps canvas apps from `gApps` cache |

---

## Store vs Live — When to Use Which

| Scenario | Use Store | Use Live |
|---|---|---|
| "How many flows are failing?" | `list_store_flows` | — |
| "Show me this flow's error history" | `get_store_flow_errors` | — |
| "What's the fail rate over 30 days?" | `get_store_flow_summary` (with `startTime`) | — |
| "Read the full flow definition" | `get_store_flow` has it (JSON string) | `get_live_flow` (structured) |
| "Inspect action outputs from a run" | — | `get_live_flow_run_action_outputs` |
| "Resubmit a failed run" | — | `resubmit_live_flow_run` |

> **Rule of thumb**: Store tools answer "what happened?" and "how healthy is it?"
> Live tools answer "what exactly went wrong?" and "fix it now."

> **Important**: `get_store_flow_summary`, `get_store_flow_runs`, and
> `get_store_flow_errors` read from `gRuns`. This table is only populated for
> flows with `monitor: true` that have been scanned. If these tools return empty
> results, check whether the flow is monitored and has been scanned recently
> (see the `scanned` field in `get_store_flow`).

---

## Step 1 — Discover Your Environment

```python
envs = mcp("list_store_environments")
# Returns direct array:
# [{"id": "Default-26e65220-...", "displayName": "Flow Studio (default)",
#   "sku": "Default", "type": "NotSpecified", "location": "australia",
#   "isDefault": true, "isAdmin": true, "isManagedEnvironment": false,
#   "createdTime": "2017-01-18T01:06:46Z"}]

for e in envs:
    print(e["id"], "|", e["displayName"], "|", e["sku"],
          "|", "default" if e.get("isDefault") else "",
          "|", "managed" if e.get("isManagedEnvironment") else "")

ENV = next(e["id"] for e in envs if e.get("isDefault"))
```

> `sku` values: `Default`, `Production`, `Developer`, `Sandbox`, `Teams`

---

## Step 2 — List Flows and Spot Problems

### All flows

```python
flows = mcp("list_store_flows")
# Returns direct array (no wrapper):
# [{"id": "Default-26e65220-....0f368466-b6b1-44ed-999c-94791124e402",
#   "displayName": "Flow Studio - Stripe subscription updated",
#   "state": "Started", "triggerType": "Request",
#   "triggerUrl": "https://...",           ← only present for HTTP triggers
#   "tags": ["#operations", "#sensitive"], ← optional, may be absent
#   "environmentName": "Default-26e65220-...",
#   "monitor": true,
#   "runPeriodFailRate": 0.012, "runPeriodTotal": 82,
#   "createdTime": "2025-06-24T01:20:53Z",
#   "lastModifiedTime": "2025-06-24T03:51:03Z"}]

print(f"Total flows: {len(flows)}")
for f in flows:
    dn = f.get("displayName", "(no name)")
    print(f"{dn}  |  {f.get('state')}  |  "
          f"fail rate: {f.get('runPeriodFailRate', 0):.0%}")
```

> **Sparse entries**: Some flows return only `id` + `monitor: true` with no
> other fields — these are typically orphaned or deleted records.

### Monitored flows only

```python
monitored = mcp("list_store_flows", monitor=True)
print(f"Monitored flows: {len(monitored)}")
```

### Flows with on-fail notifications enabled

```python
notified = mcp("list_store_flows", rule_notify_onfail=True)
print(f"Flows with failure notifications: {len(notified)}")
```

### Find unhealthy flows

```python
flows = mcp("list_store_flows")
unhealthy = [f for f in flows
             if f.get("displayName")   # skip sparse entries
             and (f.get("runPeriodFailRate") or 0) > 0.1]
unhealthy.sort(key=lambda f: f.get("runPeriodFailRate", 0), reverse=True)

print(f"\n{len(unhealthy)} flows with >10% failure rate:")
for f in unhealthy[:10]:
    fid = f["id"].split(".", 1)[1]
    print(f"  {f['displayName']}")
    print(f"    ID: {fid}")
    print(f"    Fail rate: {f['runPeriodFailRate']:.0%}  |  "
          f"Total runs: {f.get('runPeriodTotal', '?')}")
```

> **`id` format**: `envId.flowId` — split on the first `.` to extract the flow UUID:
> `flow_id = item["id"].split(".", 1)[1]`

---

## Step 3 — Drill Into a Flow's Health

### Quick summary (aggregated stats from gRuns)

```python
FLOW_ID = "<flow-uuid>"

summary = mcp("get_store_flow_summary",
    environmentName=ENV, flowName=FLOW_ID)
# {"flowKey": "Default-26e65220-....0f368466-...",
#  "windowStart": null, "windowEnd": null,
#  "totalRuns": 82, "successRuns": 81, "failRuns": 1,
#  "successRate": 0.988, "failRate": 0.012,
#  "averageDurationSeconds": 2.877, "maxDurationSeconds": 9.433,
#  "firstFailRunRemediation": "<hint or null>",
#  "firstFailRunUrl": "<url or null>"}

print(f"Fail rate: {summary['failRate']:.0%} "
      f"({summary['failRuns']}/{summary['totalRuns']} runs)")
print(f"Avg duration: {summary['averageDurationSeconds']:.1f}s")
print(f"Max duration: {summary['maxDurationSeconds']:.1f}s")
if summary.get("firstFailRunRemediation"):
    print(f"Remediation hint: {summary['firstFailRunRemediation']}")
```

> Returns zeros if `gRuns` has no data for this flow in the time window.
> This happens when the flow is not monitored or hasn't been scanned recently.

### Summary with custom time window

```python
summary_30d = mcp("get_store_flow_summary",
    environmentName=ENV, flowName=FLOW_ID,
    startTime="2026-03-05T00:00:00Z",
    endTime="2026-04-04T00:00:00Z")
print(f"30-day fail rate: {summary_30d['failRate']:.0%}")
```

### Full cached record (gFlows row)

```python
record = mcp("get_store_flow", environmentName=ENV, flowName=FLOW_ID)
# Returns the raw Azure Table entity from gFlows. Key fields:
#
# Identity:
#   name, displayName, environmentName, state, triggerType, triggerKind,
#   tier ("Standard" or "Premium"), sharingType
#
# Run statistics (pre-computed on the flow record):
#   runPeriodTotal, runPeriodFails, runPeriodSuccess,
#   runPeriodFailRate, runPeriodSuccessRate,
#   runPeriodDurationAverage, runPeriodDurationMax, runPeriodDurationMin,
#   runTotal, runFails, runFirst, runLast, runToday
#
# Governance / notification:
#   monitor (bool), rule_notify_onfail (bool),
#   rule_notify_onmissingdays (number), rule_notify_email (string),
#   log_notify_onfail (ISO timestamp of last notification sent),
#   description, tags
#
# Tags: in list_store_flows, tags are auto-extracted from the description
# field using #hashtag regex (e.g. description "#operations #sensitive"
# → tags: ["#operations", "#sensitive"]). Can also be set explicitly
# via update_store_flow's tags parameter.
#
# Scan metadata:
#   scanned (ISO — when this flow was last scanned by the pipeline)
#   nextScan (ISO — when next scan is scheduled)
#   clarityVersion, deleted, deletedTime
#
# JSON-string fields (parse with json.loads()):
#   actions, connections, owners, complexity, definition,
#   createdBy, security, triggers, referencedResources, runError

print(f"Display Name: {record['displayName']}")
print(f"State: {record['state']}  |  Tier: {record.get('tier')}")
print(f"Run stats: {record.get('runPeriodTotal', 0)} total, "
      f"{record.get('runPeriodFails', 0)} fails, "
      f"{record.get('runPeriodFailRate', 0):.0%} fail rate")
print(f"Last scanned: {record.get('scanned')}")
print(f"Monitor: {record.get('monitor')}  |  "
      f"On-fail notify: {record.get('rule_notify_onfail')}")

# Duration stats are in MILLISECONDS
avg_ms = record.get("runPeriodDurationAverage", 0)
max_ms = record.get("runPeriodDurationMax", 0)
print(f"Avg duration: {avg_ms/1000:.1f}s  |  Max: {max_ms/1000:.1f}s")

# Parse JSON-string fields
if record.get("runError") and record["runError"] != "{}":
    err = json.loads(record["runError"])
    print(f"Last run error: {err}")

if record.get("connections"):
    conns = json.loads(record["connections"])
    print(f"Connectors: {[c.get('apiName') for c in conns]}")

if record.get("owners"):
    owners = json.loads(record["owners"])
    print(f"Owner IDs: {[o.get('principalId') for o in owners]}")
```

---

## Step 4 — Review Run History and Errors

### Recent runs (all statuses)

```python
runs = mcp("get_store_flow_runs",
    environmentName=ENV, flowName=FLOW_ID)
# Returns direct array from gRuns (default: last 7 days).
# Empty [] if no run data is stored for this flow.

for r in runs[:5]:
    print(f"{r['startTime']}  {r['status']}  "
          f"{r.get('durationSeconds', '?')}s  "
          f"{r.get('failedActions', [])}")
```

### Filter by status

```python
# Only failed runs
failed = mcp("get_store_flow_runs",
    environmentName=ENV, flowName=FLOW_ID,
    status=["Failed"])

# Only succeeded
succeeded = mcp("get_store_flow_runs",
    environmentName=ENV, flowName=FLOW_ID,
    status=["Succeeded"])
```

### Custom time window

```python
runs_march = mcp("get_store_flow_runs",
    environmentName=ENV, flowName=FLOW_ID,
    startTime="2026-03-01T00:00:00Z",
    endTime="2026-04-01T00:00:00Z")
```

### Errors only (with remediation hints)

```python
errors = mcp("get_store_flow_errors",
    environmentName=ENV, flowName=FLOW_ID)
# Convenience wrapper — same as get_store_flow_runs with status=Failed
# Returns failedActions and remediationHint per run

for e in errors[:5]:
    print(f"{e['startTime']}  {e.get('failedActions')}")
    if e.get("remediationHint"):
        print(f"  Hint: {e['remediationHint']}")
```

---

## Step 5 — Respond to Problems

### Stop a failing flow

When a flow is causing damage (e.g. sending spam emails, writing bad data):

```python
result = mcp("set_store_flow_state",
    environmentName=ENV, flowName=FLOW_ID,
    state="Stopped")
# Calls live PA API then syncs to cache.
# {"flowName": "...", "environmentName": "...",
#  "requestedState": "Stopped", "actualState": "Stopped"}

print(f"Flow state: {result['actualState']}")
```

> `set_store_flow_state` calls the live PA API to stop the flow AND syncs the
> state back to the cache. Use `set_live_flow_state` if you only need to toggle
> state without updating the cache.

### Restart a stopped flow

```python
result = mcp("set_store_flow_state",
    environmentName=ENV, flowName=FLOW_ID,
    state="Started")
print(f"Flow state: {result['actualState']}")
```

### Get a trigger URL from cache

```python
trigger = mcp("get_store_flow_trigger_url",
    environmentName=ENV, flowName=FLOW_ID)
# {"flowKey": "Default-26e65220-....0f368466-...",
#  "displayName": "Flow Studio - Stripe subscription updated",
#  "triggerType": "Request", "triggerKind": "Http",
#  "triggerUrl": "https://default26e65220...paths/invoke?api-version=1&..."}

if trigger.get("triggerUrl"):
    print(f"Trigger URL: {trigger['triggerUrl']}")
else:
    print("No HTTP trigger URL (flow uses a different trigger type)")
```

### Escalate to live debugging

When Store data shows a failure but you need action-level inputs/outputs
to diagnose the root cause, switch to the live tools:

```python
# Use live tools for deep inspection (see power-automate-debug skill)
runs = mcp("get_live_flow_runs",
    environmentName=ENV, flowName=FLOW_ID, top=5)
run_id = next(r["name"] for r in runs if r["status"] == "Failed")

out = mcp("get_live_flow_run_action_outputs",
    environmentName=ENV, flowName=FLOW_ID,
    runName=run_id, actionName="<failing-action-name>")
print(json.dumps(out, indent=2)[:500])
```

---

## Tenant-Wide Health Overview

### Flow inventory by state

```python
flows = mcp("list_store_flows")

started = [f for f in flows if f.get("state") == "Started"]
stopped = [f for f in flows if f.get("state") == "Stopped"]
suspended = [f for f in flows if f.get("state") == "Suspended"]
print(f"Active: {len(started)}  |  Stopped: {len(stopped)}  |  "
      f"Suspended: {len(suspended)}  |  Total: {len(flows)}")
```

### Top failing flows

```python
flows = mcp("list_store_flows")
with_failures = [f for f in flows
                 if f.get("displayName")
                 and (f.get("runPeriodFailRate") or 0) > 0
                 and (f.get("runPeriodTotal") or 0) >= 5]
with_failures.sort(key=lambda f: f["runPeriodFailRate"], reverse=True)

print("Top 10 failing flows:")
for f in with_failures[:10]:
    fid = f["id"].split(".", 1)[1]
    print(f"  {f['runPeriodFailRate']:.0%} fail rate  |  "
          f"{f.get('runPeriodTotal', '?')} runs  |  "
          f"{f['displayName']}  ({fid})")
```

### Maker overview

```python
makers = mcp("list_store_makers")
# Returns direct array:
# [{"id": "09dbe02f-...", "displayName": "Catherine Han",
#   "mail": "catherine.han@flowstudio.app", "deleted": false,
#   "ownerFlowCount": 199, "ownerAppCount": 209,
#   "userIsServicePrinciple": false}]
# Note: deleted makers have no displayName/mail fields

active = [m for m in makers if not m.get("deleted")]
deleted = [m for m in makers if m.get("deleted")]
print(f"Active makers: {len(active)}  |  Deleted: {len(deleted)}")

for m in active:
    print(f"  {m.get('displayName')}  |  {m.get('ownerFlowCount', 0)} flows  |  "
          f"{m.get('ownerAppCount', 0)} apps")
```

### Maker detail

```python
maker = mcp("get_store_maker", makerKey="<aad-object-id>")
# Returns raw gMakers Azure Table entity. Key fields:
#   displayName, mail, userPrincipalName, givenName, surname, country
#   ownerFlowCount, ownerAppCount, deleted, accountEnabled
#   firstFlow, firstFlowCreatedTime, lastFlowCreatedTime
#   firstPowerApp, firstPowerAppCreatedTime, lastPowerAppCreatedTime
#   licenses (JSON string — M365 license SKUs)
#   assignedLicenses, assignedPlans (JSON strings)

print(f"{maker['displayName']} ({maker['mail']})")
print(f"Flows: {maker.get('ownerFlowCount', 0)}  |  "
      f"Apps: {maker.get('ownerAppCount', 0)}")
print(f"Account enabled: {maker.get('accountEnabled')}")
print(f"Last flow created: {maker.get('lastFlowCreatedTime')}")
```

### Power Apps inventory

```python
apps = mcp("list_store_power_apps")
# Returns direct array:
# [{"id": "envId.appId", "displayName": "SpinButton Page",
#   "environmentName": "3991358a-...", "ownerId": "09dbe02f-...",
#   "ownerName": "Catherine Han", "appType": "Canvas",
#   "sharedUsersCount": 0,
#   "createdTime": "2023-08-18T01:06:22Z",
#   "lastModifiedTime": "2023-08-18T01:06:22Z",
#   "lastPublishTime": "2023-08-18T01:06:22Z"}]

print(f"Total Power Apps: {len(apps)}")
for a in apps[:10]:
    print(f"  {a['displayName']}  |  {a.get('ownerName')}  |  "
          f"shared: {a.get('sharedUsersCount', 0)}")
```

### Connection inventory

```python
conns = mcp("list_store_connections")
# Returns direct array (can be very large — 1500+ items):
# [{"id": "envId.connectionId",
#   "displayName": "catherine.han@flowstudio.app",
#   "createdBy": "{...}",          ← JSON string, parse it
#   "environmentName": "3991358a-...",
#   "statuses": "[{\"status\":\"Connected\"}]"  ← JSON string}]

print(f"Total connections: {len(conns)}")
```

### Environment and connection counts

```python
envs = mcp("list_store_environments")
conns = mcp("list_store_connections")
print(f"Environments: {len(envs)}  |  Connections: {len(conns)}")
```

---

## Monitoring Patterns

### Daily health check

```python
flows = mcp("list_store_flows")

# 1. Flows with high failure rates
critical = [f for f in flows
            if f.get("displayName")
            and (f.get("runPeriodFailRate") or 0) > 0.2
            and (f.get("runPeriodTotal") or 0) >= 3]

# 2. Monitored flows that are stopped (may indicate auto-suspension)
stopped = [f for f in flows
           if f.get("state") == "Stopped"
           and f.get("monitor") is True
           and f.get("displayName")]

# 3. Report
if critical:
    print(f"ALERT: {len(critical)} flows with >20% failure rate")
    for f in critical:
        print(f"  - {f['displayName']} ({f['runPeriodFailRate']:.0%})")

if stopped:
    print(f"WARNING: {len(stopped)} monitored flows are stopped")
    for f in stopped:
        print(f"  - {f['displayName']}")

if not critical and not stopped:
    print("All clear — no critical failures or unexpected stops")
```

### Compare time windows

```python
FLOW_ID = "<flow-uuid>"

this_week = mcp("get_store_flow_summary",
    environmentName=ENV, flowName=FLOW_ID,
    startTime="2026-03-28T00:00:00Z")

last_week = mcp("get_store_flow_summary",
    environmentName=ENV, flowName=FLOW_ID,
    startTime="2026-03-21T00:00:00Z",
    endTime="2026-03-28T00:00:00Z")

print(f"This week: {this_week['failRate']:.0%} fail rate, "
      f"{this_week['averageDurationSeconds']:.1f}s avg")
print(f"Last week: {last_week['failRate']:.0%} fail rate, "
      f"{last_week['averageDurationSeconds']:.1f}s avg")

if (this_week["failRate"] > 0
    and last_week["failRate"] > 0
    and this_week["failRate"] > last_week["failRate"] * 1.5):
    print("DEGRADATION: failure rate increased >50% week-over-week")
```

---

## Quick-Reference: Verified Response Shapes

### `list_store_flows`

Direct array. Optional filters: `monitor` (bool), `rule_notify_onfail` (bool),
`rule_notify_onmissingdays` (bool).

```json
[
  {
    "id": "Default-26e65220-....0f368466-b6b1-44ed-999c-94791124e402",
    "displayName": "Flow Studio - Stripe subscription updated",
    "state": "Started",
    "triggerType": "Request",
    "triggerUrl": "https://...",
    "tags": ["#operations", "#sensitive"],
    "environmentName": "Default-26e65220-...",
    "monitor": true,
    "runPeriodFailRate": 0.012,
    "runPeriodTotal": 82,
    "createdTime": "2025-06-24T01:20:53Z",
    "lastModifiedTime": "2025-06-24T03:51:03Z"
  }
]
```

> `triggerUrl` and `tags` are optional. Some entries are sparse (just `id` + `monitor`).

### `get_store_flow`

Raw Azure Table entity from `gFlows`. Contains **all** cached flow data
including the full definition as a JSON string.

Selected fields (see Step 3 for full list):
```json
{
  "name": "0f368466-b6b1-44ed-999c-94791124e402",
  "displayName": "Flow Studio - Stripe subscription updated",
  "state": "Started",
  "tier": "Premium",
  "triggerType": "Request",
  "triggerKind": "Http",
  "monitor": true,
  "rule_notify_onfail": true,
  "rule_notify_email": "catherine.han@flowstudio.app, john.liu@flowstudio.app",
  "rule_notify_onmissingdays": 0,
  "log_notify_onfail": "2026-02-06T02:04:28Z",
  "runPeriodTotal": 82,
  "runPeriodFails": 1,
  "runPeriodFailRate": 0.012,
  "runPeriodDurationAverage": 2877.01,
  "runPeriodDurationMax": 9433,
  "runError": "{\"errno\":-4092,\"code\":\"EACCES\"}",
  "scanned": "2026-02-26T21:10:49Z",
  "deleted": true,
  "deletedTime": "2025-01-26T21:09:08Z",
  "actions": "[{\"type\":\"Compose\"}, ...]",
  "connections": "[{\"apiName\":\"shared_sharepointonline\", ...}]",
  "owners": "[{\"principalId\":\"...\", \"principalType\":\"User\"}]",
  "complexity": "{\"actions\":19, \"foreach\":0, ...}",
  "definition": "{\"$schema\":\"...\", \"triggers\":{...}, \"actions\":{...}}"
}
```

> `runPeriodDurationAverage`/`Max`/`Min` are in **milliseconds**.
> `actions`, `connections`, `owners`, `complexity`, `definition`, `createdBy`,
> `security`, `triggers`, `runError` are **JSON strings** — parse with `json.loads()`.

### `get_store_flow_summary`

Single object. Aggregated from `gRuns`.

```json
{
  "flowKey": "Default-26e65220-....0f368466-...",
  "windowStart": null,
  "windowEnd": null,
  "totalRuns": 82,
  "successRuns": 81,
  "failRuns": 1,
  "successRate": 0.988,
  "failRate": 0.012,
  "averageDurationSeconds": 2.877,
  "maxDurationSeconds": 9.433,
  "firstFailRunRemediation": null,
  "firstFailRunUrl": null
}
```

> Returns all zeros when `gRuns` has no data for this flow.

### `get_store_flow_runs` / `get_store_flow_errors`

Direct array from `gRuns`. `get_store_flow_errors` is a convenience wrapper
that filters to `status=Failed` only. Both return `[]` when no run data exists.

### `get_store_flow_trigger_url`

```json
{
  "flowKey": "Default-26e65220-....0f368466-...",
  "displayName": "Flow Studio - Stripe subscription updated",
  "triggerType": "Request",
  "triggerKind": "Http",
  "triggerUrl": "https://default26e65220...paths/invoke?api-version=1&..."
}
```

### `list_store_environments`

Direct array from `gEnvs`.

```json
[
  {
    "id": "Default-26e65220-5561-46ef-9783-ce5f20489241",
    "displayName": "Flow Studio (default)",
    "sku": "Default",
    "type": "NotSpecified",
    "location": "australia",
    "isDefault": true,
    "isAdmin": true,
    "isManagedEnvironment": false,
    "createdTime": "2017-01-18T01:06:46Z"
  }
]
```

> `sku` values: `Default`, `Production`, `Developer`, `Sandbox`, `Teams`.

### `list_store_connections`

Direct array from `gConnections`. Can be very large (1500+ items).

```json
[
  {
    "id": "envId.connectionId",
    "displayName": "catherine.han@flowstudio.app",
    "createdBy": "{\"id\":\"...\",\"displayName\":\"Catherine Han\",\"email\":\"...\"}",
    "environmentName": "3991358a-...",
    "statuses": "[{\"status\":\"Connected\"}]"
  }
]
```

> `createdBy` and `statuses` are **JSON strings** — parse with `json.loads()`.

### `list_store_makers`

Direct array from `gMakers`.

```json
[
  {
    "id": "09dbe02f-b15a-4c13-a905-700924ddf300",
    "displayName": "Catherine Han",
    "mail": "catherine.han@flowstudio.app",
    "deleted": false,
    "ownerFlowCount": 199,
    "ownerAppCount": 209,
    "userIsServicePrinciple": false
  }
]
```

> Deleted makers have `deleted: true` and no `displayName`/`mail` fields.

### `get_store_maker`

Raw Azure Table entity from `gMakers`. Includes `displayName`, `mail`,
`ownerFlowCount`, `ownerAppCount`, `accountEnabled`, `country`,
`licenses` (JSON string of M365 SKUs), `firstFlow`, `lastFlowCreatedTime`, etc.

### `list_store_power_apps`

Direct array from `gApps`.

```json
[
  {
    "id": "envId.appId",
    "displayName": "SpinButton Page",
    "environmentName": "3991358a-...",
    "ownerId": "09dbe02f-...",
    "ownerName": "Catherine Han",
    "appType": "Canvas",
    "sharedUsersCount": 0,
    "createdTime": "2023-08-18T01:06:22Z",
    "lastModifiedTime": "2023-08-18T01:06:22Z",
    "lastPublishTime": "2023-08-18T01:06:22Z"
  }
]
```

### `set_store_flow_state`

Calls live PA API then syncs to cache.

```json
{
  "flowName": "0f368466-...",
  "environmentName": "Default-26e65220-...",
  "requestedState": "Stopped",
  "actualState": "Stopped"
}
```

---

## Related Skills

- `power-automate-mcp` — Core connection setup, live tool reference
- `power-automate-debug` — Deep diagnosis with action-level inputs/outputs (live API)
- `power-automate-build` — Build and deploy flow definitions
- `power-automate-governance` — Governance metadata, tagging, notification rules, CoE patterns
