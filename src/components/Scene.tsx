import React from "react";

export interface SceneProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

// Scene component
export function Scene({
  width,
  height,
  backgroundColor,
  children,
}: SceneProps & { children?: React.ReactNode }) {
  return React.createElement(
    "scene",
    { width, height, backgroundColor },
    children
  );
}
