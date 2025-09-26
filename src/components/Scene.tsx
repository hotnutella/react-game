import React from "react";
import { ManifestProvider } from "../manifest/ManifestContext";

export interface SceneProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

// Scene component with built-in ManifestProvider
export function Scene({
  width,
  height,
  backgroundColor,
  children,
}: SceneProps & { children?: React.ReactNode }): React.ReactElement {
  return React.createElement(
    ManifestProvider,
    null,
    React.createElement("scene", { width, height, backgroundColor }, children)
  );
}
