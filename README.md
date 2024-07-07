# `next-action` - Generate a unique version number

GitHub custom action to generate a unique version number by appending a revision number, 
which increments sequentially higher than previous revisions in the Git tag list.

## Usage
```
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Get next version
    id: next-action
    uses: symless/actions/next-version@master
    with:
      current-version: 1.2.3

  - name: Print result
    run: echo "${{ steps.test.outputs.next-version }}"

  - name: Create release
    id: create_release
    uses: actions/create-release@v1
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    with:
      tag_name: ${{ steps.test.outputs.next-version }}
      release_name: ${{ steps.test.outputs.next-version }}
      commitish: master
      draft: false
      prerelease: true
```