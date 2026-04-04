---
name: flowstudio-power-automate-governance
description: >-
  Govern Power Automate flows and Power Apps at scale using the FlowStudio MCP
  cached store. Classify flows by business impact, detect orphaned resources,
  audit connector usage, enforce compliance standards, manage notification rules,
  and compute governance scores — all without Dataverse or the CoE Starter Kit.
  Load this skill when asked to: tag or classify flows, set business impact,
  assign ownership, detect orphans, audit connectors, check compliance, compute
  archive scores, manage notification rules, run a governance review, generate
  a compliance report, enforce DLP policies, offboard a maker, or any task
  that involves writing governance metadata to flows. Requires a FlowStudio
  for Teams or MCP Pro+ subscription — see https://mcp.flowstudio.app
metadata:
  openclaw:
    requires:
      env:
        - FLOWSTUDIO_MCP_TOKEN
    primaryEnv: FLOWSTUDIO_MCP_TOKEN
    homepage: https://mcp.flowstudio.app
---

# Power Automate Governance with FlowStudio MCP

Classify, tag, and govern Power Automate flows at scale through the FlowStudio
MCP **cached store** — without Dataverse, without the CoE Starter Kit, and
without the Power Automate portal.

This skill uses `update_store_flow` to write governance metadata and the
monitoring tools (`list_store_flows`, `get_store_flow`, `list_store_makers`,
etc.) to read tenant state. For monitoring and health-check workflows, see
the `power-automate-monitoring` skill.

> **Start every session with `tools/list`** to confirm tool names and parameters.
> This skill covers workflows and patterns — things `tools/list` cannot tell you.
> If this document disagrees with `tools/list` or a real API response, the API wins.

---

## The Write Tool: `update_store_flow`

`update_store_flow` is the only tool that writes governance metadata. It uses
merge semantics — only fields you provide are updated. Returns the full
updated record (same shape as `get_store_flow`).

### Settable Fields

| Field | Type | Purpose |
|---|---|---|
| `monitor` | bool | Enable run-level scanning and per-run data collection |
| `rule_notify_onfail` | bool | Send email notification on any failed run |
| `rule_notify_onmissingdays` | number | Send notification when flow hasn't run in N days (0 = disabled) |
| `rule_notify_email` | string | Comma-separated notification recipients |
| `description` | string | What the flow does |
| `tags` | string | Classification tags (also auto-extracted from description `#hashtags`) |
| `businessImpact` | string | Low / Medium / High / Critical |
| `businessJustification` | string | Why the flow exists, what process it automates |
| `businessValue` | string | Business value statement |
| `ownerTeam` | string | Accountable team |
| `ownerBusinessUnit` | string | Business unit |
| `supportGroup` | string | Support escalation group |
| `supportEmail` | string | Support contact email |
| `critical` | bool | Designate as business-critical |
| `tier` | string | Standard or Premium |
| `security` | string | Security classification or notes |

### Example

```
update_store_flow(
    environmentName="Default-26e65220-...",
    flowName="0f368466-...",
    businessImpact="High",
    businessJustification="Processes all Stripe subscription changes",
    ownerTeam="Engineering",
    supportEmail="support@contoso.com",
    monitor=true,
    rule_notify_onfail=true,
    rule_notify_email="oncall@contoso.com",
    critical=true,
    tags="#operations #billing #critical"
)
```

---

## Governance Workflows

### 1. Compliance Detail Review

Identify flows missing required governance metadata — the equivalent of
the CoE Starter Kit's Developer Compliance Center.

```
1. list_store_flows
2. For each flow with runPeriodTotal > 0 (active flows):
   - get_store_flow
   - Check: has businessImpact? has businessJustification? has ownerTeam?
     has description? has supportEmail?
3. Report non-compliant flows
4. For each non-compliant flow:
   - update_store_flow with appropriate metadata
```

**Compliance fields to check:**

| Field | Required when |
|---|---|
| `businessImpact` | Always for active flows |
| `businessJustification` | When businessImpact is High or Critical |
| `ownerTeam` | Always for active flows |
| `description` | Always |
| `supportEmail` | When businessImpact is High or Critical |
| `monitor` | When businessImpact is High or Critical |
| `rule_notify_onfail` | When critical is true |

