# JavaScript SDK for Bambora Checkout

Provides the tools necessary for integrating Bambora Checkout with your website.

Currently, the following integrations are available:

- Full page redirect.
- Modal, as a full page overlay.
- Inline, as a component of a page.

**[Full documentation is available at the Bambora developer portal.](https://developer.bambora.com/europe/checkout/web-sdk)**

## Installation

**NPM:** `npm install @bambora/checkout-sdk-web`

**CDN:** <https://static.bambora.com/checkout-sdk-web/latest/checkout-sdk-web.min.js>

Minified and gzipped size is ~5.5 KB.

The NPM package supports ESM.

**Browser support:**
All major browsers above version `N - 1`, where `N` is the most recent version.
For Internet Explorer, only version 11 is supported.
We don't test other browsers, but bug reports and pull requests for bugs related to older versions or uncommon browsers are always welcome.

## Build

Requirements are _Node_ and _NPM_.

Clone the project, navigate to the project root, and run `npm run build` in your terminal.
This will install all dependencies and output all assets to the `dist`-folder.

It is also possible to set up a watcher for source files for changes by running `npm start`.

Alternatively, run Docker containers as specified in the `Makefile` in the repository root.

## Test

Run `npm test` in your terminal in the project root.
You can also run the watcher via `npm run test:watch`.
It watches all source and test files for changes.

Run `npm run lint` for linting.

## Contributing

Create a pull request or an issue. Be sensible and respectful. Thanks.

### Main Developer Dependencies

| Purpose      | Dependencies                         |
| ------------ | ------------------------------------ |
| Language     | TypeScript                           |
| Bundling     | Rollup                               |
| Testing      | Karma, Mocha, Chai, Sinon, Puppeteer |
| Code quality | TSLint, Prettier                     |

Additionally, a pre-commit hook has been set up with the following steps:

1. Run Prettier on all staged files.
2. Run TSLint with autofixer on all staged files.
3. Add files to git.
4. Run all tests.

The commit will abort if any of the steps fail. Please fix any problems before committing.

Run `git commit --no-verify` to override.

## Continuous Integration and Delivery

CI/CD is done by Jenkins by reading the Jenkinsfile. The pipeline goes through 5 steps:

1. Build.
2. Test.
3. Publish to Bambora CDN (files are uploaded to S3).
4. Invalidate Bambora CDN Cache (the cache on CloudFront is invalidated).
5. Publish to public NPM.

This will be run on the master branch only.
Steps 3-5 will be run on tagged commits only.

Use `npm version` to bump the version and create a tagged commit as it ensures consistency.