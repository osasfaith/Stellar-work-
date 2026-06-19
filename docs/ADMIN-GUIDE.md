# Admin Guide — Timelocked Governance

This guide explains how contract administrators use the timelocked governance system introduced in [Issue #6](https://github.com/Stelllar-Works/Stellar-work-/issues/6).

---

## Overview

All sensitive admin actions on the escrow contract now go through a two-step proposal flow:

| Step | Who | What |
|---|---|---|
| 1. Propose | Admin | Queue an operation and start the timelock countdown |
| 2. Execute | Anyone | Run the operation after the delay has elapsed |

Between steps 1 and 2 the admin can cancel the proposal. If no one executes it within 30 days the proposal expires automatically.

**Exception:** `resolve_dispute` bypasses the timelock entirely. Dispute resolution needs a fast admin response and cannot safely wait hours or days.

---

## Covered operations

| Operation | Contract entry point | Parameters |
|---|---|---|
| UpdateFeeBps | `propose_operation` | New platform fee in basis-points (0–10 000) |
| TransferAdmin | `propose_operation` | New admin Stellar address |
| SetDescPayloadMax | `propose_operation` | Max description payload size in bytes (32–65 536) |
| SetMaxActiveJobsPerClient | `propose_operation` | Limit (0 = uncapped) |
| AddAllowedToken | `propose_operation` | Token contract address |
| RemoveAllowedToken | `propose_operation` | Token contract address |
| WithdrawFees | `propose_operation` | Token contract address |
| UpdateTimelockDelay | `propose_operation` | New delay in seconds (min 3 600) |

---

## Timelock rules

- **Minimum delay:** 3 600 s (1 hour). You cannot set a lower floor.
- **Default delay:** 3 600 s. Set during initialization; changeable via `UpdateTimelockDelay`.
- **Expiry:** 30 days from the moment of proposal. Expired proposals cannot be executed.
- **Sequential IDs:** Proposals are numbered 1, 2, 3 … in order of submission.

---

## Using the admin UI

### Access

Open the app and navigate to the **Admin Panel**. Connect your Freighter wallet. If your address matches `NEXT_PUBLIC_ADMIN_ADDRESS` you will see admin controls; otherwise the panel shows an "Unauthorized" state.

### Tabs

**Overview** — Platform fee balance, job status summary, full job table. The "Withdraw Fees (direct)" button on this tab does NOT use the timelock; it invokes `withdraw_fees` immediately. Use the Governance tab to route withdrawals through the proposal flow instead.

**Governance** — Timelock settings, proposal form, and proposal list. A badge on the tab button counts active (pending + ready) proposals.

### Submitting a proposal

1. Click the **Governance** tab.
2. Choose an operation type from the dropdown.
3. Enter the parameter value.
4. Review the delay warning — the proposal will be locked for the displayed duration.
5. Click **Submit Proposal**.

On success a confirmation shows the proposal ID and when it becomes executable.

### Executing a proposal

Once the timelock has elapsed the proposal status changes from **pending** to **ready**. Any user (not just the admin) can click **Execute** to run the operation. The button only appears when the proposal is ready.

### Cancelling a proposal

The admin can cancel a pending or ready proposal at any time before it is executed. Click **Cancel** next to the proposal. Cancelled proposals cannot be un-cancelled or executed.

---

## CLI — Stellar CLI

The following commands are equivalent to the UI actions above. Replace `<CONTRACT_ID>`, `<ADMIN_SOURCE>`, and `<NETWORK>` with your values.

### Propose an operation

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SOURCE> \
  --network <NETWORK> \
  -- propose_operation \
  --caller <ADMIN_ADDRESS> \
  --operation '{"UpdateFeeBps": 300}'
```

The returned value is the proposal ID (u64).

### Execute a proposal

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ANY_SOURCE> \
  --network <NETWORK> \
  -- execute_operation \
  --op_id <PROPOSAL_ID>
```

This call will fail with:
- `OperationNotReady (#21)` — timelock has not elapsed yet
- `OperationExpired (#22)` — 30-day expiry has passed
- `OperationAlreadyExecuted (#19)` — already executed
- `OperationCancelled (#20)` — cancelled by the admin

### Cancel a proposal

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SOURCE> \
  --network <NETWORK> \
  -- cancel_operation \
  --caller <ADMIN_ADDRESS> \
  --op_id <PROPOSAL_ID>
```

### Read a proposal

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ANY_SOURCE> \
  --network <NETWORK> \
  -- get_operation \
  --op_id <PROPOSAL_ID>
```

Returns a `TimelockedOperation` struct:

```json
{
  "proposer": "G...",
  "operation": { "UpdateFeeBps": 300 },
  "proposed_at": 1718000000,
  "earliest_execution": 1718003600,
  "executed": false,
  "cancelled": false
}
```

### Check the current timelock delay

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ANY_SOURCE> \
  --network <NETWORK> \
  -- get_timelock_delay
```

### List all proposal IDs

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ANY_SOURCE> \
  --network <NETWORK> \
  -- get_proposals_count
```

Iterate from 1 to the returned count to inspect each proposal with `get_operation`.

---

## Changing the timelock delay

The delay is itself guarded by the timelock. To change it:

1. Propose `UpdateTimelockDelay` with the new value (in seconds, ≥ 3 600).
2. Wait for the current delay to elapse.
3. Execute the proposal.

The new delay applies to all proposals submitted after execution.

---

## Dispute resolution (timelock bypass)

The `resolve_dispute` entry point is the only admin function that bypasses the timelock. Disputes require a fast response — waiting hours for a timelock is not acceptable when funds are locked.

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SOURCE> \
  --network <NETWORK> \
  -- resolve_dispute \
  --job_id <JOB_ID> \
  --resolution '{"client_bps": 10000}'
```

`client_bps` is the share (0–10 000) of the escrowed amount returned to the client; the remainder goes to the freelancer minus the platform fee.

---

## Error reference

| Code | Name | Meaning |
|---|---|---|
| #18 | `OperationNotFound` | No proposal with the given ID exists |
| #19 | `OperationAlreadyExecuted` | Proposal has already been executed |
| #20 | `OperationCancelled` | Proposal was cancelled; cannot execute |
| #21 | `OperationNotReady` | Timelock delay has not yet elapsed |
| #22 | `OperationExpired` | 30-day expiry window has passed |
| #23 | `DelayBelowMinimum` | Requested delay is below the 3 600 s floor |

---

## Security considerations

- Keep the admin key in cold storage. The timelock limits blast radius if the key is compromised, but the admin can still propose malicious operations.
- Monitor the `operation_proposed` event on-chain. Any unexpected proposal should be cancelled immediately via a second admin device.
- The 30-day expiry is a safety net, not a substitute for active monitoring.
- For mainnet deployments, consider raising the delay to 48 hours (172 800 s) or 7 days (604 800 s) to give users more reaction time.
