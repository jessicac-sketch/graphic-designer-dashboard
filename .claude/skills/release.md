# /release — Bump version, update changelog, commit, push

Run this whenever the user types `/release` (optionally with a bump level, e.g. `/release patch`). It bumps the package version, records what changed in `CHANGELOG.md`, commits, and pushes the current branch — end to end, without re-asking for each step unless something is ambiguous.

## Steps

1. **Check for uncommitted changes and recent commits.** Run `git status --short` and `git log --oneline <last-version-bump-commit>..HEAD` (find the last "chore: Bump version to X.Y.Z" commit via `git log --oneline | grep -i "bump version"`) to see everything that will go into this release: staged/unstaged working-tree changes plus any already-committed-but-unreleased commits on this branch.

2. **Decide the bump level** (unless the user specified one as an argument):
   - `minor` if any change is a new feature/column/endpoint/UI addition (commit type `feat`/`feature`, or working-tree changes that clearly add capability).
   - `patch` if everything is a `fix` or `chore` — bug fixes, refactors, config tweaks, no new capability.
   - `major` only if the user explicitly asks for it (this project doesn't follow strict semver breaking-change discipline, so never infer major on your own).
   - If genuinely ambiguous, ask the user with AskUserQuestion rather than guessing.

3. **Read the current version** from `package.json`.

4. **Write/update `CHANGELOG.md`** (create it with a "Keep a Changelog"-style header if it doesn't exist yet — see `https://keepachangelog.com/en/1.1.0/`). Add a new top section:
   ```
   ## [X.Y.Z] - YYYY-MM-DD
   
   ### Added
   - ...
   
   ### Fixed
   - ...
   
   ### Changed
   - ...
   ```
   Only include the subsections that actually apply. Write entries in plain, user-facing language (what changed and why it matters), not a raw commit-message dump — synthesize from the diff/commits, don't just copy them. Use today's actual date (check the session's `currentDate` context, don't guess).

5. **Bump the version**: run `npm version <patch|minor|major> --no-git-tag-version` (the `--no-git-tag-version` flag is required — this project commits the bump itself with its own message and changelog, rather than npm's default separate tag+commit).

6. **Verify the build still passes** before committing: `npm run build`. If it fails, stop and fix the underlying issue — never commit a broken build.

7. **Stage and commit.** Follow this repo's commitlint rules (see `commitlint.config.js`): type must be one of `feat`/`feature`/`fix`/`chore` (use `chore` for a version-bump commit), subject in Sentence case. Match the existing convention, e.g.:
   ```
   git commit -m "$(cat <<'EOF'
   chore: Bump version to X.Y.Z and update changelog

   <1-2 sentence summary of what this release covers>
   EOF
   )"
   ```
   The repo's pre-commit hook already runs Prettier and a full build — let it run rather than skipping with `--no-verify`.

8. **Push** the current branch: `git push origin <current-branch>`.

9. **Report back** with the new version number, a short summary of what's in the release, and the push confirmation. Don't create a PR unless asked.

## Notes

- This is a project-specific skill (lives in `.claude/skills/release.md`), not a global one — it won't be available outside this repo.
- Never push to `main` directly without the user's explicit go-ahead if the current branch is `main` — confirm first, since that's a shared/protected branch in this workflow.
- If there's nothing uncommitted and no unreleased commits since the last version bump, tell the user there's nothing to release instead of bumping anyway.
