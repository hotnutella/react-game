# ReactGame CLI Usage

When ReactGame is installed as a package, users can run:

```bash
# Initialize manifest system
npx react-game init-manifests src/manifests

# Generate types once
npx react-game generate-types src/manifests

# Watch and auto-regenerate
npx react-game watch-manifests src/manifests
```

This makes the manifest system available to any ReactGame project out of the box!

## Files included in package:

- `bin/react-game` - CLI entry point
- `src/cli/index.ts` - Main CLI logic
- `src/cli/generate-consolidated-types.js` - Type generator
- `src/cli/watch-manifests.js` - File watcher

## Package.json includes:

```json
{
  "bin": {
    "react-game": "./bin/react-game"
  }
}
```

This allows `npx react-game` to work from any project that installs ReactGame.
