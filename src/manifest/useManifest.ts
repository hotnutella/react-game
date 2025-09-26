import { useContext, useEffect, useState } from 'react';
import { ManifestContext } from './ManifestContext';

// Generic manifest state where assets can be strongly typed
export interface ManifestState<TAssets = Record<string, string>> {
  assets: TAssets;
  loading: boolean;
  error: Error | null;
  progress: {
    loaded: number;
    total: number;
    percentage: number;
  };
}

export interface Manifest {
  textures: Record<string, string>; // key -> asset path
  metadata?: {
    version?: string;
    name?: string;
    description?: string;
  };
}

// Generic useManifest hook that can be typed based on the manifest
export function useManifest<TAssets = Record<string, string>>(
  manifestPath: string
): ManifestState<TAssets> {
  const manager = useContext(ManifestContext);
  
  if (!manager) {
    throw new Error('useManifest must be used within a Scene component');
  }

  const [state, setState] = useState<ManifestState<TAssets>>(() => {
    const managerState = manager.getState(manifestPath);
    return managerState ? {
      ...managerState,
      assets: managerState.assets as TAssets
    } : {
      assets: {} as TAssets,
      loading: true,
      error: null,
      progress: { loaded: 0, total: 0, percentage: 0 }
    };
  });

  useEffect(() => {
    const unsubscribe = manager.subscribe(manifestPath, (managerState) => {
      setState({
        ...managerState,
        assets: managerState.assets as TAssets
      });
    });
    
    // Start loading the manifest if not already loaded
    manager.loadManifest(manifestPath);
    
    return unsubscribe;
  }, [manifestPath, manager]);

  return state;
}
