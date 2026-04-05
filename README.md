# FlowStudio MCP — Power Automate Skills for AI Agents

Give your AI agent the same visibility you have in the Power Automate portal — plus a bit more.
The Graph API only returns top-level run status — agents can't see action inputs,
loop iterations, or nested failures. Flow Studio MCP exposes all of it.

![Agent debugging a Power Automate flow via MCP](assets/demo-debug.gif)

**You can click through the portal and find the root cause. Your agent can't — unless it has MCP.**

![The portal shows everything to a human — but agents only see the top-level error via Graph API](assets/portal-vs-reality.png)

![With Flow Studio MCP, the agent sees what you see](assets/mcp-root-cause.png)

## When you need this

- Your agent can see that a flow failed, but not why — Graph API only returns status codes
- You want your agent to see action-level inputs and outputs, like you can in the portal
- A loop has hundreds of iterations and some produced bad output — in the portal you'd click through each one, but the agent can scan all iteration inputs and outputs at once
- You want to check flow health, failure rates, and maker activity across your tenant without opening the admin center
- You need to classify flows, detect orphaned resources, or audit connectors at scale — without installing the CoE Starter Kit
- You're tired of being the middle-man between your agent and the portal

## Graph API vs Flow Studio MCP

The core difference: **Graph API gives your agent run status. MCP gives your agent the inputs and outputs of every action.**

| What the agent sees | Graph API | Flow Studio MCP |
|---|---|---|
| Run passed or failed | Yes | Yes |
| **Action inputs and outputs** | **No** | **Yes** |
| Error details beyond status code | No | Yes |
| Child flow run details | No | Yes |
| Loop iteration data | No | Yes |
| Flow definition (read + write) | Limited | Full JSON |
| Resubmit / cancel runs | Limited | Yes |
| **Cached flow health & failure rates** | **No** | **Yes** |
| **Maker / Power Apps / connection inventory** | **No** | **Yes** |
| **Governance metadata (tags, impact, owner)** | **No** | **Yes** |

## Skills

| Skill | Description |
|---|---|
| [`power-automate-mcp`](skills/power-automate-mcp/) | Connect to and operate Power Automate cloud flows — list flows, read definitions, check runs, resubmit, cancel |
| [`power-automate-debug`](skills/power-automate-debug/) | Step-by-step diagnostic process for investigating failing flows |
| [`power-automate-build`](skills/power-automate-build/) | Build, scaffold, and deploy Power Automate flow definitions from scratch |
| [`power-automate-monitoring`](skills/power-automate-monitoring/) | Flow health, failure rates, maker inventory, Power Apps, environment and connection counts |
| [`power-automate-governance`](skills/power-automate-governance/) | Classify flows by impact, detect orphans, audit connectors, manage notifications, compute archive scores |

The first three skills use **live** Power Automate API calls. The monitoring and governance
skills use the **cached store** — a daily snapshot with aggregated stats, remediation hints,
and governance metadata. Requires a FlowStudio for Teams or MCP Pro+ subscription for store tools.

