# Contributing To Ably Chat React UI Kit

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Ensure you have added suitable tests and the test suite is passing(`npm test`)
5. Push the branch (`git push origin my-new-feature`)
6. Create a new Pull Request

## Validate website doc snippets

To validate that the web documentation code snippets are accurate and up-to-date with the SDK source code, run the following prompt against a locally cloned copy of the [ably/docs](https://github.com/ably/docs) repository and this SDK repository.

> [!IMPORTANT]
> This prompt should be run with the most powerful LLM available to you (e.g. Claude Opus, GPT-5, etc.) for the best results.

Replace `{DOCS_PATH}` with the path to your local clone of the [ably/docs](https://github.com/ably/docs) repository and `{SDK_PATH}` with the path to your local clone of this SDK repository.

```text
Verify all `react` annotated code snippets in `.mdx` files located at `{DOCS_PATH}/src/pages/docs/chat/react-ui-kit` against the `ably-chat-react-ui-kit` source code repository at `{SDK_PATH}`. Additionally, validate the file `{DOCS_PATH}/src/pages/docs/chat/getting-started/react-ui-kit.mdx` against the same `ably-chat-react-ui-kit` repository.

### Verification Steps:

1. **Find all code snippets**: Search for all code blocks with the `react` annotation in `.mdx` files.

2. **Understand SDK structure**: Analyze the SDK source code to understand:
   - Public React components and their props
   - Public React hooks and their signatures (parameters, return types)
   - Public context providers and their usage
   - Exported types and interfaces
   - Namespaces and import requirements

3. **Cross-check each snippet** for the following issues:
   - **Syntax errors**: Incorrect hook calls, missing or extra arguments, mismatched JSX tags, incorrect destructuring
   - **Naming conventions**: Verify casing matches React conventions (e.g., `PascalCase` for components, `camelCase` for hooks and props, `use` prefix for hooks)
   - **API accuracy**: Verify hook names, component names, prop names, and return values exist in the SDK
   - **Type correctness**: Verify correct types are used (e.g., correct option keys, callback signatures)
   - **Namespace/import requirements**: Note any required imports that are missing from examples
   - **Wrong language**: Detect if code from another language was accidentally used

4. **Generate a verification report** with:
   - Total snippets found
   - List of issues found with:
     - File path and line number
     - Current (incorrect) code
     - Expected (correct) code
     - Source reference in SDK
   - List of verified APIs that are correct
   - Success rate percentage
   - Recommendations for fixes

### Output Format:
Create/update a markdown report file at `chat_react_ui_kit_api_verification_report.md` with all findings.
```

## Release Process

1. Make sure the tests are passing in CI for main.
2. Add a new commit using Semantic Versioning rules.
   1. [Semantic Versioning guidelines](https://semver.org/) entail a format of M.m.p, for example 1.2.3, where:
      - The first number represents a major release, which lets users know a breaking change has occurred that will require action from them.
      - The second number represents a minor release, which lets users know new functionality or features have been added.
      - The third number represents a patch release, which represents bug-fixes and may be used when no action should be required from users.
   2. The commit should update `package.json` and `package-lock.json`. Running `npm install` after changing `package.json` will update `package-lock.json`.
   3. You must also set the `version` field in `src/index.ts` file to match the new version.
   4. Update the `CHANGELOG.md` with any customer-affecting changes since the last release.
   5. Update the README.md for any references to the new version.
   6. If making breaking changes, add steps to upgrade to the `UPGRADING.md`.
3. Merge the commit into main.
4. Tag a release using [GitHub releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release). The version needs to match the one from the commit. Use the "Generate release notes" button to add changelog notes and update as required.
5. Ensure that the NPM Publish action has run successfully.
6. If you've deprecated any public components or hooks, changed public interfaces, or are uncertain about the impact of your updates, run the [Validate website doc snippets](#validate-website-doc-snippets) task locally. This will verify that the `react` code snippets in the web documentation (https://github.com/ably/docs) are accurate and aligned with the current SDK source. Review the generated report and address any issues it identifies.
7. Create a PR on the [website docs](https://github.com/ably/docs) that updates the SDK version in the setup/installation guide. Additionally, include fixes for any documentation issues identified in the previous step. Even if there are no public API changes, a PR must still be created to update the SDK version.
8. Merge any [website docs](https://github.com/ably/docs) PRs related to the changes.

## Development Setup

To get started with development:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ably/ably-chat-react-ui-kit.git
   cd ably-chat-react-ui-kit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```