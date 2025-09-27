import { useEffect, useContext, useRef } from "react";
import type { UpdateCallback } from "../components/Game";
import { GameLoopContext } from "../components/Game";

// Hook for game loop updates
export function useGameLoop(callback: UpdateCallback) {
  const context = useContext(GameLoopContext);
  const callbackRef = useRef(callback);

  // Update ref when callback changes, but don't re-register
  callbackRef.current = callback;

  useEffect(() => {
    if (!context) {
      console.warn("useGameLoop can only be used within a Game component");
      return;
    }

    // Create a stable wrapper that calls the current callback
    const stableCallback = (deltaTime: number) => {
      callbackRef.current(deltaTime);
    };

    return context.addUpdateCallback(stableCallback);
  }, [context]); // Only depend on context, not the callback
}
