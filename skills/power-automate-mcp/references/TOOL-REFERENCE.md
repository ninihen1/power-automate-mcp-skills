# FlowStudio MCP — Tool Reference

Complete parameter reference for the FlowStudio Power Automate MCP server.
Call `tools/list` on your own server to confirm exact names and schemas.

---

## Environment & Tenant Discovery

### `list_live_environments`
List all Power Platform environments visible to the service account.

| Parameter | Type | Required | Description |
|---|---|---|---|
| *(none)* | — | — | No parameters required |

Response: array of environments:
```json
[
  {
    "name": "Default-26e65220-5561-46ef-9783-ce5f20489241",
    "displayName": "FlowStudio (default)",
    "location": "australia"
  }
]
```

> Use the `name` value as `environmentName` in all other tools.

---

### `list_store_environments`
List all environments from the FlowStudio cache.

| Parameter | Type | Required | Description |
|---|---|---|---|
| *(none)* | — | — | No parameters required |

---

## Connection Discovery

### `list_live_connections`
List Power Platform connections in an environment directly from the PA API.
Returns id, displayName, connectorName, createdBy, and statuses for each connection.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes* | Environment ID. Omit to list across all environments |
| `top` | number | No | Max connections to return. Paginates automatically. Omit for all |

\* Required by the PA API when the environment requires an environment filter.

Response: wrapper object:
```json
{
  "connections": [
    {
      "id": "shared-office365-9f9d2c8e-55f1-49c9-9f9c-1c45d1fbbdce",
      "displayName": "user@contoso.com",
      "connectorName": "shared_office365",
      "createdBy": "User Name",
      "statuses": [{"status": "Connected"}],
      "createdTime": "2024-03-12T21:23:55.206815Z"
    }
  ],
  "totalCount": 56,
  "error": null
}
```

> **Key field**: `connectorName` maps to the apiId suffix:
> `apiId = "/providers/Microsoft.PowerApps/apis/" + connectorName`
>
> **Key field**: `id` is the `connectionName` value used in `connectionReferences`.
>
> Filter by status: `connections` where `statuses[0].status == "Connected"`.

---

### `list_store_connections`
List all Power Platform connections from the FlowStudio cache.

| Parameter | Type | Required | Description |
|---|---|---|---|
| *(none)* | — | — | No parameters required |

---

## Flow Discovery & Listing

### `list_live_flows`
List flows in an environment directly from the PA API (always current).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |

Response: direct array:
```json
[
  {
    "id": "0757041a-8ef2-cf74-ef06-06881916f371",
    "displayName": "My Flow",
    "state": "Started",
    "triggerType": "Request",
    "createdTime": "2023-08-18T01:18:17Z",
    "owners": "<aad-object-id>"
  }
]
```

> `id` is a plain UUID — use directly as `flowName` in other tools.

---

### `list_store_flows`
List flows from the server-side cache (fast).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | No | Filter to a specific environment ID |
| `searchTerm` | string | No | Substring match on display name |
| `pageSize` | integer | No | Results per page (default varies) |
| `pageNumber` | integer | No | 1-based page number |

Response: **direct array** (no wrapper object):
```json
[
  {
    "id": "3991358a-f603-e49d-b1ed-a9e4f72e2dcb.0757041a-8ef2-cf74-ef06-06881916f371",
    "displayName": "Admin | Sync Template v3 (Solutions)",
    "state": "Started",
    "triggerType": "OpenApiConnectionWebhook",
    "environmentName": "3991358a-f603-e49d-b1ed-a9e4f72e2dcb",
    "runPeriodTotal": 100,
    "createdTime": "2023-08-18T01:18:17Z",
    "lastModifiedTime": "2023-08-18T12:47:42Z"
  }
]
```

> ⚠️ **`id` format**: `envId.flowId` — split on the first `.` to extract the flow UUID
> needed by other tools (`flowName` parameter):
> `flow_id = item["id"].split(".", 1)[1]`

---

### `get_store_flow`
Fetch a single flow's metadata from cache.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

