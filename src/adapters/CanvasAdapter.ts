import type { RenderAdapter } from './RenderAdapter';
import type { SpriteProps } from '../components/Core/Sprite';
import type { SceneProps } from '../components/Core/Scene';
import type { LayerProps } from '../components/Core/Layer';

interface ComponentInfo {
  type: string;
  id: string;
  props: any;
}

interface CanvasSprite {
  x: number;
  y: number;
  width: number;
  height: number;
  texture?: string;
  rotation: number;
  alpha: number;
  visible: boolean;
  image?: HTMLImageElement;
  // For hit testing - information about the React component
  componentInfo?: ComponentInfo;
}

interface CanvasLayer {
  name: string;
  zIndex: number;
  visible: boolean;
  alpha: number;
  children: (CanvasScene | CanvasSprite)[];
}

interface CanvasScene {
  width: number;
  height: number;
  backgroundColor: string;
  children: CanvasSprite[];
}

export class CanvasAdapter implements RenderAdapter {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private layers: CanvasLayer[] = [];
  private scene?: CanvasScene; // Keep for backward compatibility
  private textureCache = new Map<string, HTMLImageElement>();
  private lastRenderTime = 0;
  private isDirty = true;
  private lastSceneState?: string;

  initialize(canvas: HTMLCanvasElement, width: number, height: number): void {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = ctx;
    
    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = true;
  }