### 2. Orphaned Resource Detection

Find flows owned by deleted or disabled Azure AD accounts.

```
1. list_store_makers
2. Filter makers where deleted=true AND ownerFlowCount > 0
3. For each orphaned maker:
   - list_store_flows → filter by owner ID (parse owners JSON on each flow)
   - Report: maker name, deletion status, flow count, flow names
4. Decide: reassign ownership (update_store_flow with new ownerTeam/supportEmail)
   or flag for decommission
```

> Deleted makers have `deleted: true` and no `displayName`/`mail` fields.
> Use the maker `id` (AAD object ID) to match against flow `owners` JSON.

### 3. Archive Score Calculation

Compute an inactivity score (0-7) per flow to identify safe cleanup candidates.
Aligns with the CoE Starter Kit's archive scoring methodology.

```
For each flow from get_store_flow, add 1 point for each:

+1  Not modified since creation (lastModifiedTime ≈ createdTime)
+1  Name contains "test", "demo", "copy", "temp", or "backup"
+1  Created over 12 months ago
+1  State is "Stopped" or "Suspended"
+1  No owner (owners JSON is empty array)
+1  Simple flow (parse complexity JSON → actions < 5)
+1  No recent runs (runPeriodTotal = 0)

Score 5-7: Safe to archive/delete (with confirmation)
Score 3-4: Review with owner
Score 0-2: Active, do not archive
```

### 4. Connector Audit

Audit which connectors are in use across the tenant. Useful for DLP impact
analysis and premium license planning.

```
1. list_store_flows
2. For each flow: get_store_flow → parse connections JSON
3. Build connector inventory:
   - Which connectors are used and by how many flows
   - Which flows use premium connectors (tier: "Premium")
   - Which flows use HTTP connectors (potential data exfiltration)
   - Which flows use custom connectors
4. Cross-reference against DLP policy:
   - Business connectors vs Non-Business connectors
   - Flag flows mixing connectors across groups
```

> The `connections` field is a JSON string containing an array of objects
> with `apiName`, `apiId`, `connectionName`, `tier`. Parse with `json.loads()`.

### 5. Notification Rule Management

Configure monitoring and alerting for flows at scale.

```
Enable failure alerts on all critical flows:
1. list_store_flows(monitor=True)
2. For each flow where critical=true but rule_notify_onfail is not set:
   - update_store_flow(
       rule_notify_onfail=true,
       rule_notify_email="oncall@contoso.com"
     )

Enable missing-run detection for scheduled flows:
1. list_store_flows(monitor=True)
2. For each flow where triggerType="Recurrence" and rule_notify_onmissingdays=0:
   - update_store_flow(rule_notify_onmissingdays=2)
```

> `rule_notify_onfail`: triggers the notification pipeline to email on any
> failed run detected during the daily scan.
>
> `rule_notify_onmissingdays`: triggers notification when a flow hasn't
> run in N days — use for SLA monitoring on scheduled flows.
>
> `rule_notify_email`: comma-separated recipient list. Falls back to the
> flow creator's email if not set.

### 6. Classification and Tagging

Bulk-classify flows by connector type, business function, or risk level.

```
Auto-tag by connector:
1. list_store_flows
2. For each flow: get_store_flow → parse connections
3. Build tags from connector names:
   - shared_sharepointonline → #sharepoint
   - shared_teams → #teams
   - shared_office365 → #email
   - Custom connectors → #custom-connector
   - HTTP actions → #http-external
4. update_store_flow(tags="#sharepoint #teams")

Auto-classify tier:
1. For each flow: check connections for premium connectors
2. update_store_flow(tier="Premium") or tier="Standard"
```

> Tags can be set two ways: (1) in the `description` field using `#hashtag`
> format (auto-extracted by `list_store_flows`), or (2) explicitly via the
> `tags` parameter on `update_store_flow`.

### 7. Maker Offboarding

When an employee leaves, identify and reassign their flows and apps.

