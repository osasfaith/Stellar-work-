# PR Title Conventions

This document defines the PR title conventions enforced by CI to ensure consistency and clarity in our commit history.

## Format

PR titles must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>
```

### Components

- **type** (required): The type of change
- **scope** (optional): The component or area affected
- **description** (required): A brief description of the change

### Allowed Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | A new feature | `feat(auth): add OAuth2 login support` |
| `fix` | A bug fix | `fix(contract): resolve panic in dispute resolution` |
| `docs` | Documentation only changes | `docs(readme): update installation instructions` |
| `style` | Code style changes (formatting, etc.) | `style(frontend): format code with prettier` |
| `refactor` | Code refactoring | `refactor(contract): simplify job state machine` |
| `test` | Adding or updating tests | `test(frontend): add e2e test for job submission` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |
| `ci` | CI/CD changes | `ci(workflow): add PR title lint check` |
| `build` | Build system changes | `build(contract): update soroban-sdk version` |
| `perf` | Performance improvements | `perf(frontend): optimize job listing rendering` |
| `revert` | Revert a previous commit | `revert: feat(add-feature)` |

### Scope

The scope provides additional context about the component or area affected. Common scopes include:

- `contract` - Smart contract changes
- `frontend` - Frontend application changes
- `auth` - Authentication/authorization
- `docs` - Documentation
- `deps` - Dependencies
- `ci` - CI/CD configuration

### Description

- Use the imperative mood (e.g., "add" not "added" or "adds")
- Use lowercase letters (except for proper nouns)
- Don't end with a period
- Keep it under 72 characters total
- Be concise but descriptive

## Examples

### Good Examples

```
feat(contract): add dispute resolution functionality
fix(frontend): resolve bookmark persistence issue
docs(readme): update deployment instructions
test(contract): add test for edge case in fee calculation
chore(deps): update Next.js to version 15
ci(workflow): add automated PR title linting
```

### Bad Examples (Will Fail CI)

```
❌ Add new feature (missing type)
❌ FEAT: add new feature (wrong case)
❌ feat: Add new feature. (period at end)
❌ feat: This is a very long description that exceeds the 72 character limit
❌ added new feature (wrong mood)
❌ wip (not a valid type)
```

## Enforcement

PR titles are automatically checked by the `PR Title Lint` workflow in CI. If your PR title doesn't follow the convention, the check will fail and block merging.

To fix a failing title:
1. Edit your PR title on GitHub
2. Ensure it follows the format: `<type>(<scope>): <description>`
3. The check will automatically re-run when you update the title

## Why This Matters

- **Consistency**: Makes it easier to scan and understand changes
- **Automation**: Enables automatic changelog generation
- **Clarity**: Clearly communicates the intent of changes
- **History**: Provides a clean, readable commit history

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
