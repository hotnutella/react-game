import { useContext } from "react";
import { GameLoopContext } from "../components/Core/Game";

// Hook to get current delta time
export function useDeltaTime(): number {
  const context = useContext(GameLoopContext);
  return context?.deltaTime || 0;
}
