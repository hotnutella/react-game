import React, { useEffect, useRef, useCallback, createContext } from "react";
import { GameReconciler, setCurrentAdapter } from "../../reconciler";
import { CanvasAdapter } from "../../adapters/CanvasAdapter";
import type { RenderAdapter } from "../../adapters";

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
}

export function Game({
  width,
  height,
  children,
  adapter,
  onMount,
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

  // Update reconciler when children change
  useEffect(() => {
    if (containerRef.current) {
      GameReconciler.updateContainer(
        React.createElement("game", { width, height }, children),
        containerRef.current,
        null,
        () => {}
      );
    }
  }, [children, width, height]);

  const addUpdateCallback = useCallback((callback: UpdateCallback) => {
    updateCallbacksRef.current.add(callback);
    return () => {
      updateCallbacksRef.current.delete(callback);
    };
  }, []);

  const contextValue: GameLoopContext = {
    addUpdateCallback,
    deltaTime: deltaTimeRef.current,
  };

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

export { GameLoopContext };
