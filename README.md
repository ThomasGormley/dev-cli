# dev-cli 🛠
Development toolbox with common utilities and script

## Changesets
This package uses the [changesets](https://github.com/changesets/) package to handle versioning and changelogs.

To create a new changeset, run `npx changeset` and follow the prompts. This will create a new changeset file in the `changesets` directory.

To release a new version, run `npx changeset version`. This will bump the version in the `package.json` file and create a pull request with all of the changeset files since the last release. Once the PR is merged, the new version will be published to npm.

## New PRs