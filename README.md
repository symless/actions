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

Load a YAML matrix file and optionally filter to a single target. GitHub Actions has `fromJSON()`
but no `fromYAML()`, so this action converts the YAML to JSON. It also validates that the file
exists, has a non-empty `target` array, and each entry has `name` and `runs-on`.

```yaml
# .github/matrix.yml
target:
  - name: ubuntu-24.04-x86_64
    runs-on: ubuntu-24.04
  - name: macos-15-arm64
    runs-on: macos-15
```

```yaml
jobs:
  setup-matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.setup-matrix.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - uses: symless/actions/setup-matrix@v1
        id: setup-matrix
        with:
          file: .github/matrix.yml # default
          target: ubuntu-24.04-x86_64 # optional, filters to one target

  build:
    needs: setup-matrix
    strategy:
      matrix: ${{ fromJSON(needs.setup-matrix.outputs.matrix) }}
    runs-on: ${{ matrix.target.runs-on }}
    steps:
      - run: echo "${{ matrix.target.name }}"
```
