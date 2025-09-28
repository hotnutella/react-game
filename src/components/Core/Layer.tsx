import React from "react";

// Layer types - represents different rendering layers in the game
export type LayerType =
  | "background"
  | "gameplay"
  | "foreground"
  | "ui"
  | "debug";

export interface LayerProps {
  name: LayerType;
  zIndex?: number; // Override default zIndex
  visible?: boolean; // Default: true
  alpha?: number; // Default: 1.0
  children?: React.ReactNode;
}

// Default layer configuration
export const DEFAULT_LAYERS: Record<
  LayerType,
  { zIndex: number; visible: boolean }
> = {
  background: { zIndex: 0, visible: true },
  gameplay: { zIndex: 100, visible: true },
  foreground: { zIndex: 200, visible: true },
  ui: { zIndex: 300, visible: true },
  debug: { zIndex: 400, visible: false }, // Only visible when debug=true
};

// Layer component - manages rendering order and layer-specific properties
export function Layer({
  name,
  zIndex,
  visible = true,
  alpha = 1.0,
  children,
}: LayerProps): React.ReactElement {
  // Use default zIndex if not provided
  const finalZIndex = zIndex ?? DEFAULT_LAYERS[name].zIndex;
  const finalVisible = visible && DEFAULT_LAYERS[name].visible;

  return React.createElement(
    "layer",
    {
      name,
      zIndex: finalZIndex,
      visible: finalVisible,
      alpha,
    },
    children
  );
}
