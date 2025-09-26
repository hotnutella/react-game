import type { ManifestState, Manifest } from './useManifest';

type StateUpdater = (state: ManifestState) => void;

export class ManifestManager {
  private manifests = new Map<string, ManifestState>();
  private subscribers = new Map<string, Set<StateUpdater>>();
  private loadingPromises = new Map<string, Promise<void>>();

  getState(manifestPath: string): ManifestState | null {
    return this.manifests.get(manifestPath) || null;
  }

  // Resolve a texture key to its asset path from any loaded manifest
  resolveTextureKey(key: string): string | null {
    for (const [manifestPath, state] of this.manifests) {
      if (!state.loading && !state.error && state.assets[key]) {
        return state.assets[key];
      }
    }
    return null;
  }

  subscribe(manifestPath: string, updater: StateUpdater): () => void {
    if (!this.subscribers.has(manifestPath)) {
      this.subscribers.set(manifestPath, new Set());
    }
    
    this.subscribers.get(manifestPath)!.add(updater);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(manifestPath);
      if (subscribers) {
        subscribers.delete(updater);
        if (subscribers.size === 0) {
          this.subscribers.delete(manifestPath);
        }
      }
    };
  }

  private notifySubscribers(manifestPath: string, state: ManifestState): void {
    const subscribers = this.subscribers.get(manifestPath);
    if (subscribers) {
      subscribers.forEach(updater => updater(state));
    }
  }

  async loadManifest(manifestPath: string): Promise<void> {
    // If already loaded or loading, return existing promise
    if (this.manifests.has(manifestPath)) {
      return;
    }
    
    if (this.loadingPromises.has(manifestPath)) {
      return this.loadingPromises.get(manifestPath);
    }

    const loadingPromise = this.performLoad(manifestPath);
    this.loadingPromises.set(manifestPath, loadingPromise);
    
    try {
      await loadingPromise;
    } finally {
      this.loadingPromises.delete(manifestPath);
    }
  }

  private async performLoad(manifestPath: string): Promise<void> {
    // Initialize loading state
    const initialState: ManifestState = {
      assets: {},
      loading: true,
      error: null,
      progress: { loaded: 0, total: 0, percentage: 0 }
    };
    
    this.manifests.set(manifestPath, initialState);
    this.notifySubscribers(manifestPath, initialState);

    try {
      // Load manifest JSON
      const response = await fetch(manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status} ${response.statusText}`);
      }
      
      const manifest: Manifest = await response.json();
      
      // Get list of all textures to load
      const textureEntries = Object.entries(manifest.textures || {});
      const total = textureEntries.length;
      
      if (total === 0) {
        // No textures to load
        const finalState: ManifestState = {
          assets: {},
          loading: false,
          error: null,
          progress: { loaded: 0, total: 0, percentage: 100 }
        };
        
        this.manifests.set(manifestPath, finalState);
        this.notifySubscribers(manifestPath, finalState);
        return;
      }

      const assets: Record<string, string> = {};
      let loaded = 0;

      // Update progress with initial state
      const progressState: ManifestState = {
        assets: {},
        loading: true,
        error: null,
        progress: { loaded: 0, total, percentage: 0 }
      };
      this.manifests.set(manifestPath, progressState);
      this.notifySubscribers(manifestPath, progressState);

      // Load all textures in parallel
      const loadPromises = textureEntries.map(async ([key, texturePath]) => {
        try {
          // Preload the image to ensure it's cached
          await this.preloadImage(texturePath);
          assets[key] = texturePath;
          
          loaded++;
          const percentage = Math.round((loaded / total) * 100);
          
          // Update progress
          const updatedState: ManifestState = {
            assets: { ...assets },
            loading: loaded < total,
            error: null,
            progress: { loaded, total, percentage }
          };
          
          this.manifests.set(manifestPath, updatedState);
          this.notifySubscribers(manifestPath, updatedState);
          
        } catch (error) {
          console.warn(`Failed to load texture "${key}" from "${texturePath}":`, error);
          // Continue loading other assets even if one fails
          loaded++;
          const percentage = Math.round((loaded / total) * 100);
          
          const updatedState: ManifestState = {
            assets: { ...assets },
            loading: loaded < total,
            error: null, // Don't fail entire manifest for one asset
            progress: { loaded, total, percentage }
          };
          
          this.manifests.set(manifestPath, updatedState);
          this.notifySubscribers(manifestPath, updatedState);
        }
      });

      await Promise.all(loadPromises);

      // Final state - loading complete
      const finalState: ManifestState = {
        assets,
        loading: false,
        error: null,
        progress: { loaded, total, percentage: 100 }
      };
      
      this.manifests.set(manifestPath, finalState);
      this.notifySubscribers(manifestPath, finalState);

    } catch (error) {
      const errorState: ManifestState = {
        assets: {},
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
        progress: { loaded: 0, total: 0, percentage: 0 }
      };
      
      this.manifests.set(manifestPath, errorState);
      this.notifySubscribers(manifestPath, errorState);
    }
  }

  private async preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  // Cleanup method for when manager is no longer needed
  cleanup(): void {
    this.manifests.clear();
    this.subscribers.clear();
    this.loadingPromises.clear();
  }
}
