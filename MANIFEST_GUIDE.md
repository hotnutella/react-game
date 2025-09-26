# 🎮 ReactGame Manifest System

ReactGame includes a powerful built-in manifest system for managing game assets with TypeScript support and auto-generated hooks.

## 🚀 Quick Start

### 1. Initialize Manifest System

```bash
# In your game project
npx react-game init-manifests src/manifests
```

This creates:

- `src/manifests/` directory
- `game_manifest.json` example file
- Auto-generated `manifestTypes.ts` with typed hooks

### 2. Edit Your Manifest

```json
// src/manifests/game_manifest.json
{
  "textures": {
    "hero": "/assets/hero.png",
    "enemy": "/assets/enemy.png",
    "background": "/assets/background.jpg",
    "powerup": "/assets/powerup.gif"
  },
  "metadata": {
    "version": "1.0.0",
    "name": "Game Assets"
  }
}
```

### 3. Use Auto-Generated Hooks

```tsx
import { useGameManifest } from "./src/manifests/manifestTypes";

function Player() {
  const { assets, loading } = useGameManifest();

  if (loading) return <div>Loading...</div>;

  return <Sprite texture={assets.hero} x={100} y={100} />;
}
```

## 📋 CLI Commands

### Generate Types (One-time)

```bash
npx react-game generate-types src/manifests
```

### Watch Mode (Development)

```bash
npx react-game watch-manifests src/manifests
```

Automatically regenerates types when you edit manifests.

### Initialize New Project

```bash
npx react-game init-manifests [directory]
```

## 🎯 Multiple Manifests

Create separate manifests for different asset categories:

```bash
src/manifests/
├── game_manifest.json      # Main game assets
├── ui_manifest.json        # UI elements
├── level1_manifest.json    # Level-specific assets
└── manifestTypes.ts        # Auto-generated
```

Each manifest gets its own typed hook:

- `game_manifest.json` → `useGameManifest()`
- `ui_manifest.json` → `useUiManifest()`
- `level1_manifest.json` → `useLevel1Manifest()`

## 🔧 Integration with Build Tools

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "react-game watch-manifests src/manifests & your-dev-server",
    "build": "react-game generate-types src/manifests && your-build-script"
  }
}
```

### Webpack Integration

Add to your webpack config:

```javascript
module.exports = {
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "src/manifests"),
        publicPath: "/manifests",
      },
    ],
  },
};
```

## ✨ Features

- **🎣 Custom Hooks**: Auto-generated `useGameManifest()`, `useUiManifest()`, etc.
- **🔥 TypeScript**: Perfect IntelliSense for all asset names
- **👀 Watch Mode**: Types update automatically when manifests change
- **📦 Zero Config**: Works out of the box with any ReactGame project
- **🌟 Multiple Manifests**: Organize assets by category/level/feature

## 🎮 Complete Example

```tsx
// src/manifests/game_manifest.json
{
  "textures": {
    "player": "/assets/player.png",
    "enemy": "/assets/enemy.png"
  }
}

// src/Game.tsx
import { Scene, Sprite } from 'react-game';
import { useGameManifest } from './manifests/manifestTypes';

function Game() {
  const { assets, loading, error } = useGameManifest();

  if (loading) return <div>Loading assets...</div>;
  if (error) return <div>Error loading assets</div>;

  return (
    <Scene>
      <Sprite texture={assets.player} x={100} y={100} />
      <Sprite texture={assets.enemy} x={200} y={100} />
    </Scene>
  );
}
```

## 🔄 Development Workflow

1. **Start Development**: `npx react-game watch-manifests src/manifests`
2. **Edit Manifests**: Add/remove assets in JSON files
3. **Types Auto-Update**: `manifestTypes.ts` regenerates instantly
4. **Use with IntelliSense**: `assets.` shows perfect autocomplete
5. **Build for Production**: `npx react-game generate-types src/manifests`

## 🌟 Why Use ReactGame Manifests?

- **No Manual Work**: Types generate automatically from JSON
- **Perfect IntelliSense**: Never misspell asset names again
- **Organized Assets**: Group by feature, level, or category
- **Zero Setup**: Works immediately in any ReactGame project
- **Performance**: Preloading and caching built-in
