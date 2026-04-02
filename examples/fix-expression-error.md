# Fix expression error in child flow

Real production case: ArtsVision Timesheet child flow failing intermittently.

## What the portal showed

- Parent flow: succeeded
- Child flow: **Failed**
- Error: `ExpressionEvaluationFailed` — no further detail visible

The portal does not expand into child flow actions or show which expression
failed or what input caused it.

## What the agent did

### 1. Listed recent runs of the parent flow

```
Agent: list_live_flows → found "ArtsVision Timesheet" parent flow
Agent: get_live_flow_runs → found 2 recent runs: one succeeded, one failed
```

### 2. Compared the two runs

The agent retrieved action outputs for both the successful and failed runs
using `get_live_flow_run_action_outputs`. This is the key step — the portal
only shows one run at a time and hides action-level detail behind click-through.

### 3. Traced into the child flow

The failed run showed the parent flow called a child flow ("ArtsVision
Timesheet Child"). The agent followed the child flow's run ID and retrieved
its action outputs.

### 4. Found the failing action inside a loop

Inside the child flow, a `Select` action inside an `Apply to each` loop was
using this expression:

```
contains(string(item()?['serviceExceptionJson']), 'error')
```

The expression crashed when `serviceExceptionJson` was a **nested object**
instead of a string. On successful runs, the field was either null or a flat
string. On the failing run, the Power BI refresh returned a nested JSON
structure that `string()` could not serialize the same way.

### 5. Root cause

The Power BI data source had an intermittent SQL timeout. When the timeout
occurred, the `serviceExceptionJson` field contained a nested retry structure
instead of a flat error string. The expression assumed a flat string.

## What the portal could not show

- Which expression failed (only showed `ExpressionEvaluationFailed`)
- What the input value was (the nested JSON structure)
- The difference between the successful and failed run inputs
- That the root cause was upstream (PBI data source timeout), not the flow logic

## Tools used

- `list_live_flows` — find the flow
- `get_live_flow_runs` — get recent run history
- `get_live_flow_run_action_outputs` — retrieve action-level inputs and outputs
- `get_live_flow_run_error` — top-level error (insufficient on its own)
