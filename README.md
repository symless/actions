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
