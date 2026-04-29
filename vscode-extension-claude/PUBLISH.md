# Publish Checklist

Internal — not bundled in the .vsix.

## Pre-publish

- [ ] Smoke test (`SMOKE-TEST.md`) passes on at least Windows.
- [ ] `package.json` version bumped (semver).
- [ ] CHANGELOG entry added (if you keep one).
- [ ] `npm run sync-skills` run — `skills/` folder populated.

## Build .vsix

```bash
cd vscode-extension-claude
npx vsce package
```

Output: `flowstudio-mcp-claude-<version>.vsix`

## Publish to VS Code Marketplace

```bash
npx vsce publish -p $VSCE_PAT
```

(`VSCE_PAT` is the personal access token from dev.azure.com; same publisher as the existing extension.)

## Publish to Open VSX

```bash
npx ovsx publish flowstudio-mcp-claude-<version>.vsix -p $OVSX_PAT
```

(`OVSX_PAT` from open-vsx.org account settings.)

## Post-publish

- [ ] Verify listing on https://marketplace.visualstudio.com/items?itemName=flowstudio.flowstudio-mcp-claude
- [ ] Verify listing on https://open-vsx.org/extension/flowstudio/flowstudio-mcp-claude
- [ ] Update SUBMISSION-STATUS.md (separate repo).
- [ ] Update `learn.flowstudio.app` Claude Code page to lead with extension install (separate repo).
- [ ] Update `mcp.flowstudio.app` landing Claude Code card (separate repo).
- [ ] Tweet / LinkedIn post.