```
1. get_store_maker(makerKey="<departing-user-aad-oid>")
   → confirms ownerFlowCount, ownerAppCount
2. list_store_flows → filter where owners JSON contains the maker's OID
3. list_store_power_apps → filter where ownerId matches
4. For each flow:
   - Assess: is it still needed? (check runPeriodTotal, last run date)
   - If keeping: update_store_flow(ownerTeam="NewTeam", supportEmail="new-owner@...")
   - If archiving: set_store_flow_state(state="Stopped")
5. Report: flows reassigned, flows stopped, apps needing manual reassignment
```

### 8. Security Review

Identify flows with potential security concerns.

```
1. list_store_flows
2. For each flow: get_store_flow → parse security JSON
3. Flag flows where:
   - triggerAuthenticationType = "All" (no auth on HTTP trigger — open to internet)
   - sharingType = "Coauthor" or shared broadly
   - connections include HTTP connector (arbitrary outbound requests)
   - referencedResources point to external URLs
4. update_store_flow(security="reviewed", tags="#security-reviewed")
   or escalate for manual review
```

### 9. Environment Governance

Audit environments for compliance and sprawl.

```
1. list_store_environments
2. Flag:
   - Developer environments (sku="Developer") — should be limited
   - Non-managed environments (isManagedEnvironment=false) — less governance
   - Environments with no admin (isAdmin=false)
3. list_store_flows → group by environmentName
   - Which environments have the most flows?
   - Which environments have the highest failure rates?
4. list_store_connections → group by environmentName
   - Connection sprawl per environment
```

### 10. Governance Dashboard

Generate a tenant-wide governance summary.

```
1. list_store_flows → total, by state, by tier
2. list_store_makers → total active, deleted with orphaned flows
3. list_store_power_apps → total, shared broadly
4. list_store_environments → total, by SKU
5. list_store_connections → total

Compute governance metrics:
- Compliance %: flows with businessImpact set / total active flows
- Monitoring %: flows with monitor=true / total active flows
- Notification %: flows with rule_notify_onfail / monitored flows
- Orphan count: deleted makers with ownerFlowCount > 0
- High-risk count: flows with runPeriodFailRate > 0.2
- Undocumented count: flows without description
```

---

## Field Reference: `get_store_flow` Fields Used in Governance

| Field | Type | Governance use |
|---|---|---|
| `displayName` | string | Archive score (test/demo name detection) |
| `state` | string | Archive score, lifecycle management |
| `tier` | string | License audit (Standard vs Premium) |
| `monitor` | bool | Is this flow being actively monitored? |
| `critical` | bool | Business-critical designation |
| `businessImpact` | string | Compliance classification |
| `businessJustification` | string | Compliance attestation |
| `ownerTeam` | string | Ownership accountability |
| `supportEmail` | string | Escalation contact |
| `rule_notify_onfail` | bool | Failure alerting configured? |
| `rule_notify_onmissingdays` | number | SLA monitoring configured? |
| `rule_notify_email` | string | Alert recipients |
| `description` | string | Documentation completeness |
| `tags` | string | Classification |
| `runPeriodTotal` | number | Activity level |
| `runPeriodFailRate` | number | Health status |
| `scanned` | ISO string | Data freshness |
| `deleted` | bool | Lifecycle tracking |
| `createdTime` | ISO string | Archive score (age) |
| `lastModifiedTime` | ISO string | Archive score (staleness) |
| `owners` | JSON string | Orphan detection, ownership audit |
| `connections` | JSON string | Connector audit, DLP, tier classification |
| `complexity` | JSON string | Archive score (simplicity) |
| `security` | JSON string | Security review (auth type, sharing) |
| `sharingType` | string | Oversharing detection |
| `referencedResources` | JSON string | URL audit, external dependency tracking |

---

## Related Skills

- `power-automate-monitoring` — Health checks, failure rates, inventory (read-only)
- `power-automate-mcp` — Core connection setup, live tool reference
- `power-automate-debug` — Deep diagnosis with action-level inputs/outputs
- `power-automate-build` — Build and deploy flow definitions
