import React, { useContext } from "react";
import { ManifestContext } from "../../manifest/ManifestContext";

export interface SpriteProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  texture?: string; // Can be either a manifest key or a direct URL
  rotation?: number;
  alpha?: number;
  visible?: boolean;
}

// Sprite component
export function Sprite(props: SpriteProps) {
  const manifestManager = useContext(ManifestContext);

  // If we have a manifest manager and the texture looks like a key (no slash),
  // try to resolve it from loaded assets. Otherwise, use the texture as-is (URL).
  let resolvedTexture = props.texture;
  if (manifestManager && props.texture && !props.texture.includes("/")) {
    // This looks like a manifest key, try to resolve it
    const resolved = manifestManager.resolveTextureKey(props.texture);
    if (resolved) {
      resolvedTexture = resolved;
    }
    // If not resolved, pass through the key (might be loading or error)
  }
  // If texture contains a slash, treat it as a direct URL (from assets object or direct path)

  return React.createElement("sprite", {
    ...props,
    texture: resolvedTexture,
  });
}
