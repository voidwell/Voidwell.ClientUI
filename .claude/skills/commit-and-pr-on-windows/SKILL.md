---
name: commit-and-pr-on-windows
description: Commit, push and open a pull request in this repo from a Windows machine. Use whenever asked to commit, push or open a PR; covers the shell pitfalls that otherwise produce empty commits, silent push failures and stray byte-order marks.
---

# Commit, push and open a PR on Windows

## Before committing

- Never commit on `main`; branch first (`git checkout -b <short-kebab-name>`).
- Run `npm run lint`, `npm test` and `npm run build:prod` from `app/` and report failures instead of committing over
  them. CI runs the same three.
- Stage by path (`git add -A app/src`), not `git add .`, and read `git status --short` before committing.
- Commit and PR style: a short imperative subject ("Modernize the outfit page"), a body that says what and why.

## Commit messages

Write the message with a quoted heredoc in **Bash**; it is the one reliable way:

```bash
git commit -F - <<'EOF'
Subject line

Body.
EOF
```

If the message itself contains a line that is just `EOF`, or an unbalanced quote breaks the command, write the
message to a file with the Write tool and use `git commit -F <file>`.

In **PowerShell** none of the stdin tricks work, and `git commit -F -` with a here-string commits *nothing* (git
reads `-` as a pathspec): no `<<<`, no `<<EOF`, no piping into `-F -`. Write the message to a file and pass
`-F <file>`.

When writing a file from PowerShell 5.1, `Set-Content -Encoding utf8` and `Out-File` add a byte-order mark. It lands
as an invisible character at the start of a commit subject or a PR body. Prefer the Write tool to create the file, or
use Bash. If the text has to come from PowerShell, write it with
`[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))`.

Check the commit happened: `git log --oneline -2`.

## Push

```
git push -u origin <branch>
```

Pushes have failed without any visible error in this environment, so verify before creating the PR:
`git ls-remote --heads origin <branch>` must print the branch. In PowerShell, wrap git in `cmd /c "git ... 2>&1"`:
git writes progress to stderr, which PowerShell 5.1 reports as an error. The "GitHub found N vulnerabilities" lines
in the output are about the default branch, not the change.

## Open the PR

`gh` is installed (winget `GitHub.cli`), but a shell started before the install won't have it on PATH. In PowerShell:

```
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
```

`gh auth status` must say logged in. A non-interactive session can't run the login flow; ask the user to run
`gh auth login` in a terminal.

Put the PR body in a file and pass `--body-file` (same byte-order-mark caveat); a long `--body` string is fragile
across shells:

```
gh pr create --base main --head <branch> --title "<title>" --body-file <file>
```

Body shape: a **Summary** of what changed and why. The command prints the PR URL; give it to the user. If it says there are no commits between `main` and the
branch, the commit or push didn't happen: go back and check.

## After

Report anything that wasn't verified. Line-ending warnings (`LF will be replaced by CRLF`) from git are harmless.