Response shape (selected fields):
```json
{
  "id": "envId.flowId",
  "displayName": "My Flow",
  "state": "Started",
  "triggerType": "Recurrence",
  "runPeriodTotal": 100,
  "runPeriodFailRate": 0.1,
  "runPeriodSuccessRate": 0.9,
  "runPeriodFails": 10,
  "runPeriodSuccess": 90,
  "runPeriodDurationAverage": 29410.8,
  "runPeriodDurationMax": 158900.0,
  "runError": "{\"code\": \"EACCES\", ...}",
  "description": "Flow description",
  "tier": "Premium",
  "complexity": "{...}",
  "actions": 42,
  "connections": ["sharepointonline", "office365"],
  "owners": ["user@contoso.com"],
  "createdBy": "user@contoso.com",
  "nextScan": "2026-03-01T00:00:00Z",
  "scanned": true
}
```

> Note: `runPeriodDurationAverage` / `runPeriodDurationMax` are in **milliseconds**.
> Divide by 1000 for seconds.  `runError` is a **JSON string** — parse it with
> `json.loads()` before inspecting.

---

## Flow Definition (Live API)

### `get_live_flow`
Fetch the full flow definition direct from Power Automate API. Returns the
complete `properties.definition` including triggers, actions, and parameters.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

Response shape:
```json
{
  "name": "<flow-guid>",
  "properties": {
    "displayName": "My Flow",
    "state": "Started",
    "definition": {
      "triggers": { ... },
      "actions": { ... },
      "parameters": { ... }
    },
    "connectionReferences": { ... }
  }
}
```

---

### `update_live_flow`
Create a new flow or update an existing flow's definition and/or display name.

**Create mode**: Omit `flowName` (or pass blank) → creates a new flow with a
generated GUID via PUT. `definition` and `displayName` are required.

**Update mode**: Provide `flowName` → PATCHes the existing flow. Pass the
`definition` object from `get_live_flow` — mutate it, then pass here.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | No | Flow GUID. **Omit to create a new flow** |
| `definition` | object | Create: Yes, Update: No* | Full flow definition (triggers + actions + parameters + outputs) |
| `displayName` | string | Create: Yes, Update: No | Display name for the flow |
| `description` | string | Yes | Description of what is being changed/created. Appended with "Updated via Flow Studio MCP" |
| `connectionReferences` | object | No* | Connection references map. Required when definition uses connectors |

*Required together when updating flow logic.

Response: `{ created, updated: [...], state, error }` — flat dict, not nested.
`error` key is always present but may be `null` — check `result.get("error") is not None`.

> When creating, the response includes `created: "<new-flow-guid>"` — use this
> as `flowName` for all subsequent calls.

---

## Run History & Monitoring

### `get_live_flow_runs`
List recent runs for a flow (newest first).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `top` | integer | No | Max results to return |

Response: array of run objects:
```json
[{
  "name": "<run-id>",
  "status": "Succeeded|Failed|Running|Cancelled",
  "startTime": "2026-02-25T06:13:38Z",
  "endTime": "2026-02-25T06:14:02Z",
  "triggerName": "Recurrence",
  "error": null
}]
```

---

### `get_live_flow_run_error`
Get the structured error for a failed run.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `runName` | string | Yes | Run ID from `get_live_flow_runs` |

Response shape:
```json
{
  "runName": "08584296068667933411438594643CU15",
  "failedActions": [
    {
      "actionName": "Apply_to_each_prepare_workers",
      "status": "Failed",
      "error": {"code": "ActionFailed", "message": "An action failed. No dependent actions succeeded."},
      "code": "ActionFailed",
      "startTime": "2026-02-25T06:13:52Z",
      "endTime": "2026-02-25T06:15:24Z"
    },
    {
      "actionName": "HTTP_find_AD_User_by_Name",
      "status": "Failed",
      "code": "NotSpecified",
      "startTime": "2026-02-25T06:14:01Z",
      "endTime": "2026-02-25T06:14:05Z"
    }
  ],
  "allActions": [
    {"actionName": "Apply_to_each", "status": "Skipped"},
    {"actionName": "Compose_WeekEnd", "status": "Succeeded"},
    {"actionName": "HTTP_find_AD_User_by_Name", "status": "Failed"}
  ]
}
```

> `failedActions` is ordered outer-to-inner — the **last entry is the root cause**.
> `allActions` lists every action's final status — useful for spotting cascading Skipped actions.
> Use `failedActions[-1]["actionName"]` as the starting point for diagnosis.

---

