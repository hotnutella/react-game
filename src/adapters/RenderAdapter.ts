// Adapter interface for pluggable rendering engines
export interface RenderAdapter {
  // Lifecycle methods
  initialize(canvas: HTMLCanvasElement, width: number, height: number): void;
  destroy(): void;
  
  // Frame rendering
  beginFrame(): void;
  endFrame(): void;
  clear(color?: string): void;
  
  // Object management
  createSprite(props: any): any; // Returns engine-specific sprite object - props will be SpriteProps
  updateSprite(sprite: any, props: any): void;
  destroySprite(sprite: any): void;
  
  createScene(props: any): any; // props will be SceneProps
  updateScene(scene: any, props: any): void;
  destroyScene(scene: any): void;
  
  // Hierarchy management
  addChild(parent: any, child: any): void;
  removeChild(parent: any, child: any): void;
  
  // Utility
  loadTexture?(url: string): Promise<any>;
}
