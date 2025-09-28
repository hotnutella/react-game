import React, { useEffect, useRef, useCallback, createContext } from "react";
import { GameReconciler, setCurrentAdapter } from "../../reconciler";
import { CanvasAdapter } from "../../adapters/CanvasAdapter";
import type { RenderAdapter } from "../../adapters";
import {
  Layer,
  DEFAULT_LAYERS,
  type LayerType,
  type LayerProps,
} from "./Layer";

// Types
export interface GameProps {
  width: number;
  height: number;
  canvas?: HTMLCanvasElement;
}

export type UpdateCallback = (deltaTime: number) => void;

// Game loop context
interface GameLoopContext {
  addUpdateCallback: (callback: UpdateCallback) => () => void;
  deltaTime: number;
}

const GameLoopContext = createContext<GameLoopContext | null>(null);

export interface GameComponentProps extends Omit<GameProps, "canvas"> {
  children: React.ReactNode;
  adapter?: RenderAdapter;
  onMount?: (canvas: HTMLCanvasElement) => void;
  debug?: boolean; // Controls debug layer visibility
  layers?: Partial<Record<LayerType, Partial<LayerProps>>>; // Custom layer config
}

export function Game({
  width,
  height,
  children,
  adapter,
  onMount,
  debug = false,
  layers: customLayers,
}: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<any>(null);
  const adapterRef = useRef<RenderAdapter | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const updateCallbacksRef = useRef<Set<UpdateCallback>>(new Set());
  const deltaTimeRef = useRef<number>(0);

  // Initialize adapter and reconciler
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderAdapter = adapter || new CanvasAdapter();

    // Initialize the adapter
    renderAdapter.initialize(canvas, width, height);
    adapterRef.current = renderAdapter;
    setCurrentAdapter(renderAdapter);

    // Create a root game instance to serve as the container
    const rootGameInstance = {
      type: "game" as const,
      props: { width, height },
      children: [],
      adapter: renderAdapter,
    };

    // Create container and start reconciler
    const container = GameReconciler.createContainer(
      rootGameInstance,
      0,
      null,
      false,
      null,
      "",
      console.error,
      null
    );
    containerRef.current = container;

    // Start render loop
    const gameLoop = (currentTime: number) => {
      const deltaTime = lastTimeRef.current
        ? (currentTime - lastTimeRef.current) / 1000
        : 0;
      lastTimeRef.current = currentTime;
      deltaTimeRef.current = deltaTime;

      // Run update callbacks
      updateCallbacksRef.current.forEach((callback) => {
        callback(deltaTime);
      });

      // Render frame
      if (renderAdapter && (renderAdapter as any).render) {
        (renderAdapter as any).render();
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Call onMount callback
    if (onMount) {
      onMount(canvas);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderAdapter) {
        renderAdapter.destroy();
      }
    };
  }, [width, height, adapter, onMount]);

  const addUpdateCallback = useCallback((callback: UpdateCallback) => {
    updateCallbacksRef.current.add(callback);
    return () => {
      updateCallbacksRef.current.delete(callback);
    };
  }, []);

  // Create default layers with children
  const createLayersWithChildren = useCallback(
    (children: React.ReactNode) => {
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
          // Merge custom layer config with defaults
          const defaultConfig = DEFAULT_LAYERS[layerType];
          const customConfig = customLayers?.[layerType] || {};

          const layerProps: LayerProps = {
            name: layerType,
            zIndex: customConfig.zIndex ?? defaultConfig.zIndex,
            visible:
              (layerType === "debug" ? debug : true) &&
              (customConfig.visible ?? defaultConfig.visible),
            alpha: customConfig.alpha ?? 1.0,
          };

          // Put non-layer children in gameplay layer
          const layerChildren =
            layerType === "gameplay" ? nonLayerChildren : null;

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
    },
    [debug, customLayers]
  );

  // Update reconciler when children change
  useEffect(() => {
    if (containerRef.current) {
      const processedChildren = createLayersWithChildren(children);
      GameReconciler.updateContainer(
        React.createElement("game", { width, height }, processedChildren),
        containerRef.current,
        null,
        () => {}
      );
    }
  }, [children, width, height, createLayersWithChildren]);

  const contextValue: GameLoopContext = {
    addUpdateCallback,
    deltaTime: deltaTimeRef.current,
  };

  // Check if we're being used with the pure render function
  // If so, return game elements instead of canvas
  const processedChildren = createLayersWithChildren(children);

  // Create game element
  const gameElement = React.createElement(
    "game",
    { width, height },
    processedChildren
  );

  // For pure ReactGame render, return game elements (render function provides context)
  // For React DOM usage, return canvas element with context
  if (typeof window !== "undefined" && (window as any).__reactGameRender) {
    // Pure ReactGame render - return game elements (context provided by render function)
    return gameElement;
  } else {
    // React DOM usage - return canvas element with context
    return (
      <GameLoopContext.Provider value={contextValue}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ display: "block", imageRendering: "pixelated" }}
        />
      </GameLoopContext.Provider>
    );
  }
}

export { GameLoopContext };
