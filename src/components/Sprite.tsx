import React from "react";

export interface SpriteProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  texture?: string;
  rotation?: number;
  alpha?: number;
  visible?: boolean;
}

// Sprite component
export function Sprite(props: SpriteProps) {
  return React.createElement("sprite", props);
}
