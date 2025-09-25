# Testing ReactGame Locally 🎮

You have several options to test ReactGame locally without publishing:

## 🚀 Option 1: Demo Server (Current)

```bash
npm run build    # Build the library
npm run demo     # Start demo at http://localhost:3000
```

**Status**: Should be running at http://localhost:3000

## 🔗 Option 2: npm link (Global Install)

```bash
# In react-game directory:
npm run build
npm link

# In your test project:
npm link react-game
```

## 📁 Option 3: Local File Path

```bash
# In your test project package.json:
{
  "dependencies": {
    "react-game": "file:../path/to/react-game"
  }
}
```

## 🎯 Option 4: Direct Import (Development) ⭐ RECOMMENDED

```jsx
// Import directly from source (what the demo uses):
import { render, Scene, Sprite, useGameLoop } from "../src/index";

// This works without any package installation or linking!
```

## 🧪 Option 5: Create Test Project

```bash
mkdir my-game-test
cd my-game-test
npm init -y
npm install react
# Copy react-game as dependency or use npm link
```

## 📦 Option 6: Use Yalc (Better than npm link)

```bash
# Install yalc globally
npm install -g yalc

# In react-game directory:
npm run build
yalc publish

# In your test project:
yalc add react-game
npm install
```

## ⚡ Quick Test HTML

Create a simple HTML file to test:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>ReactGame Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./dist/bundle.js"></script>
  </body>
</html>
```

## 🎮 Current Demo Features

- Moving sprite with collision detection
- Rotating sprite animation
- Pulsing sprite with scale changes
- Static corner sprites
- Canvas 2D rendering

**Next Steps:**

1. Open http://localhost:3000 to see the demo
2. Or use npm link to test in your own project
3. Modify demo/index.tsx to experiment with different features
