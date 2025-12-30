---
description: GitHub workflow using MCP server for issue management and deployments
---

# GitHub & Deployment Workflow

## Quick Reference

| Action | Command |
|--------|---------|
| Deploy Frontend | `git push` (auto via Cloudflare Pages) |
| Deploy Backend | `cd backend && npx wrangler deploy` |
| List Issues | `mcp_github_list_issues({ owner: 'Conner1209', repo: 'SzarBlog', state: 'open', per_page: 30 })` |
| Close Issue | `mcp_github_update_issue({ owner: 'Conner1209', repo: 'SzarBlog', issue_number: X, state: 'closed' })` |

---

## Issue Completion Workflow

**CRITICAL: Follow this for EVERY issue:**

### 1. Build & Test Verification
```bash
# Frontend
npm run build
npm test

# Backend
cd backend
npx tsc --noEmit
npm test
```

### 2. Manual Verification
- **Ask user to verify** on dev server or production
- **Wait for confirmation** before proceeding
- Especially important for:
  - API changes (may need `wrangler deploy` first!)
  - UI changes
  - Breaking changes

### 3. Provide Commit Message
Use conventional commits format with bullet points:
```
feat: add visual image cropping tool

• Implement CropOverlay modal with 4:3 aspect ratio
• Add thematic accents (Sky/Amber) based on post type
• Integrate cropping into imageResize utility and useImageUpload hook
• Update CreatePostTab to trigger cropper on file drop/selection

Closes #15
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
    repo: 'SzarBlog',
    issue_number: X,
    body: '## ✅ Completed\n\n[summary of changes]'
})

// 2. Close the issue
mcp_github_update_issue({
    owner: 'Conner1209',
    repo: 'SzarBlog',
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
    repo: 'SzarBlog', 
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
    repo: 'SzarBlog',
    title: 'Add dark mode toggle',
    body: '## Overview\n...',
    labels: ['frontend', 'priority: medium']
})
```

### Project Board Note
The user uses a GitHub Project board (kanban). **Moving cards does NOT close issues** - they remain "open" until explicitly closed via API or web UI.

---

## Deployment

### Frontend (Cloudflare Pages)
**Auto-deploys on push to `main`**

```bash
git add .
git commit -m "feat: your feature"
git push
```

- Builds via Vite
- Deploys to https://szarblog.pages.dev
- Live in ~2 minutes

### Backend (Cloudflare Workers)
**Manual deployment required**

```bash
cd backend
npx wrangler deploy
```

- Deploys to https://szarblog-api.conner1209.workers.dev
- Required for API changes to take effect!

### Secrets Management
```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put OPENWEATHER_API_KEY
npx wrangler secret put GEMINI_API_KEY
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
| `backend` | Cloudflare Worker, API endpoints, D1, R2 |
| `admin` | Admin panel features |
| `database` | D1 schema, migrations, queries |
| `infrastructure` | Deployment, CI/CD, configuration |

### Type
| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `feature` | New functionality |
| `refactor` | Code cleanup, no new features |
| `documentation` | Improvements or additions to documentation |
| `research` | Investigation/exploration needed |
| `security` | Security related tasks |
| `tech-debt` | Code cleanup and maintenance |
| `testing` | Test coverage and quality |
| `dx` | Developer experience improvements |
| `ai` | AI-related features |

### Priority
| Label | Description |
|-------|-------------|
| `priority: high` | Blocking or critical |
| `priority: medium` | Important but not urgent |
| `priority: low` | Nice to have |
| `low priority` | (legacy) |

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
| `good first issue` | Good for newcomers |

### Meta (GitHub defaults)
| Label | Description |
|-------|-------------|
| `duplicate` | This issue or pull request already exists |
| `invalid` | This doesn't seem right |
| `question` | Further information is requested |
| `wontfix` | This will not be worked on |

---

## Troubleshooting

### Posts not loading after API changes
**Cause:** Backend not deployed, frontend expects new response format
**Fix:** `cd backend && npx wrangler deploy`

### Login not working
**Cause:** Auth cookie or response format mismatch
**Fix:** Check AuthContext uses `result.data.user` (not `result.user`)

### MCP commands failing
- Verify repo is `Conner1209/SzarBlog` (case-sensitive)
- Check GitHub MCP server is connected

---

## Useful Links

- **Repo:** https://github.com/Conner1209/SzarBlog
- **Issues:** https://github.com/Conner1209/SzarBlog/issues
- **Live Site:** https://szarblog.pages.dev
- **API:** https://szarblog-api.conner1209.workers.dev
