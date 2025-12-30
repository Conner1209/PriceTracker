---
description: GitHub workflow using MCP server for issue management
---

# GitHub Workflow

## Quick Reference

| Action | Command |
|--------|---------|
| List Issues | `mcp_github_list_issues({ owner: 'Conner1209', repo: 'PriceTracker', state: 'open', per_page: 30 })` |
| Close Issue | `mcp_github_update_issue({ owner: 'Conner1209', repo: 'PriceTracker', issue_number: X, state: 'closed' })` |

---

## Issue Completion Workflow

**CRITICAL: Follow this for EVERY issue:**

### 1. Build & Test Verification
```bash
# Frontend
npm run build
npm test

# Backend (Python)
cd backend
python -m pytest
```

### 2. Manual Verification
- **Ask user to verify** on dev server
- **Wait for confirmation** before proceeding
- Especially important for:
  - API changes
  - UI changes
  - Scraper logic changes

### 3. Provide Commit Message
Use conventional commits format with bullet points:
```
feat: add price history chart

• Implement line chart with Recharts
• Add 30/60/90 day range selector
• Display min/max/avg stats

Closes #5
```

**Format Rules:**
- First line: `type: short description` (no period)
- Blank line
- Bullet points with `•` for details
- Blank line
- `Closes #X` at the end


### 4. Close Issue (ONLY after user verification)
```typescript
// 1. Add summary comment
mcp_github_add_issue_comment({
    owner: 'Conner1209',
    repo: 'PriceTracker',
    issue_number: X,
    body: '## ✅ Completed\n\n[summary of changes]'
})

// 2. Close the issue
mcp_github_update_issue({
    owner: 'Conner1209',
    repo: 'PriceTracker',
    issue_number: X,
    state: 'closed'
})
```

> ⚠️ **Do NOT close issues before user verifies!** Build passing ≠ feature working.

---

## GitHub MCP Patterns

### Listing Issues
```typescript
// Always use per_page: 30 to avoid truncation
mcp_github_list_issues({ 
    owner: 'Conner1209', 
    repo: 'PriceTracker', 
    state: 'open',
    per_page: 30
})
```

**Known quirk:** Results can be truncated. Always check `per_page` is set.

### ⚠️ Project Board Pitfall
The user manages issues via a GitHub Project board (kanban style). **Moving cards to "Done" does NOT close issues!** They remain `state: open` in the API.

**Before starting work, always verify:**
- Is this issue actually still open? (check API, not just board)
- Was it already completed but not closed? (ask user if unsure)

### Creating Issues
```typescript
mcp_github_create_issue({
    owner: 'Conner1209',
    repo: 'PriceTracker',
    title: 'Add dark mode toggle',
    body: '## Overview\n...',
    labels: ['frontend', 'priority: medium']
})
```

---

## Commit Conventions

| Prefix | Use For |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring |
| `test:` | Adding/updating tests |
| `docs:` | Documentation changes |
| `chore:` | Maintenance tasks |

Include `Closes #X` in commit body to auto-close issues on push.

---

## Available Issue Labels

### Area
| Label | Description |
|-------|-------------|
| `frontend` | React components, UI, styling |
| `backend` | Python API, Flask/FastAPI endpoints |
| `scraper` | Price scraping logic, parsers |
| `database` | SQLite schema, queries |
| `infrastructure` | Deployment, systemd, nginx |

### Type
| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `feature` | New functionality |
| `refactor` | Code cleanup, no new features |
| `documentation` | Improvements or additions to documentation |
| `research` | Investigation/exploration needed |
| `tech-debt` | Code cleanup and maintenance |
| `testing` | Test coverage and quality |

### Priority
| Label | Description |
|-------|-------------|
| `priority: high` | Blocking or critical |
| `priority: medium` | Important but not urgent |
| `priority: low` | Nice to have |

### Effort
| Label | Description |
|-------|-------------|
| `effort: small` | Less than 1 hour |
| `effort: medium` | 1-4 hours |
| `effort: large` | More than 4 hours or multi-session |

### Status
| Label | Description |
|-------|-------------|
| `blocked` | Waiting on something else |
| `help wanted` | Extra attention is needed |

---

## Useful Links

- **Repo:** https://github.com/Conner1209/PriceTracker
- **Issues:** https://github.com/Conner1209/PriceTracker/issues
