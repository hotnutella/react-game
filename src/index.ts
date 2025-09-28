import React from 'react';
import { GameReconciler, setCurrentAdapter } from './reconciler';
import { CanvasAdapter } from './adapters/CanvasAdapter';
import type { UpdateCallback } from './components/Core/Game';
import { GameLoopContext } from './components';
import { Layer, DEFAULT_LAYERS, type LayerType, type LayerProps } from './components/Core/Layer';

export { Game, Layer, Scene, Sprite, Animation, Interactive, GameLoopContext, Easing, DEFAULT_LAYERS } from './components';
export type { GameProps, GameComponentProps, LayerProps, LayerType, SceneProps, SpriteProps, AnimationProps, AnimatableProps, EasingFunction, AnimationControls, UpdateCallback, InteractiveProps, InteractiveEventHandlers } from './components';
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


// Function to auto-create layers if not present
function createLayersWithChildren(children: React.ReactNode, debug: boolean = false): React.ReactNode {
  // Check if children already contain Layer components
  const childrenArray = React.Children.toArray(children);
  const layerChildren = childrenArray.filter(
    (child) => React.isValidElement(child) && child.type === Layer
  );
  const nonLayerChildren = childrenArray.filter(
    (child) => !(React.isValidElement(child) && child.type === Layer)
  );

  // If all children are already in layers, return as-is
  if (layerChildren.length === childrenArray.length) {
    return children;
  }

  // If we have non-layer children, we need to create auto-layers
  if (nonLayerChildren.length > 0) {

    // Auto-create layers and put non-layer children in gameplay layer
    const layers: LayerType[] = [
      "background",
      "gameplay", 
      "foreground",
      "ui",
    ];
    if (debug) {
      layers.push("debug");
    }

    const autoLayers = layers.map((layerType) => {
      const defaultConfig = DEFAULT_LAYERS[layerType];
      
      const layerProps: LayerProps = {
        name: layerType,
        zIndex: defaultConfig.zIndex,
        visible: (layerType === "debug" ? debug : true) && defaultConfig.visible,
        alpha: 1.0,
      };

      // Put non-layer children in gameplay layer
      const layerChildren = layerType === "gameplay" ? nonLayerChildren : null;

      return React.createElement(
        Layer,
        { key: layerType, ...layerProps },
        layerChildren
      );
    });

    // Combine auto-layers with existing layer children
    return [...layerChildren, ...autoLayers];
  }

  // If no non-layer children, return existing layer children
  return layerChildren;
}

// Pure ReactGame render function - replaces ReactDOM.render
export function render(element: React.ReactElement, canvas: HTMLCanvasElement, options?: { debug?: boolean }) {
  // Set flag to indicate we're using pure ReactGame render
  if (typeof window !== 'undefined') {
    (window as any).__reactGameRender = true;
  }
  
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
  
  // Process children to add layers if needed
  const processedChildren = createLayersWithChildren(element, options?.debug || false);
  
  // Create the game element with context
  const gameElement = React.createElement("game", { width: canvas.width, height: canvas.height }, processedChildren);
  
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
  
  // Always start game loop for pure ReactGame render
  // The Game component's game loop only works in React DOM mode
  if (!animationFrame) {
    const cleanup = startGameLoop(adapter);
    
    // Store cleanup function for potential future use
    (window as any).__reactGameCleanup = cleanup;
  }
  
  // Wrap element with context provider
  const wrappedElement = React.createElement(
    GameLoopContext.Provider,
    { value: gameContext },
    gameElement
  );
  
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
