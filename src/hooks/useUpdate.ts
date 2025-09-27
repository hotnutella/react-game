import type { UpdateCallback } from "../components/Game";
import { useGameLoop } from "./useGameLoop";

// Hook for component updates (similar to useGameLoop but more semantic)
export function useUpdate(callback: UpdateCallback) {
  useGameLoop(callback);
}
