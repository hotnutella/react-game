import Reconciler from 'react-reconciler';
import type { RenderAdapter } from './adapters';
import type { SpriteProps } from './components/Sprite';
import type { SceneProps } from './components/Scene';
import type { GameProps } from './components/Game';

// Game objects that will be managed by the reconciler
export interface GameObject {
  type: string;
  props: Record<string, any>;
  children: GameObject[];
  parent?: GameObject;
}

// Instance types for different game objects
interface GameInstance {
  type: 'game';
  props: GameProps;
  children: (SceneInstance)[];
  canvas?: HTMLCanvasElement;
  adapter: RenderAdapter;
}

interface SceneInstance {
  type: 'scene';
  props: SceneProps;
  children: (SpriteInstance)[];
  parent?: GameInstance;
  nativeObject?: any; // Engine-specific scene object
}

interface SpriteInstance {
  type: 'sprite';
  props: SpriteProps;
  children: never[];
  parent?: SceneInstance;
  nativeObject?: any; // Engine-specific sprite object
}

type Instance = GameInstance | SceneInstance | SpriteInstance;
type TextInstance = never; // We don't support text nodes
type SuspenseInstance = Instance;
type HydratableInstance = Instance;
type PublicInstance = Instance;
type HostContext = {};
type UpdatePayload = boolean;
type ChildSet = never;
type TimeoutHandle = number;
type NoTimeout = -1;

// Global adapter reference - will be set by the Game component
let currentAdapter: RenderAdapter | null = null;

export function setCurrentAdapter(adapter: RenderAdapter) {
  currentAdapter = adapter;
}

// Create reconciler configuration
const hostConfig: Reconciler.HostConfig<
  string, // Type
  Record<string, any>, // Props
  Instance, // Container
  Instance, // Instance
  TextInstance, // TextInstance
  SuspenseInstance, // SuspenseInstance
  HydratableInstance, // HydratableInstance
  PublicInstance, // PublicInstance
  HostContext, // HostContext
  UpdatePayload, // UpdatePayload
  ChildSet, // ChildSet
  TimeoutHandle, // TimeoutHandle
  NoTimeout // NoTimeout
> = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  getRootHostContext(): HostContext {
    return {};
  },

  getChildHostContext(parentHostContext: HostContext, type: string, rootContainer: Instance): HostContext {
    return {};
  },

  prepareForCommit(): Record<string, any> | null {
    return null;
  },

  resetAfterCommit(): void {
    // Disable automatic rendering after commit to prevent potential infinite loops
    // resetAfterCommit called - skipping automatic render
    // if (currentAdapter) {
    //   (currentAdapter as any).render?.();
    // }
  },

  createInstance(
    type: string,
    props: Record<string, any>,
    rootContainer: Instance,
    hostContext: HostContext,
    internalHandle: Reconciler.OpaqueHandle
  ): Instance {
    console.log(`Creating instance of type: ${type}`, props);
    
    if (!currentAdapter) {
      console.error('No render adapter available');
      throw new Error('No render adapter available');
    }

    switch (type) {
      case 'sprite': {
        console.log('Creating sprite with props:', props);
        const sprite: SpriteInstance = {
          type: 'sprite',
          props: props as SpriteProps,
          children: [],
          nativeObject: currentAdapter.createSprite(props as SpriteProps),
        };
        return sprite;
      }
      case 'scene': {
        console.log('Creating scene with props:', props);
        const scene: SceneInstance = {
          type: 'scene',
          props: props as SceneProps,
          children: [],
          nativeObject: currentAdapter.createScene(props as SceneProps),
        };
        return scene;
      }
      case 'game': {
        console.log('Creating game with props:', props);
        const game: GameInstance = {
          type: 'game',
          props: props as GameProps,
          children: [],
          adapter: currentAdapter,
        };
        return game;
      }
      default:
        console.error(`Unknown component type: ${type}`);
        throw new Error(`Unknown component type: ${type}`);
    }
  },

  createTextInstance(): TextInstance {
    throw new Error('Text nodes are not supported in ReactGame');
  },

  appendInitialChild(parent: Instance, child: Instance): void {
    if (parent.type === 'game' && child.type === 'scene') {
      parent.children.push(child);
      child.parent = parent;
    } else if (parent.type === 'scene' && child.type === 'sprite') {
      parent.children.push(child);
      child.parent = parent;
      
      // Add to render adapter
      if (currentAdapter && parent.nativeObject && child.nativeObject) {
        currentAdapter.addChild(parent.nativeObject, child.nativeObject);
      }
    }
  },

  appendChild(parent: Instance, child: Instance): void {
    this.appendInitialChild(parent, child);
  },

  insertBefore(parent: Instance, child: Instance, beforeChild: Instance): void {
    if (parent.type === 'game' && child.type === 'scene') {
      const index = parent.children.indexOf(beforeChild as SceneInstance);
      if (index !== -1) {
        parent.children.splice(index, 0, child);
        child.parent = parent;
      }
    } else if (parent.type === 'scene' && child.type === 'sprite') {
      const index = parent.children.indexOf(beforeChild as SpriteInstance);
      if (index !== -1) {
        parent.children.splice(index, 0, child);
        child.parent = parent;
        
        // Add to render adapter
        if (currentAdapter && parent.nativeObject && child.nativeObject) {
          currentAdapter.addChild(parent.nativeObject, child.nativeObject);
        }
      }
    }
  },

  removeChild(parent: Instance, child: Instance): void {
    if (parent.type === 'game' && child.type === 'scene') {
      const index = parent.children.indexOf(child as SceneInstance);
      if (index !== -1) {
        parent.children.splice(index, 1);
        (child as SceneInstance).parent = undefined;
      }
    } else if (parent.type === 'scene' && child.type === 'sprite') {
      const index = parent.children.indexOf(child as SpriteInstance);
      if (index !== -1) {
        parent.children.splice(index, 1);
        (child as SpriteInstance).parent = undefined;
        
        // Remove from render adapter
        if (currentAdapter && parent.nativeObject && child.nativeObject) {
          currentAdapter.removeChild(parent.nativeObject, child.nativeObject);
        }
      }
    }
  },

  commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: string,
    prevProps: Record<string, any>,
    nextProps: Record<string, any>,
    internalHandle: Reconciler.OpaqueHandle
  ): void {
    if (!currentAdapter) return;

    instance.props = nextProps;

    if (instance.type === 'sprite' && instance.nativeObject) {
      currentAdapter.updateSprite(instance.nativeObject, nextProps as SpriteProps);
    } else if (instance.type === 'scene' && instance.nativeObject) {
      currentAdapter.updateScene(instance.nativeObject, nextProps as SceneProps);
    }
  },

  prepareUpdate(
    instance: Instance,
    type: string,
    oldProps: Record<string, any>,
    newProps: Record<string, any>,
    rootContainer: Instance,
    hostContext: HostContext
  ): UpdatePayload | null {
    // Always return true to trigger commitUpdate
    return true;
  },

  finalizeInitialChildren(): boolean {
    return false;
  },

  getPublicInstance(instance: Instance): PublicInstance {
    return instance;
  },

  shouldSetTextContent(): boolean {
    return false;
  },

  clearContainer(): void {
    // Nothing to do
  },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1 as NoTimeout,

  isPrimaryRenderer: false,
  warnsIfNotActing: true,
  supportsMicrotasks: false,
  scheduleMicrotask: queueMicrotask,

  // Additional required properties for react-reconciler 0.29
  preparePortalMount(): void {
    // Nothing to do
  },

  getCurrentEventPriority(): number {
    return 16; // Normal priority
  },

  getInstanceFromNode(): any {
    return null;
  },

  beforeActiveInstanceBlur(): void {
    // Nothing to do
  },

  afterActiveInstanceBlur(): void {
    // Nothing to do
  },

  detachDeletedInstance(): void {
    // Nothing to do
  },

  prepareScopeUpdate(): void {
    // Nothing to do
  },

  getInstanceFromScope(): any {
    return null;
  },

  // Container methods for proper React reconciler integration
  appendChildToContainer(container: Instance, child: Instance): void {
    // For our game renderer, the container should be the root game instance
    if (child.type === 'game') {
      // The child IS the game instance, no need to append
      return;
    }
    
    // Find the game instance in the container hierarchy
    let gameInstance: GameInstance | null = null;
    if (container && container.type === 'game') {
      gameInstance = container;
    }
    
    if (gameInstance && child.type === 'scene') {
      gameInstance.children.push(child);
      child.parent = gameInstance;
    }
  },

  insertInContainerBefore(container: Instance, child: Instance, beforeChild: Instance): void {
    // Similar to appendChildToContainer but with insertion at specific position
    let gameInstance: GameInstance | null = null;
    if (container && container.type === 'game') {
      gameInstance = container;
    }
    
    if (gameInstance && child.type === 'scene') {
      const index = gameInstance.children.indexOf(beforeChild as SceneInstance);
      if (index !== -1) {
        gameInstance.children.splice(index, 0, child);
        child.parent = gameInstance;
      }
    }
  },

  removeChildFromContainer(container: Instance, child: Instance): void {
    let gameInstance: GameInstance | null = null;
    if (container && container.type === 'game') {
      gameInstance = container;
    }
    
    if (gameInstance && child.type === 'scene') {
      const index = gameInstance.children.indexOf(child as SceneInstance);
      if (index !== -1) {
        gameInstance.children.splice(index, 1);
        (child as SceneInstance).parent = undefined;
      }
    }
  },

};

export const GameReconciler = Reconciler(hostConfig);
