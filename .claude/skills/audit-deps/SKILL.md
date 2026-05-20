---
name: audit-deps
description: Audit npm dependencies across all workspaces and fix vulnerabilities. Use when the user asks to audit deps, check for vulnerabilities, run npm audit, or fix security issues in packages.
disable-model-invocation: true
---

## Steps

1. **Find all directories with a `package-lock.json`** using Glob to search from the repo root.

2. **For each directory**, run `npm audit --json` (with the working directory set to that package directory) to get structured results.

3. **Categorize vulnerabilities**:
   - Fixable without breaking changes: `npm audit` reports these as fixable without `--force`.
   - Breaking changes: require `--force` or manual `package.json` edits (semver-major bumps, peer dependency conflicts).

4. **For non-breaking fixable issues**: Run `npm audit fix` in that directory. Then re-run `npm audit` to confirm the remaining count. Report which packages were updated and their new versions.

5. **For breaking changes**: Do NOT run `npm audit fix --force`. Instead, report for each affected package:
   - Package name
   - Current version → minimum safe version
   - Why it is a breaking change (e.g., major version bump, peer dep conflict)
   - What the developer must do (e.g., update the direct dependency in `package.json` to accept the new major, review the changelog, run tests)

6. **Final summary** to the user with three sections:
   - Directories where `npm audit fix` was run and lockfiles were updated (list packages + versions)
   - Directories with remaining breaking vulnerabilities (per-package details from step 5)
   - Directories that are fully clean (no vulnerabilities found)