Each skill follows the [Agent Skills specification](https://agentskills.io/specification)
and works with any compatible agent.

### Supported agents

Copilot, Claude Code, Codex, OpenClaw, Gemini CLI, Cursor, Goose, Amp, OpenHands

## Quick Start

### Install as Claude Code plugin

Available through the Claude plugin marketplace after approval. To test locally:

```bash
git clone https://github.com/ninihen1/power-automate-mcp-skills.git
claude --plugin-dir ./power-automate-mcp-skills
```

Then connect the MCP server:
```bash
claude mcp add --transport http flowstudio https://mcp.flowstudio.app/mcp \
  --header "x-api-key: <YOUR_TOKEN>"
```

Get your token at [mcp.flowstudio.app](https://mcp.flowstudio.app).

### Install in Codex

Inside a Codex session, install skills directly:
```
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/main/skills/power-automate-mcp
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/main/skills/power-automate-debug
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/main/skills/power-automate-build
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/main/skills/power-automate-monitoring
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/main/skills/power-automate-governance
```

Then connect the MCP server in `~/.codex/config.toml`:
```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<YOUR_TOKEN>"
```

### Install via skills.sh

Search for [flowstudio on skills.sh](https://skills.sh/?q=flowstudio), or:

```bash
npx skills add github/awesome-copilot -s flowstudio-power-automate-mcp
npx skills add github/awesome-copilot -s flowstudio-power-automate-debug
npx skills add github/awesome-copilot -s flowstudio-power-automate-build
npx skills add github/awesome-copilot -s flowstudio-power-automate-monitoring
npx skills add github/awesome-copilot -s flowstudio-power-automate-governance
```

### Install via ClawHub

```bash
npx clawhub@latest install power-automate-mcp
```

### Install via Smithery

```bash
npx smithery skill add flowstudio/power-automate-mcp
```

### Manual install

Copy the skill folder(s) into your project's `.github/skills/` directory
(or wherever your agent discovers skills).

### Connect the MCP server

**Claude Code:**
```bash
claude mcp add --transport http flowstudio https://mcp.flowstudio.app/mcp \
  --header "x-api-key: <YOUR_TOKEN>"
```

**Codex** (`~/.codex/config.toml`):
```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<YOUR_TOKEN>"
```

**Copilot / VS Code** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "flowstudio": {
      "type": "http",
      "url": "https://mcp.flowstudio.app/mcp",
      "headers": { "x-api-key": "<YOUR_TOKEN>" }
    }
  }
}
```

Get your token at [mcp.flowstudio.app](https://mcp.flowstudio.app).

## Real debugging examples

These are from real production investigations, not demos.

- **[Expression error in child flow](examples/fix-expression-error.md)** —
  `contains(string(...))` crashed on a nested property. Agent traced through
  parent flow, into child, through loop iterations, and found the failing input.
  Portal showed "ExpressionEvaluationFailed" with no context.

- **[Data entry, not a flow bug](examples/data-not-flow.md)** —
  User reported two "bugs" back to back. Agent proved both were data entry
  errors (missing comma in email, single address in CC field). Flow was correct.
  Diagnosed in seconds.

- **[Null value crashes child flow](examples/null-child-flow.md)** —
  `split(Name, ', ')` crashed when 38% of records had null Names. Agent traced
  parent to child to loop to action, found the root cause, and deployed a fix
  via `update_live_flow`.

## Real governance examples

These are from a real tenant with 1,197 flows, not synthetic data.

- **[Tenant governance dashboard](#governance-dashboard)** —
  Agent called 5 list endpoints and produced a full tenant health summary in
  under 10 seconds. No portal, no PowerShell, no CoE Starter Kit.

- **[Orphaned resource detection](#orphan-detection)** —
  Agent cross-referenced deleted makers against flow ownership. Found 47 flows
  owned by 5 deleted accounts — all system-generated Dataverse flows with empty
  owner arrays. Tagged them `#orphaned` for cleanup.

- **[Maker offboarding](#maker-offboarding)** —
  Agent pulled a departing maker's full footprint: 223 flows, 209 Power Apps
  (77% of tenant), 3 shared apps with active users, 1 critical flow. Identified
  the shared apps and critical flow as highest priority for handover.

- **[Environment sprawl audit](#environment-audit)** —
  Agent found 3 Developer environments, only 1 of 10 managed, and 884 flows
  concentrated in the default environment with 1,374 connections.

<details>
<summary><a id="governance-dashboard"></a><b>Governance dashboard output</b></summary>

```
Tenant-Wide Governance Dashboard

Metric                              Value
------------------------------------+------------------
Total flows                          1,197
Active (with name, not deleted)      1,134
Monitored                            72 (6.0%)
With on-fail notifications           14 (19.4% of monitored)
High-risk (fail rate > 20%)          65

Makers                               18
  Active                             9
  Deleted with orphaned flows        5 (owning 47 flows)

Power Apps                           271
Environments                         10
  Developer                          3
  Managed                            1
Connections                          1,589

Governance Findings:
  1. Low monitoring coverage — 6% of flows monitored
  2. Low notification coverage — only 19% of monitored flows have alerts
  3. 65 high-risk flows with >20% failure rate
  4. 5 deleted accounts still own 47 flows
  5. Default environment overloaded — 884 flows, 1,374 connections
```

</details>

<details>
<summary><a id="orphan-detection"></a><b>Orphan detection output</b></summary>

```
Orphaned Resource Detection

Found 4 fully orphaned flows (no owners, creator deleted):

Flow                                          Environment        State    Orphan Type
----------------------------------------------+------------------+--------+---------------------------
Project Service Core - Schedule MPP Cleanup    Default            Stopped  DataverseSystemUser deleted
SLAInstanceMonitoringWarningAndExpiryFlow      CoE DataLake       Stopped  DataverseSystemUser deleted
SLAInstanceMonitoringWarningAndExpiryFlow      sandy              Stopped  DataverseSystemUser deleted
Search Dynamics 365 knowledge article flow     sandy              Stopped  DataverseSystemUser deleted

All 4 are system-generated Dataverse flows with empty owner arrays.
Tagged #orphaned via update_store_flow for tracking.
```

</details>

<details>
<summary><a id="maker-offboarding"></a><b>Maker offboarding output</b></summary>

```
Maker Offboarding Report — Catherine Han

Profile:
  Flows owned       223
  Power Apps        209 (77% of 271 tenant-wide)
  Account           Active
  First flow        2023-08-09
  Last flow         2026-04-04

Critical flows (highest priority for handover):
  Flow Studio Onboarding Emails    107 runs   0% fail   critical=true

Shared Power Apps (other users depend on these):
  Cleanup Old Objects App                          1 user shared
  Admin - Access this App (Power BI embedded)      1 user shared
  App and Flow Inactivity Notifications View       1 user shared

Recommendation: 223 flows + 209 apps is a high-risk offboarding.
Prioritize: 1 critical flow, 3 shared apps, then batch-tag the rest
with #offboarding-catherine for structured handover.
```

</details>

<details>
<summary><a id="environment-audit"></a><b>Environment audit output</b></summary>

```
Environment Governance Audit — 10 environments

Environment              SKU          Location    Managed  Flows  Connections
-------------------------+-----------+-----------+---------+------+------------
Flow Studio (default)     Default     australia   No        884    1,374
CoE DataLake Testing      Production  australia   No         99       39
Flow Studio Demo          Production  australia   No         67       54
Flow Maker Preview        Production  US-first    No         43       85
Clarity Demo              Developer   australia   No         20       10
sandy                     Sandbox     australia   Yes         5       11
PowerPagesDeveloper       Developer   australia   No          3        0
US                        Developer   US          No          8        3
Work                      Teams       australia   No          0        0
Dev John                  Teams       australia   No          4        7

Findings:
  1. 3 Developer environments — review if all still needed
  2. Only 1 of 10 is managed (sandy) — less DLP enforcement elsewhere
  3. Default environment holds 78% of flows and 86% of connections
  4. Clarity Demo: service account lacks admin access (isAdmin=false)
```

</details>

## Prerequisites

- A [FlowStudio](https://mcp.flowstudio.app) MCP subscription (all live tools)
- For store tools (monitoring, governance): FlowStudio for Teams or MCP Pro+
- MCP endpoint: `https://mcp.flowstudio.app/mcp`
- API key / JWT token (passed as `x-api-key` header)

## Repository structure

```
skills/
  power-automate-mcp/          core connection & operation skill
  power-automate-debug/        debug workflow skill
  power-automate-build/        build & deploy skill
  power-automate-monitoring/   flow health & tenant inventory skill
  power-automate-governance/   compliance & governance skill
examples/                      real debugging walkthroughs
README.md
LICENSE                        MIT
```

## Available on GitHub

Works with Copilot, Claude, and any MCP-compatible agent.

- [awesome-copilot](https://github.com/github/awesome-copilot) (merged)
- [skills.sh](https://skills.sh/?q=flowstudio) (3K+ installs)
- [Smithery](https://smithery.ai/skills/flowstudio/power-automate-mcp) (published)
- [ClawHub](https://clawhub.ai) (v1.1.0)

## Contributing

Contributions welcome. Each skill folder must contain a `SKILL.md` with the
required frontmatter. See the existing skills for the format.

## License

[MIT](LICENSE)

---

Keywords: Power Automate debugging, flow run history, expression evaluation failed,
child flow failure, nested action errors, loop iteration output, agent automation MCP,
Power Platform AI, flow definition deploy, resubmit failed run, flow monitoring,
governance, CoE, orphan detection, connector audit, archive score, maker inventory
