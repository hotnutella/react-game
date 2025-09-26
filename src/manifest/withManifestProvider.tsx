import React from "react";
import { ManifestProvider } from "./ManifestContext";

/**
 * Higher-Order Component that wraps a component with ManifestProvider
 * This gives the component and its children access to the manifest system
 */
export function withManifestProvider<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    return React.createElement(
      ManifestProvider,
      null,
      React.createElement(Component, props)
    );
  };

  // Preserve component name for debugging
  WrappedComponent.displayName = `withManifestProvider(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}
