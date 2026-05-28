# Maintenance Window Announcement Template

Copy the sections below into your status channel, GitHub discussion, or community post when scheduling planned maintenance.

## Pre-maintenance announcement

**Subject:** Scheduled maintenance — [service name]

**Status:** Planned maintenance

### Timeline

| Field | Value |
| :--- | :--- |
| **Start (UTC)** | YYYY-MM-DD HH:MM |
| **End (UTC)** | YYYY-MM-DD HH:MM |
| **Duration** | ~[X] hours |
| **Environment** | [testnet / production / both] |

### Affected surfaces

- [ ] Frontend (`frontend/`)
- [ ] Soroban escrow contract
- [ ] Soroban RPC / Horizon endpoints
- [ ] Other: ___________

### Impact

During the window, users may experience:

- [Describe expected user-visible impact, e.g. read-only mode, delayed transactions, unavailable pages]
- [Workaround, if any]

### Contact

- **Owner:** [maintainer or team name]
- **Updates channel:** [release channel / GitHub issue link]

---

## Post-maintenance update

**Subject:** Maintenance complete — [service name]

**Status:** Resolved

### Timeline (actual)

| Field | Value |
| :--- | :--- |
| **Started (UTC)** | YYYY-MM-DD HH:MM |
| **Completed (UTC)** | YYYY-MM-DD HH:MM |
| **Total duration** | [X] hours [Y] minutes |

### Outcome

- [What was deployed, migrated, or changed]
- [Any residual impact users should know about]

### Verification

- [ ] Homepage loads and wallet connection works
- [ ] Job listing and job detail routes respond
- [ ] Contract reads succeed (`get_job_count`, `get_job`)
- [ ] Critical write paths verified in target environment

### Follow-up

- [Link to release notes, rollback notes, or incident issue if applicable]
- See [release-checklist.md](./release-checklist.md) for rollback steps if issues persist.