  destroy(): void {
    this.textureCache.clear();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  beginFrame(): void {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  endFrame(): void {
    // Nothing needed for canvas 2D
  }

  clear(color?: string): void {
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  createSprite(props: SpriteProps, componentInfo?: ComponentInfo): CanvasSprite {
    const sprite: CanvasSprite = {
      x: props.x || 0,
      y: props.y || 0,
      width: props.width || 32,
      height: props.height || 32,
      texture: props.texture,
      rotation: props.rotation || 0,
      alpha: props.alpha !== undefined ? props.alpha : 1,
      visible: props.visible !== undefined ? props.visible : true,
      componentInfo: componentInfo,
    };

    // Load texture if provided
    if (props.texture) {
      this.loadTexture(props.texture).then(image => {
        sprite.image = image;
      }).catch(error => {
        console.warn(`Failed to load texture for sprite: ${props.texture}`, error);
        // Sprite will render with placeholder color instead
      });
    }

    return sprite;
  }

  updateSprite(sprite: CanvasSprite, props: SpriteProps): void {
    let hasChanges = false;
    
    if (props.x !== undefined && sprite.x !== props.x) { sprite.x = props.x; hasChanges = true; }
    if (props.y !== undefined && sprite.y !== props.y) { sprite.y = props.y; hasChanges = true; }
    if (props.width !== undefined && sprite.width !== props.width) { sprite.width = props.width; hasChanges = true; }
    if (props.height !== undefined && sprite.height !== props.height) { sprite.height = props.height; hasChanges = true; }
    if (props.rotation !== undefined && sprite.rotation !== props.rotation) { sprite.rotation = props.rotation; hasChanges = true; }
    if (props.alpha !== undefined && sprite.alpha !== props.alpha) { sprite.alpha = props.alpha; hasChanges = true; }
    if (props.visible !== undefined && sprite.visible !== props.visible) { sprite.visible = props.visible; hasChanges = true; }
    
    // Handle texture changes
    if (props.texture !== sprite.texture) {
      sprite.texture = props.texture;
      hasChanges = true;
      if (props.texture) {
        this.loadTexture(props.texture).then(image => {
          sprite.image = image;
          this.markDirty();
        }).catch(error => {
          console.warn(`Failed to load texture for sprite: ${props.texture}`, error);
          // Sprite will render with placeholder color instead
          this.markDirty();
        });
      } else {
        sprite.image = undefined;
      }
    }
    
    if (hasChanges) {
      this.markDirty();
    }
  }

  destroySprite(sprite: CanvasSprite): void {
    // Remove references
    if (this.scene) {
      const index = this.scene.children.indexOf(sprite);
      if (index !== -1) {
        this.scene.children.splice(index, 1);
      }
    }
  }

  createScene(props: SceneProps): CanvasScene {
    const scene: CanvasScene = {
      width: props.width || this.canvas.width,
      height: props.height || this.canvas.height,
      backgroundColor: props.backgroundColor || 'transparent',
      children: [],
    };
    
    // Resize canvas if scene dimensions are specified
    if (props.width !== undefined || props.height !== undefined) {
      this.canvas.width = scene.width;
      this.canvas.height = scene.height;
    }
    
    this.scene = scene;
    return scene;
  }

  updateScene(scene: CanvasScene, props: SceneProps): void {
    let needsCanvasResize = false;
    
    if (props.width !== undefined) {
      scene.width = props.width;
      needsCanvasResize = true;
    }
    if (props.height !== undefined) {
      scene.height = props.height;
      needsCanvasResize = true;
    }
    if (props.backgroundColor !== undefined) {
      scene.backgroundColor = props.backgroundColor;
    }
    
    // Resize canvas if scene dimensions changed
    if (needsCanvasResize) {
      this.canvas.width = scene.width;
      this.canvas.height = scene.height;
      this.markDirty();
    }
  }

  destroyScene(scene: CanvasScene): void {
    if (this.scene === scene) {
      this.scene = undefined;
    }
  }

  createLayer(props: LayerProps): CanvasLayer {
    const layer: CanvasLayer = {
      name: props.name,
      zIndex: props.zIndex ?? 0,
      visible: props.visible ?? true,
      alpha: props.alpha ?? 1.0,
      children: [],
    };
    
    // Insert layer in correct z-index order
    const insertIndex = this.layers.findIndex(l => l.zIndex > layer.zIndex);
    if (insertIndex === -1) {
      this.layers.push(layer);
    } else {
      this.layers.splice(insertIndex, 0, layer);
    }
    
    this.markDirty();
    return layer;
  }

  updateLayer(layer: CanvasLayer, props: LayerProps): void {
    let hasChanges = false;
    
    if (props.visible !== undefined && layer.visible !== props.visible) {
      layer.visible = props.visible;
      hasChanges = true;
    }
    if (props.alpha !== undefined && layer.alpha !== props.alpha) {
      layer.alpha = props.alpha;
      hasChanges = true;
    }
    
    // Handle z-index changes - need to reorder layers
    if (props.zIndex !== undefined && layer.zIndex !== props.zIndex) {
      layer.zIndex = props.zIndex;
      
      // Remove and reinsert in correct position
      const currentIndex = this.layers.indexOf(layer);
      if (currentIndex !== -1) {
        this.layers.splice(currentIndex, 1);
        const insertIndex = this.layers.findIndex(l => l.zIndex > layer.zIndex);
        if (insertIndex === -1) {
          this.layers.push(layer);
        } else {
          this.layers.splice(insertIndex, 0, layer);
        }
      }
      hasChanges = true;
    }
    
    if (hasChanges) {
      this.markDirty();
    }
  }

  destroyLayer(layer: CanvasLayer): void {
    const index = this.layers.indexOf(layer);
    if (index !== -1) {
      this.layers.splice(index, 1);
      this.markDirty();
    }
  }

  addChild(parent: CanvasScene | CanvasLayer, child: CanvasSprite | CanvasScene): void {
    if (parent.hasOwnProperty('backgroundColor')) {
      // It's a CanvasScene - can only contain sprites
      const scene = parent as CanvasScene;
      const sprite = child as CanvasSprite;
      if (!scene.children.includes(sprite)) {
        scene.children.push(sprite);
        this.markDirty();
      }
    } else {
      // It's a CanvasLayer - can contain both sprites and scenes
      const layer = parent as CanvasLayer;
      if (!layer.children.includes(child)) {
        layer.children.push(child);
        this.markDirty();
      }
    }
  }

  removeChild(parent: CanvasScene | CanvasLayer, child: CanvasSprite | CanvasScene): void {
    if (parent.hasOwnProperty('backgroundColor')) {
      // It's a CanvasScene - can only contain sprites
      const scene = parent as CanvasScene;
      const sprite = child as CanvasSprite;
      const index = scene.children.indexOf(sprite);
      if (index !== -1) {
        scene.children.splice(index, 1);
        this.markDirty();
      }
    } else {
      // It's a CanvasLayer - can contain both sprites and scenes
      const layer = parent as CanvasLayer;
      const index = layer.children.indexOf(child);
      if (index !== -1) {
        layer.children.splice(index, 1);
        this.markDirty();
      }
    }
  }

  private markDirty(): void {
    this.isDirty = true;
  }

  async loadTexture(url: string): Promise<HTMLImageElement> {
    // Check cache first
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.textureCache.set(url, image);
        resolve(image);
      };
      image.onerror = () => {
        console.warn(`Failed to load texture: ${url}. Sprite will render with placeholder.`);
        reject(new Error(`Failed to load texture: ${url}`));
      };
      image.src = url;
    });
  }

