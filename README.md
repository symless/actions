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

Conditionally skipping matrix entries in GitHub Actions is tedious — you'd need to add a skip step
before each action in the job. This action solves that by filtering the matrix up front, so you can
for example, use a workflow dispatch input to run only a single target. This action lets you define
your matrix once in a YAML file exactly how you would in the workflow.

This is useful when QA or another department needs a specific platform build and running the full
matrix is expensive. It's less relevant for open source projects where runners are free and there's
no QA department.

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