### `get_live_flow_run_action_outputs`
Inspect the inputs, outputs, and status of a specific action within a run.
**Most useful tool for diagnosing failures** — call this on the action
immediately before the failing one to see what data it passed.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `runName` | string | Yes | Run ID |
| `actionName` | string | Yes | Exact action key from the definition (e.g. `Compose_WeekEnd_now`) |

> ⚠️ Outputs can be very large (50 MB+) for actions processing bulk data.
> Use a 120 s+ timeout and store `.Content` to a variable before parsing.

---

## Run Control

### `resubmit_live_flow_run`
Resubmit a completed (Succeeded/Failed) run using its original trigger payload.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `runName` | string | Yes | Run ID to resubmit |

Response: `{ resubmitted: true, triggerName: "..." }`

---

### `cancel_live_flow_run`
Cancel a currently `Running` flow run.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `runName` | string | Yes | Run ID |

> ⚠️ Do NOT cancel runs waiting for an adaptive card response — status `Running`
> is normal while a Teams card is awaiting user input.

---

## HTTP Trigger Tools

### `get_live_flow_http_schema`
Inspect the HTTP interface of a Request-triggered flow: returns the JSON schema
the trigger URL expects as the POST body, any required headers, the HTTP method,
and the JSON schema(s) defined on any Response action(s) in the flow.
No test call is made — reads from the live definition.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

> Use before `trigger_live_flow` to understand what body to send.

---

### `get_live_flow_trigger_url`
Get the current signed callback URL for an HTTP-triggered flow.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

---

### `trigger_live_flow`
Trigger an HTTP-triggered flow by calling its live callback URL.
Fetches the current signed trigger URL via the PA API (`listCallbackUrl`)
then POSTs the provided body to it. If the flow trigger requires Azure AD
authentication, the impersonated Bearer token is automatically included.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `body` | object | No | JSON body to POST. Omit for flows expecting an empty body |

Response: `{ status, body, requiresAadAuth, authType }`

> Only works for flows with a `Request` (HTTP) trigger type.

---

## Validation & Solution Management

### `validate_live_flow`
Validate a flow definition via the PA API validate endpoint.
POSTs the definition and returns any validation errors or warnings.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `definition` | object | Yes | Full flow definition object (triggers + actions + parameters + outputs) |

> Use `get_live_flow` to retrieve the current definition before modifying and validating.

---

### `add_live_flow_to_solution`
Migrate a non-solution flow into a solution via the admin `migrateFlows` API.
If the flow is already part of a solution, returns an error without attempting migration.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID to migrate |
| `solutionId` | string | No | Target solution ID. Omit for the default solution |

---

## Flow State Management

### `set_store_flow_state`
Start or stop a flow via the PA API and sync the result back to the store.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| `state` | string | Yes | `"Started"` or `"Stopped"` |

---

## Store Tools — FlowStudio for Teams Only

### `list_store_flows`
*(Documented in Flow Discovery section above)*

### `get_store_flow`
*(Documented in Flow Discovery section above)*

### `get_store_flow_summary`
Aggregated run statistics for a flow.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

Response shape:
```json
{
  "totalRuns": 100,
  "failRuns": 10,
  "failRate": 0.1,
  "averageDurationSeconds": 29.4,
  "maxDurationSeconds": 158.9,
  "firstFailRunRemediation": "<hint or null>"
}
```

---

### `get_store_flow_runs`
Cached run history for the last N days with duration and remediation hints.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

---

### `get_store_flow_errors`
Cached failed-only runs with failed action names and remediation hints.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

---

### `get_store_flow_trigger_url`
Get the trigger URL from the cache (instant, no PA API call).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |

---

### `update_store_flow`
Update governance metadata in the store (description, tags, monitor flag,
notification rules, business impact).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environmentName` | string | Yes | Environment ID |
| `flowName` | string | Yes | Flow GUID |
| *(additional fields)* | various | No | Governance metadata fields to update |

---

### `list_store_makers`
List all makers (citizen developers) from the cache.

| Parameter | Type | Required | Description |
|---|---|---|---|
| *(none)* | — | — | No parameters required |

---

### `get_store_maker`
Get a maker's flow/app counts and account status.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `makerName` | string | Yes | Maker identifier |

---

### `list_store_power_apps`
List all Power Apps canvas apps from the cache.

| Parameter | Type | Required | Description |
|---|---|---|---|
| *(none)* | — | — | No parameters required |
