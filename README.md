# ReactGame

A React renderer for game development - "React Native for games". ReactGame allows you to build games using familiar React patterns and JSX, but instead of rendering to the DOM, it renders to Canvas/WebGL.

## Features

- 🎮 **React-powered game development** - Use React components to control game objects
- 🔄 **Custom reconciler** - Built with `react-reconciler` for efficient updates
- 🎨 **Pluggable rendering** - Adapter pattern allows switching rendering engines
- 🎯 **Game loop integration** - Built-in game loop with React hooks
- 📦 **TypeScript support** - Fully typed for better development experience

## Quick Start

```bash
npm install react-game
```

```jsx
import { useState } from "react";
import { render, Scene, Sprite, useGameLoop } from "react-game";

function MovingSprite() {
  const [x, setX] = useState(100);

  useGameLoop((deltaTime) => {
    setX((x) => x + 50 * deltaTime); // Move 50 pixels per second
  });

  return <Sprite x={x} y={100} width={32} height={32} />;
}

function App() {
  return (
    <Scene backgroundColor="#001122">
      <MovingSprite />
    </Scene>
  );
}

// Pure ReactGame - no React DOM needed!
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

render(<App />, canvas);
```

## 🎯 Asset Management with Manifests

ReactGame includes built-in asset management with TypeScript support:

```bash
# Initialize manifest system
npx react-game init-manifests src/manifests

# Watch and auto-regenerate types
npx react-game watch-manifests src/manifests
```

```tsx
// Auto-generated typed hooks
import { useGameManifest } from "./src/manifests/manifestTypes";

function Player() {
  const { assets } = useGameManifest(); // Perfect TypeScript support!
  return <Sprite texture={assets.hero} x={100} y={100} />;
}
```

See [MANIFEST_GUIDE.md](./MANIFEST_GUIDE.md) for complete documentation.

## Core Components

### `<Game>`

The root component that creates the canvas and manages the game loop.

```jsx
<Game width={800} height={600}>
  {/* Your game content */}
</Game>
```

### `<Scene>`

Container for game objects with scene-level properties.

```jsx
<Scene backgroundColor="#001122" width={800} height={600}>
  {/* Sprites and other game objects */}
</Scene>
```

### `<Sprite>`

Renderable game object with position, size, and visual properties.

```jsx
<Sprite
  x={100}
  y={100}
  width={32}
  height={32}
  texture="path/to/image.png"
  rotation={Math.PI / 4}
  alpha={0.8}
  visible={true}
/>
```

## Hooks

### `useGameLoop(callback)`

Execute code every frame with delta time.

```jsx
useGameLoop((deltaTime) => {
  // Update logic here
  setPosition((pos) => ({ x: pos.x + speed * deltaTime, y: pos.y }));
});
```

### `useDeltaTime()`

Get the current frame's delta time.

```jsx
const deltaTime = useDeltaTime();
```

### `useUpdate(callback)`

Alias for `useGameLoop` - more semantic for component updates.

## Architecture

ReactGame is a **pure custom React renderer** - no React DOM required!

1. **Custom Reconciler**: Manages `<Scene>` and `<Sprite>` components directly
2. **Canvas Rendering**: All components render to Canvas/WebGL instead of DOM
3. **Pure React**: Use React patterns (JSX, hooks, state) without DOM overhead
4. **Game Loop Integration**: Built-in game loop with `useGameLoop` hook

This means:

- ✅ **No React DOM dependency** - truly independent renderer
- ✅ **Pure React patterns** - JSX, hooks, state, props
- ✅ **Direct Canvas rendering** - maximum performance
- ✅ **Game-optimized** - 60fps game loop built-in

### Usage Patterns

**Pure ReactGame (recommended):**

```jsx
import { render, Scene, Sprite } from "react-game";
render(
  <Scene>
    <Sprite x={100} y={100} />
  </Scene>,
  canvas
);
```

**In existing React apps:**

```jsx
import { Game, Scene, Sprite } from "react-game";
// Game component bridges to existing React DOM apps
<Game width={800} height={600}>
  <Scene>
    <Sprite x={100} y={100} />
  </Scene>
</Game>;
```

The adapter pattern allows you to swap rendering engines:

- `CanvasAdapter` - 2D Canvas rendering (included)
- Custom adapters for Three.js, PixiJS, or other engines

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run the demo
npm run demo
```

## Demo

The demo showcases:

- Moving sprite with collision detection
- Rotating sprite animation
- Pulsing sprite with scale changes
- Multiple sprites in a scene

## Rendering Adapters

### Canvas 2D (Built-in)

Basic 2D rendering using HTML5 Canvas.

### Custom Adapters

Implement the `RenderAdapter` interface to support other engines:

```typescript
interface RenderAdapter {
  initialize(canvas: HTMLCanvasElement, width: number, height: number): void;
  createSprite(props: SpriteProps): any;
  updateSprite(sprite: any, props: SpriteProps): void;
  // ... other methods
}
```

## License

This project is licensed under the Business Source License 1.1 (BUSL-1.1).

You may use ReactGame to build games and applications, including for commercial use.  
However, using it to create a competing game development framework, service, or platform is **not permitted**  
without purchasing a commercial license.

Please see [LICENSE](./LICENSE) for full details.

**Key Details:**

- **Licensor:** Hanows OÜ (maintained by Deniss Suhhanov)
- **Licensed Work:** The ReactGame Game Development Framework
- **Change Date:** September 27, 2032
- **Change License:** Apache-2.0

**Summary:**

- ✅ **Free for non-commercial and limited commercial use** — development, testing, internal projects, and commercial games are allowed
- 🚫 **Not allowed:** using ReactGame as the basis of a competing game framework, editor, SaaS, or dev tool
- 🔄 **License change:** After September 27, 2032, this project will be re-licensed under Apache-2.0
- 💼 **Commercial licensing** — Will be available closer to v1.0. For now, please respect the terms of the Additional Use Grant.

For full legal terms, please refer to the [LICENSE](./LICENSE) file.
