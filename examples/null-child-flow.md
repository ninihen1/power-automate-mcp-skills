# Null value crashes child flow

Real production case: "ArtsVision Technical Roster for TOIL" parent + child
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

The agent examined the loop iteration outputs and found that **38% of
ArtsVision records had null Name fields**. This was not an edge case — it
was a systemic data quality issue.

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

## What the portal could not show

- Which loop iteration failed (portal collapses loop detail)
- What the null value was (portal shows the expression, not the input)
- The percentage of records affected (requires examining multiple iterations)
- The CostCentre/CostCenter mismatch (different action, not flagged as error)

## Tools used

- `list_live_flows` — find parent and child flows
- `get_live_flow_runs` — trace run history across both flows
- `get_live_flow_run_action_outputs` — inspect loop iterations and action inputs
- `get_live_flow` — read flow definition to understand the union logic
- `update_live_flow` — deploy the fix
