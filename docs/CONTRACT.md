# Escrow Contract Reference

Location: `contracts/escrow/src/lib.rs`

## Implemented (Starter Kit)

- `post_job(amount, desc_hash, deadline)`
- `accept_job(job_id)`
- `submit_work(job_id)`
- `approve_work(job_id)`
- `cancel_job(job_id)`
- `get_job(job_id)`
- `get_job_count()`

## Implemented (Contributor Scope)

- `raise_dispute(job_id, evidence_hash, reason_preview)` — raises a dispute with optional evidence
- `resolve_dispute(job_id, resolution)` — resolves a disputed job with basis-point split
- `get_dispute_evidence(job_id)` — retrieves evidence for a disputed job

## Data Model

### `Job` struct

| Field | Type | Description |
|-------|------|-------------|
| `client` | `Address` | The account that created and funded the job. |
| `freelancer` | `Option<Address>` | The account assigned to the job (`None` until accepted). |
| `amount` | `i128` | Total payment held in escrow (in the token's smallest unit). |
| `description_hash` | `BytesN<32>` | SHA-256 hash of the job description (all-zero hash is rejected). |
| `status` | `JobStatus` | Current lifecycle state of the job. |
| `created_at` | `u64` | **Unix epoch seconds** — set by `e.ledger().timestamp()` at `post_job` time. Read-only after creation. Example: `1710000000` (≈ 2024-03-10 UTC). |
| `deadline` | `u64` | **Unix epoch seconds** — the latest time the job is active. Use `0` for no deadline. Example: `1712592000` (≈ 2024-04-09 UTC, 30 days after the example `created_at`). |
| `token` | `Address` | The whitelisted token contract used for payment. |
| `revision_count` | `u32` | Number of times the client has rejected submitted work (max 3). |

> **Note on `created_at` vs `deadline`:** Both fields use the same unit — Unix epoch **seconds** from the Soroban ledger clock (`e.ledger().timestamp()`). They are never wall-clock timestamps supplied by the caller. `created_at` is always immutable. `deadline == 0` means no expiry enforced.

- `JobStatus`: `Open`, `InProgress`, `SubmittedForReview`, `Completed`, `Cancelled`, `Disputed`

### `DisputeEvidence` struct

| Field | Type | Description |
|-------|------|-------------|
| `evidence_hash` | `BytesN<32>` | SHA-256 hash of the off-chain evidence payload. Zero hash means no evidence provided. |
| `raised_at` | `u64` | Unix timestamp when the dispute was raised (set by `e.ledger().timestamp()`). |
| `reason_preview` | `BytesN<64>` | Short on-chain reason snippet (up to 64 bytes) for indexer display without off-chain resolution. |

### `DisputeResolution` struct

| Field | Type | Description |
|-------|------|-------------|
| `client_bps` | `u32` | Basis-points share for the client (0–10,000). 10,000 = full refund, 0 = full payout to freelancer. |

## Error Codes

- `1` JobNotFound
- `2` Unauthorized
- `3` InvalidStatus
- `4` InsufficientFunds
- `5` JobAlreadyAccepted
- `6` DeadlinePassed
- `7` DeadlineNotExpired
- `8` TokenNotAllowed
- `9` FeeTooHigh
- `10` AlreadyInitialized
- `11` InvalidAmount
- `12` InvalidDescriptionHash
- `13` UnauthorizedAdmin
- `14` InvalidDeadline
- `15` ActiveJobLimitExceeded
- `16` RevisionLimitReached
- `17` DescriptionPayloadTooLarge
