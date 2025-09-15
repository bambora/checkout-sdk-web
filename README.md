# JavaScript SDK for Bambora Checkout

Provides the tools necessary for integrating Bambora Checkout with your website.

Currently, the following integrations are available:

- Full page redirect.
- Modal, as a full page overlay.
- Inline, as a component of a page.

**[Full documentation is available at the Bambora developer portal.](https://developer.bambora.com/europe/sdk/web-sdk)**

## Installation

**NPM:** `npm install @bambora/checkout-sdk-web`

**CDN:** <https://static.bambora.com/checkout-sdk-web/latest/checkout-sdk-web.min.js>

Minified and gzipped size is ~6 KB.

The CDN version contains a polyfill to support promises in IE 11.

The NPM package supports ESM.

**Browser support:**
All major browsers above version `N - 1`, where `N` is the most recent version.
For Internet Explorer, only version 11 is supported via Promise polyfill (only on CDN).
The NPM package does not include the polyfill.
We don't test other browsers, but bug reports and pull requests for bugs related to older versions or uncommon browsers are always welcome.

## Build

Requirements are _Node_ and _NPM_.

Clone the project, navigate to the project root, and run `npm run build` in your terminal.
This will install all dependencies and output all assets to the `dist`-folder.

It is also possible to set up a watcher for source files for changes by running `npm start`.

## Test

Run `npm test` in your terminal in the project root.

Run `npm run lint` for linting.

## Contributing

Create a pull request or an issue. Be sensible and respectful. Thanks.

### Main Developer Dependencies

| Purpose      | Dependencies                         |
| ------------ | ------------------------------------ |
| Language     | TypeScript                           |
| Bundling     | Rollup                               |
| Testing      | Web Test Runner, Mocha, Chai, Sinon  |
| Code quality | ESLint, Prettier                     |

## Continuous Integration and Delivery

Use `npm version` to bump the version and create a tagged commit as it ensures consistency.
