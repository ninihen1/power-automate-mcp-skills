# Null value crashes child flow

Real production case: "Contoso Technical Roster for TOIL" parent + child
flow. Child flow crashing on a subset of records.

## What the portal showed

- Parent flow: **Failed**
- Error: `ActionFailed` on the child flow call
- Child flow run: **Failed**
- Error: `ExpressionEvaluationFailed` — no further detail

## What the agent did

### 1. Traced parent to child

```
Agent: get_live_flow_runs → parent flow failed
Agent: get_live_flow_run_action_outputs → child flow action showed failure
Agent: get_live_flow_runs (child flow) → found the child run ID
Agent: get_live_flow_run_action_outputs (child flow) → found failing action
```

### 2. Found the crash inside a loop

The child flow had an `Apply to each` loop iterating over roster records.
Inside the loop, this expression:

```
split(item()?['Name'], ', ')
```

Crashed when `Name` was **null**. `split()` cannot operate on null.

### 3. Measured the scope of the problem

The agent scanned all loop iteration outputs at once and found that **38% of
Contoso records had null Name fields**. This was not an edge case — it
was a systemic data quality issue.

In the portal, a human would need to click through each iteration one by one
to find affected records. When a loop iteration fails, the portal has a "next
failed" button — but when iterations succeed with bad data (no error thrown),
there's no shortcut. The agent with MCP can inspect all iterations in bulk.

### 4. Found a second bug

While investigating, the agent also found a field name mismatch:
- Parent flow referenced `CostCentre` (British spelling)
- Some data sources used `CostCenter` (American spelling)

This caused silent data loss on affected records.

### 5. Deployed the fix

The agent used `update_live_flow` to modify the parent flow definition:
- Changed the `union()` operation order so new data takes priority over
  archive data
- This ensured records with populated Name fields were preferred

## What the agent could not see without MCP

A human could click through the portal, expand each loop iteration, and
eventually find the null Name. But via Graph API, the agent only sees
`ActionFailed` — it cannot:

- Inspect which loop iteration failed or what the null value was
- Examine multiple iterations to measure the scope of the problem
- Read the flow definition to understand the union logic
- Deploy a fix directly

## Tools used

- `list_live_flows` — find parent and child flows
- `get_live_flow_runs` — trace run history across both flows
- `get_live_flow_run_action_outputs` — inspect loop iterations and action inputs
- `get_live_flow` — read flow definition to understand the union logic
- `update_live_flow` — deploy the fix
