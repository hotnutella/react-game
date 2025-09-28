import React from 'react';
import { GameReconciler, setCurrentAdapter } from './reconciler';
import { CanvasAdapter } from './adapters/CanvasAdapter';
import type { UpdateCallback } from './components/Core/Game';
import { GameLoopContext } from './components';

export { Game, Scene, Sprite, Animation, Interactive, GameLoopContext, Easing } from './components';
export type { GameProps, SceneProps, SpriteProps, AnimationProps, AnimatableProps, EasingFunction, AnimationControls, UpdateCallback, InteractiveProps, InteractiveEventHandlers } from './components';
export { useGameLoop, useDeltaTime, useUpdate, useKeyboard, useMouse, MouseButtons } from './hooks';
export type { KeyboardState, MouseState, MousePosition, MouseMovement, DragEvent } from './hooks';
export { useManifest, withManifestProvider } from './manifest';
export type { Manifest, ManifestState } from './manifest';

// Adapters
export { CanvasAdapter } from './adapters/CanvasAdapter';
export type { RenderAdapter } from './adapters';

// Reconciler (for advanced usage)
export { GameReconciler, setCurrentAdapter, getCurrentCanvas, getComponentAtPosition } from './reconciler';
export type { GameObject } from './reconciler';

// Shared types
export type { Vector2, GameLoopCallback } from './shared/types';


// Global state for the game loop
let gameLoopCallbacks = new Set<UpdateCallback>();
let currentDeltaTime = 0;
let animationFrame: number | null = null;


// Pure ReactGame render function - replaces ReactDOM.render
export function render(element: React.ReactElement, canvas: HTMLCanvasElement) {
  // Initialize adapter
  const adapter = new CanvasAdapter();
  adapter.initialize(canvas, canvas.width, canvas.height);
  setCurrentAdapter(adapter);
  
  // Create game context that provides useGameLoop functionality
  const gameContext = {
    addUpdateCallback: (callback: UpdateCallback) => {
      console.log('Adding update callback to game loop');
      gameLoopCallbacks.add(callback);
      return () => {
        console.log('Removing update callback from game loop');
        gameLoopCallbacks.delete(callback);
      };
    },
    get deltaTime() {
      return currentDeltaTime;
    },
  };
  
  // Wrap element with context provider
  const wrappedElement = React.createElement(
    GameLoopContext.Provider,
    { value: gameContext },
    element
  );
  
  // Create a root game instance to serve as the container
  const rootGameInstance = {
    type: 'game' as const,
    props: { width: canvas.width, height: canvas.height },
    children: [],
    adapter: adapter,
  };
  
  // Create reconciler container  
  const container = GameReconciler.createContainer(
    rootGameInstance, // Use the game instance as the root container
    0,
    null,
    false,
    null,
    '',
    console.error,
    null
  );
  
  // Start game loop
  if (!animationFrame) {
    const cleanup = startGameLoop(adapter);
    
    // Store cleanup function for potential future use
    (window as any).__reactGameCleanup = cleanup;
  }
  
  // Render the element
  console.log('About to render element with reconciler...');
  GameReconciler.updateContainer(wrappedElement, container, null, () => {
    console.log('ReactGame: Rendered successfully');
  });
  console.log('Reconciler update completed');
  
  return container;
}

function startGameLoop(adapter: CanvasAdapter) {
  let lastTime = 0;
  let isRunning = true;
  let frameCount = 0;
  const targetFPS = 30; // Reduce to 30 FPS for now
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;
  let debugCounter = 0;
  
  console.log('Starting game loop...');
  
  function gameLoop(currentTime: number) {
    if (!isRunning) {
      console.log('Game loop stopped');
      return;
    }
    
    // Throttle to target FPS
    if (currentTime - lastFrameTime < frameInterval) {
      animationFrame = requestAnimationFrame(gameLoop);
      return;
    }
    
    const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
    lastTime = currentTime;
    lastFrameTime = currentTime;
    currentDeltaTime = deltaTime;
    frameCount++;
    debugCounter++;
    
    // Debug logging every 30 frames
    if (debugCounter % 30 === 0) {
      console.log(`Frame ${frameCount}, Delta: ${deltaTime.toFixed(3)}s, Callbacks: ${gameLoopCallbacks.size}`);
    }
    
    // Limit update callbacks to reasonable frequency
    let hasUpdates = false;
    if (gameLoopCallbacks.size > 0) {
      if (debugCounter % 30 === 0) {
        console.log(`Running ${gameLoopCallbacks.size} game loop callbacks`);
      }
      gameLoopCallbacks.forEach(callback => {
        try {
          callback(deltaTime);
          hasUpdates = true;
        } catch (error) {
          console.error('Error in game loop callback:', error);
        }
      });
    } else if (debugCounter % 30 === 0) {
      console.log('No game loop callbacks registered');
    }
    
    // Render every frame for now to see if that's the issue
    try {
      adapter.render();
    } catch (error) {
      console.error('Error in render:', error);
      isRunning = false; // Stop if render fails
      return;
    }
    
    // Give browser more breathing room
    if (frameCount % 60 === 0) { // Every 2 seconds at 30fps
      setTimeout(() => {
        if (isRunning) {
          animationFrame = requestAnimationFrame(gameLoop);
        }
      }, 5); // 5ms break
    } else {
      animationFrame = requestAnimationFrame(gameLoop);
    }
  }
  
  // Clean up any existing animation frame
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  animationFrame = requestAnimationFrame(gameLoop);
  
  // Return cleanup function
  return () => {
    isRunning = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };
}
