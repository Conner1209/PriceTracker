# AI Agent Workflow SOP: The "Golden Example"

**Version:** 1.1
**Date:** December 19, 2025
**Context:** Best practices from SzarBlog project evolution

---

## 1. Philosophy: "Measure Twice, Cut Once"

The secret to efficiency is not coding speed—it's **planning accuracy**. An AI agent should spend 30-40% of the total time analyzing and planning before writing a single line of code. This prevents "hallucinated complexity" and backtracking.

## 2. The 4-Step Workflow

### Step 1: Deep Analysis & Planning (The "Brain" Phase)
**Goal:** Eliminate ambiguity.

1.  **Read the Code**: Don't just guess. Read the target files, their dependencies, and the context (e.g., `types.ts`, `api.ts`).
2.  **Map the Flow**: Understand data flow. Where does state live? Who passes props? Draw it out (mentally or via Mermaid diagrams).
3.  **Create the Artifact**: Write a detailed `implementation_plan.md`.
    *   **Must Include**: File paths, new folder structures, exact function signatures, and **Design Decisions** (Option A vs. Option B).
4.  **Ask & Validate**: Present the plan to the user.
    *   *Prompt:* "I recommend Option A because [Reason]. Does this align with your vision?"
    *   **CRITICAL**: Do not proceed until the user approves the plan.

### Step 2: Phased Execution (The "Build" Phase)
**Goal:** Maintain a working state.

1.  **Define Phases**: Break work into atomic chunks (e.g., "Foundation", "Hooks", "Components").
2.  **Safe Stop Points**: Explicitly mark where work can pause.
    *   *Example:* "Phase 1 complete. Safe to stop here. App is still running."
3.  **Bottom-Up Construction**:
    *   Start with **Utils/Types** (Dependencies).
    *   Build **Hooks** (Logic).
    *   Build **Components** (UI).
    *   Build **Orchestrator** (Integration).
4.  **Phase 0 Quick Wins**: If there's a small, unrelated bug (e.g., login redirect), fix it first to build trust.

### Step 3: Communication (The "Bridge" Phase)
**Goal:** Keep the user in the loop without overwhelming them.

1.  **Explain "Why"**: Don't just say "I created a hook." Say "I created a hook to act as a clipboard for your form data, saving you from writing 10 `useState` calls."
2.  **Use Analogies**: Simplify complex technical concepts.
3.  **Transparency**: If a phase is risky (e.g., "Integration Phase must be done in one go"), warn the user **before** starting.

### Step 4: Verification (The "Proof" Phase)
**Goal:** Zero regressions.

1.  **The Walkthrough**: Create a `walkthrough.md` artifact.
2.  **Automated Tests**: Run both frontend and backend test suites (142 total tests).
    *   Frontend: `npm test` (76 tests)
    *   Backend: `cd backend && npm test` (66 tests)
3.  **The Checklist**: Provide a manual testing checklist.
    *   *Bad:* "Test the app."
    *   *Good:* "Test 3: Click 'Create Post', select 'Recipe', upload image. Expected: Form submits."
4.  **Root Cause Analysis**: If a test fails (e.g., Drag & Drop issue), analyze **why** before fixing. Don't just apply a patch; fix the architectural disconnect.

---

## 3. Template: Implementation Plan

Use this structure for every complex task:

```markdown
# Implementation Plan: [Task Name]

## Goal
Brief summary of what we are achieving.

## User Review Required
*   [Decision A]: Option 1 vs Option 2?
*   [Risk]: Potential breaking change?

## Proposed Changes

### Phase 1: Foundation
*   [NEW] `path/to/file.ts` - Description

### Phase 2: Core Logic
*   [MODIFY] `path/to/existing.ts` - Description

## Verification Plan
*   [ ] Automated Build Test
*   [ ] Manual Test Case 1
*   [ ] Manual Test Case 2
```

## 4. Template: Task Boundary Updates

Keep the user informed via the UI:

*   **Planning**: "Analyzing codebase and designing architecture..."
*   **Execution**: "Phase 2: Building custom hooks for image upload..."
*   **Verification**: "Verifying build status and preparing test checklist..."

---

## 5. Golden Rules

1.  **Never break the build** mid-task unless explicitly warned.
2.  **Respect the user's preferences** (e.g., "I like the toggle UI").
3.  **Files over Monoliths**: Always prefer small, focused files over large ones.
4.  **Barrel Exports**: Use `index.ts` to keep import paths clean.
5.  **Confirm before Deleting**: Always verify the new replacement works before deleting the old code.
6.  **Commit Messages**: Follow the bullet-point format in `github-workflow.md` (conventional commits with `•` bullets).
7.  **User Verification Required**: Never close GitHub issues before user confirms the fix works in their environment.