  // Hit testing - find sprite at given canvas coordinates
  hitTest(x: number, y: number): ComponentInfo | null {
    if (!this.scene) {
      return null;
    }

    // Test sprites in reverse order (last rendered = on top)
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const sprite = this.scene.children[i];
      
      // Skip invisible sprites
      if (!sprite.visible || sprite.alpha <= 0) {
        continue;
      }

      // Simple rectangular hit test
      if (x >= sprite.x && 
          x <= sprite.x + sprite.width &&
          y >= sprite.y && 
          y <= sprite.y + sprite.height) {
        return sprite.componentInfo || null;
      }
    }

    return null;
  }

  // Render the current scene
  render(): void {
    // Adapter render called
    
    this.beginFrame();
    
    if (this.layers.length > 0) {
      // Render all layers in z-index order (they're already sorted)
      for (const layer of this.layers) {
        if (layer.visible && layer.alpha > 0) {
          this.renderLayer(layer);
        }
      }
    } else if (this.scene) {
      // Backward compatibility: render scene directly if no layers
      // Clear with background color
      this.clear(this.scene.backgroundColor);
      
      // Render all sprites
      for (const sprite of this.scene.children) {
        this.renderSprite(sprite);
      }
    } else {
      console.log('No layers or scene to render');
    }
    
    this.endFrame();
  }

  private getSceneStateHash(): string {
    if (!this.scene) return '';
    
    // Create a simple hash of the scene state
    const sprites = this.scene.children.map(sprite => 
      `${sprite.x},${sprite.y},${sprite.width},${sprite.height},${sprite.rotation},${sprite.alpha},${sprite.visible},${sprite.texture}`
    ).join('|');
    
    return `${this.scene.backgroundColor}:${sprites}`;
  }

  private renderLayer(layer: CanvasLayer): void {
    if (!layer.visible || layer.alpha <= 0) return;

    this.ctx.save();
    
    // Apply layer-level alpha
    this.ctx.globalAlpha = layer.alpha;
    
    // Render all children in the layer
    for (const child of layer.children) {
      if (child.hasOwnProperty('children')) {
        // It's a scene
        this.renderScene(child as CanvasScene);
      } else {
        // It's a sprite
        this.renderSprite(child as CanvasSprite);
      }
    }
    
    this.ctx.restore();
  }

  private renderScene(scene: CanvasScene): void {
    // Render scene background color if specified
    if (scene.backgroundColor && scene.backgroundColor !== 'transparent') {
      this.ctx.save();
      this.ctx.fillStyle = scene.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    
    // Render all sprites in the scene
    for (const sprite of scene.children) {
      this.renderSprite(sprite);
    }
  }

  private renderSprite(sprite: CanvasSprite): void {
    if (!sprite.visible || sprite.alpha <= 0) return;

    this.ctx.save();
    
    // Apply transformations
    this.ctx.globalAlpha = sprite.alpha;
    this.ctx.translate(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    
    if (sprite.rotation !== 0) {
      // Convert degrees to radians for canvas rotation
      this.ctx.rotate((sprite.rotation * Math.PI) / 180);
    }
    
    // Draw sprite
    if (sprite.image) {
      this.ctx.drawImage(
        sprite.image,
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
      );
    } else {
      // Draw a placeholder rectangle if no texture
      this.ctx.fillStyle = '#FF69B4'; // Hot pink placeholder
      this.ctx.fillRect(-sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
    }
    
    this.ctx.restore();
  }
}
