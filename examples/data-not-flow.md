# Data entry error, not a flow bug

Real client case: user reported two "bugs" in the same flow, back to back.
Agent proved both were data entry issues. The flow was correct both times.

## The report

> "The email flow is broken again — it sent to the wrong people twice today."

## What the agent did

### Bug 1: Missing comma in email addresses

```
Agent: get_live_flow_runs → found the "failed" run (actually succeeded)
Agent: get_live_flow_run_action_outputs → retrieved Send_Email action inputs
```

The `To` field was populated from a SharePoint column. The agent retrieved
the action inputs and found:

```
"to": "alice@example.com bob@example.com"
```

Missing comma between the two addresses. The flow sent the email to a
malformed address. Not a flow bug — a data entry error in the SharePoint list.

### Bug 2: CC field had only one address

The user expected the email to CC multiple people. The agent retrieved the
action inputs again:

```
"cc": "manager@example.com"
```

The SharePoint column `SiteAndVenueReport` only contained one email address.
The flow was correctly reading the column — the column only had one entry.

## Time to resolution

Both issues diagnosed in under 60 seconds. No flow changes needed.

## Why this matters

A human could open the portal, click into the Send Email action, expand the
inputs, and spot the bad addresses. But without MCP, the agent only sees
"run succeeded" from the Graph API — it has no way to inspect the action
inputs or compare them against what was expected.

With MCP, the agent did what you would do in the portal — automatically and
in seconds.

## The universal pain point

Most "flow bugs" reported by end users are data entry problems. The flow is
doing exactly what it was told — the input data is wrong. An agent with MCP
access can prove this in seconds instead of a back-and-forth investigation.

## Tools used

- `list_live_flows` — find the flow
- `get_live_flow_runs` — get the specific run
- `get_live_flow_run_action_outputs` — retrieve action inputs to see what data the flow actually received
