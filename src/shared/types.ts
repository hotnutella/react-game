// Shared types used across multiple parts of the codebase
export interface Vector2 {
  x: number;
  y: number;
}

// Game loop related types
export type GameLoopCallback = (deltaTime: number) => void;
