# Upgrading Guide

## Upgrading from 0.1.x to 0.2.0

### Node.js Version Requirement

Version 0.2.0 drops support for Node.js 18. You must upgrade to Node.js 20 or newer in your development, CI and production environments.

### @ably/chat Dependency

This release updates the peer dependency to `@ably/chat` 1.0.0. If you're managing the `@ably/chat` package separately, ensure you update it to version 1.0.0 or later:

```bash
npm install @ably/chat@^1.0.0
```
