# Get the next version number in a Git repo

GitHub custom action to get the next version number with build number based on tags.

## Usage
```
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Get next version number
    id: version
    uses: symless/next-version-action
```