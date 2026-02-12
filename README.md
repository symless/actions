# GitHub actions for Symless

## [pr-merge-comment](pr-merge-comment)

Comment on the PR related to the head SHA. Passes the version arg to the comment as well as the
workflow run status.

```yaml
- name: Comment on merged PR
  uses: symless/actions/pr-merge-comment@v1
  with:
    version: ${{ steps.get-version.outputs.version }}
```

## [setup-matrix](setup-matrix)

Load a YAML matrix file and optionally filter to a single target. Validates that the file exists,
has a non-empty `target` array, and each entry has `name` and `runs-on`.

```yaml
- name: Setup matrix
  id: setup-matrix
  uses: symless/actions/setup-matrix@v1
  with:
    file: .github/matrix.yml # default
    target: ubuntu-24.04-x86_64 # optional, filters to one target
```
