import { useManifest as useManifestImpl } from './useManifest';

// Utility types for generating strongly-typed manifest assets

// Helper to extract asset keys from a manifest type
export type AssetKeys<T extends Record<string, any>> = T extends { textures: infer U } 
  ? U extends Record<string, any> 
    ? keyof U 
    : never
  : never;

// Transform manifest textures into assets object type
export type AssetsFromManifest<T extends Record<string, any>> = T extends { textures: infer U }
  ? U extends Record<string, any>
    ? { [K in keyof U]: string }
    : Record<string, string>
  : Record<string, string>;

// Create a strongly-typed useManifest hook for a specific manifest
export function createTypedManifest<TManifest extends { textures: Record<string, string> }>() {
  return {
    useManifest: <T extends string>(manifestPath: T) => {
      return useManifestImpl<AssetsFromManifest<TManifest>>(manifestPath);
    }
  };
}

// Example usage pattern for strongly-typed manifests:
// 
// 1. Define your manifest type:
//    interface GameManifest {
//      textures: {
//        hero: string;
//        enemy: string;
//        background: string;
//      };
//    }
//
// 2. Create typed hook:
//    const { useManifest } = createTypedManifest<GameManifest>();
//
// 3. Use with IntelliSense:
//    const { assets } = useManifest('/assets/manifest.json');
//    // assets.hero, assets.enemy, assets.background all have IntelliSense!
