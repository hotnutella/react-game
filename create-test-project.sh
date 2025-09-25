#!/bin/bash

# Script to create a test project for ReactGame

echo "🎮 Creating ReactGame test project..."

# Create test directory
mkdir -p test-project
cd test-project

# Initialize package.json
cat > package.json << EOF
{
  "name": "react-game-test",
  "version": "1.0.0",
  "description": "Test project for ReactGame",
  "main": "index.js",
  "scripts": {
    "start": "webpack serve",
    "build": "webpack"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "html-webpack-plugin": "^5.5.0",
    "ts-loader": "^9.4.0"
  }
}
EOF

# Create webpack config
cat > webpack.config.js << EOF
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3001,
    hot: true,
  },
};
EOF

# Create TypeScript config
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# Create src directory and files
mkdir -p src

cat > src/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReactGame Test</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #222;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        canvas {
            border: 2px solid #444;
        }
    </style>
</head>
<body>
    <h1>ReactGame Test Project</h1>
    <div id="root"></div>
</body>
</html>
EOF

cat > src/index.tsx << EOF
import { useState } from "react";
import { render, Scene, Sprite, useGameLoop } from "../src/index";

function TestSprite() {
  const [x, setX] = useState(100);
  
  useGameLoop((deltaTime: number) => {
    setX(x => (x + 50 * deltaTime) % 700);
  });
  
  return <Sprite x={x} y={200} width={50} height={50} />;
}

function TestGame() {
  return (
    <Scene backgroundColor="#003366" width={800} height={400}>
      <TestSprite />
      <Sprite x={50} y={50} width={30} height={30} />
      <Sprite x={720} y={50} width={30} height={30} />
    </Scene>
  );
}

// Mount the game
const container = document.getElementById("root");
if (container) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  container.appendChild(canvas);
  
  render(<TestGame />, canvas);
}
EOF

echo "✅ Test project created!"
echo ""
echo "To run the test project:"
echo "1. cd test-project"
echo "2. npm install"
echo "3. npm start"
echo ""
echo "The test project will run on http://localhost:3001"
