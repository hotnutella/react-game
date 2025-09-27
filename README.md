# ReactGame

**React Native for games** - Build games using React components that render directly to Canvas instead of DOM.

## What is ReactGame?

ReactGame is a custom React renderer that lets you build games using familiar React patterns (JSX, hooks, state) but renders to Canvas/WebGL instead of the DOM. Think React Native, but for games.

```jsx
import { render, Scene, Sprite, useGameLoop } from "react-game";

function Game() {
  const [x, setX] = useState(0);

  useGameLoop((deltaTime) => {
    setX((x) => x + 100 * deltaTime); // Move 100 pixels/second
  });

  return (
    <Scene backgroundColor="#001122">
      <Sprite x={x} y={100} width={32} height={32} />
    </Scene>
  );
}

// Render to canvas - no React DOM needed!
const canvas = document.createElement("canvas");
render(<Game />, canvas);
```

## Getting Started

### 1. Install

```bash
npm install react-game
```

### 2. Create your first game

```jsx
import { useState } from "react";
import { render, Scene, Sprite, Animation, Easing } from "react-game";

function MovingSprite() {
  return (
    <Animation
      from={{ x: 50, y: 100 }}
      to={{ x: 400, y: 100 }}
      duration={2}
      loop={true}
      reverse={true}
      easing={Easing.easeInOutQuad}
    >
      <Sprite width={40} height={40} />
    </Animation>
  );
}

function App() {
  return (
    <Scene backgroundColor="#001122" width={800} height={600}>
      <MovingSprite />
    </Scene>
  );
}

// Mount to canvas
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

render(<App />, canvas);
```

### 3. Try the demo

```bash
git clone https://github.com/hotnutella/react-game
cd react-game
npm install
npm run demo
```

## Core Features

- **🎮 Pure React for games** - Use JSX, hooks, and state to build games
- **🚀 No DOM overhead** - Direct Canvas rendering for 60fps performance
- **🎨 Built-in animations** - Smooth animations with easing functions
- **📦 TypeScript support** - Fully typed API with asset management
- **🔧 Extensible** - Pluggable rendering adapters (Canvas, WebGL, etc.)

## Key Components

| Component     | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `<Scene>`     | Root container with background and dimensions   |
| `<Sprite>`    | Visual game object with position, size, texture |
| `<Animation>` | Animate any sprite properties over time         |

## Essential Hooks

| Hook                    | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `useGameLoop(callback)` | Execute code every frame with delta time    |
| `useManifest()`         | Load and manage game assets with TypeScript |

## Why ReactGame?

**Traditional game development:**

```javascript
// Imperative, hard to manage state
sprite.x += velocity * deltaTime;
if (sprite.x > boundary) {
  sprite.visible = false;
}
```

**ReactGame:**

```jsx
// Declarative, React manages state
function Bullet({ x, visible }) {
  return <Sprite x={x} y={50} visible={visible} />;
}
```

ReactGame brings React's declarative, component-based architecture to game development, making complex game state management much simpler.

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
