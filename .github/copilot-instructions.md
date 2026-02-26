# Copilot Code Review Instructions

When reviewing pull requests:

## Review goals (in order)

1. Correctness & bugs
2. Security/privacy concerns
3. Performance regressions (React/Next.js)
4. Maintainability & clarity
5. Consistency with existing patterns in this repo

## How to comment

- Be specific: point to the exact file/line and explain impact.
- Prefer actionable suggestions (what to change + why).
- If a change is optional/nice-to-have, label it as such.

## React/Next.js performance

- For React/Next.js changes, apply the “Vercel React Best Practices” rules listed in our path-specific instructions:
  - .github/instructions/react-next-performance.instructions.md
