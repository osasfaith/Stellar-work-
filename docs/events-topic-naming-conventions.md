# Events Topic Naming Conventions

This document defines the naming standards for event topics in the StellarWork escrow contract to ensure consistency across the codebase and improve event consumer experience.

## Naming Rules

### General Format
Event topics follow the pattern: `{entity}_{action}` or `{action}_{entity}`

- **All lowercase**: Event topics must use lowercase letters only
- **Underscore separated**: Use underscores (`_`) to separate words
- **Past tense verbs**: Use past tense to indicate the action has completed
- **Descriptive**: Names should clearly describe what happened
- **Concise**: Keep names short while maintaining clarity

### Verb Conventions
Use standard past tense verbs for actions:
- `created` - when a new entity is created
- `accepted` - when something is accepted
- `submitted` - when something is submitted
- `approved` - when something is approved
- `rejected` - when something is rejected
- `cancelled` - when something is cancelled
- `enforced` - when a rule/policy is enforced
- `disputed` - when a dispute is raised
- `resolved` - when a dispute is resolved
- `transferred` - when ownership is transferred
- `updated` - when a value is changed
- `withdrawn` - when funds are withdrawn

### Entity Names
Use consistent entity names:
- `job` - for job-related events
- `admin` - for admin-related events
- `fee` / `fees` - for fee-related events
- `deadline` - for deadline-related events
- `dispute` - for dispute-related events

## Current Event Topics

The following event topics are currently used in the contract:

| Event Topic | Description | Trigger |
|-------------|-------------|---------|
| `job_created` | A new job was posted | `post_job` function |
| `job_accepted` | A freelancer accepted a job | `accept_job` function |
| `job_submitted` | Work was submitted for review | `submit_work` function |
| `job_approved` | Work was approved | `approve_work` function |
| `job_rejected` | Work was rejected | `reject_work` function |
| `job_cancelled` | A job was cancelled | `cancel_job` function |
| `deadline_enforced` | A deadline was enforced | `enforce_deadline` function |
| `job_disputed` | A dispute was raised | `raise_dispute` function |
| `dispute_resolved` | A dispute was resolved | `resolve_dispute` function |
| `admin_transferred` | Admin was transferred | `transfer_admin` function |
| `fee_updated` | Fee was updated | `update_fee_bps` function |
| `max_active_jobs_updated` | Max active jobs limit was updated | `set_max_active_jobs_per_client` function |
| `fees_withdrawn` | Fees were withdrawn | `withdraw_fees` function |

## Examples

### Good Examples
```rust
// Job lifecycle events
e.events().publish((Symbol::new(&e, "job_created"),), (job_id, client, amount, token));
e.events().publish((Symbol::new(&e, "job_accepted"),), (job_id, freelancer));
e.events().publish((Symbol::new(&e, "job_approved"),), (job_id, client, freelancer, payout));

// Admin events
e.events().publish((Symbol::new(&e, "admin_transferred"),), (caller, new_admin));

// Fee events
e.events().publish((Symbol::new(&e, "fee_updated"),), (caller, new_fee_bps));
e.events().publish((Symbol::new(&e, "fees_withdrawn"),), (token, fees));
```

### Bad Examples (Do Not Use)
```rust
// ❌ Uses camelCase
e.events().publish((Symbol::new(&e, "jobCreated"),), ...);

// ❌ Uses hyphens
e.events().publish((Symbol::new(&e, "job-created"),), ...);

// ❌ Uses present tense
e.events().publish((Symbol::new(&e, "job_create"),), ...);

// ❌ Uses uppercase
e.events().publish((Symbol::new(&e, "JOB_CREATED"),), ...);

// ❌ Too vague
e.events().publish((Symbol::new(&e, "updated"),), ...);
```

## Adding New Events

When adding new event topics:

1. **Check existing events**: Review the current event topics to ensure consistency
2. **Follow the pattern**: Use `{entity}_{action}` or `{action}_{entity}` format
3. **Use past tense**: Ensure the verb is in past tense
4. **Be descriptive**: The name should clearly indicate what happened
5. **Update this document**: Add the new event to the "Current Event Topics" table
6. **Update tests**: Ensure event emission is tested in the test suite

## Event Data Payload

Event data payloads should include relevant information for the event:
- **Entity identifiers**: Always include the primary entity ID (e.g., `job_id`)
- **Actor addresses**: Include the address of the user who triggered the event
- **Relevant values**: Include amounts, statuses, or other relevant data
- **Timestamp**: The ledger timestamp is automatically included by Soroban

## Versioning

If event topic names need to change in a future version:
1. Deprecate the old event topic (keep it for backward compatibility)
2. Add the new event topic following current conventions
3. Document the change in the release notes
4. Update this document with both old and new topics during transition period
