import { useRef, useEffect, useState } from "react";
import { Scene, Sprite, Animation, Easing } from "../src/components";
import type { AnimationControls } from "../src/components";
import {
  useMyManifest,
  useUiManifest,
  type MyManifestAssets,
} from "./manifests/manifestTypes";
import { render, useKeyboard, useMouse, MouseButtons } from "../src/index";

// Keyboard-controlled sprite example
function KeyboardControlledSprite() {
  const { pressedKeys, releasedKeys } = useKeyboard();
  const [position, setPosition] = useState({ x: 400, y: 300 });
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Handle movement based on pressed keys using functional setState
    // to avoid dependency on position value
    const speed = 5;
    let hasMovement = false;
    let deltaX = 0;
    let deltaY = 0;

    if (
      pressedKeys.includes("ArrowLeft") ||
      pressedKeys.includes("a") ||
      pressedKeys.includes("A")
    ) {
      deltaX -= speed;
      hasMovement = true;
    }
    if (
      pressedKeys.includes("ArrowRight") ||
      pressedKeys.includes("d") ||
      pressedKeys.includes("D")
    ) {
      deltaX += speed;
      hasMovement = true;
    }
    if (
      pressedKeys.includes("ArrowUp") ||
      pressedKeys.includes("w") ||
      pressedKeys.includes("W")
    ) {
      deltaY -= speed;
      hasMovement = true;
    }
    if (
      pressedKeys.includes("ArrowDown") ||
      pressedKeys.includes("s") ||
      pressedKeys.includes("S")
    ) {
      deltaY += speed;
      hasMovement = true;
    }

    if (hasMovement) {
      setPosition((prevPosition) => {
        // Apply movement and boundary checks
        const newX = Math.max(0, Math.min(760, prevPosition.x + deltaX));
        const newY = Math.max(0, Math.min(560, prevPosition.y + deltaY));
        return { x: newX, y: newY };
      });
    }
  }, [pressedKeys]); // Only depend on pressedKeys, not position

  useEffect(() => {
    // Handle rotation changes on key release
    if (releasedKeys.includes(" ")) {
      // Space bar
      setRotation((prev) => prev + 45); // Rotate 45 degrees each time
    }
  }, [releasedKeys]);

  return (
    <>
      {/* Main controllable sprite - uses default pink placeholder color */}
      <Sprite
        x={position.x}
        y={position.y}
        width={40}
        height={40}
        rotation={rotation}
      />

      {/* Instructions (visual indicators) - WASD/Arrow keys and Spacebar */}
      <Sprite
        x={10}
        y={10}
        width={8}
        height={8}
        alpha={
          pressedKeys.includes("ArrowUp") ||
          pressedKeys.includes("w") ||
          pressedKeys.includes("W")
            ? 1
            : 0.3
        }
      />
      <Sprite
        x={10}
        y={30}
        width={8}
        height={8}
        alpha={
          pressedKeys.includes("ArrowLeft") ||
          pressedKeys.includes("a") ||
          pressedKeys.includes("A")
            ? 1
            : 0.3
        }
      />
      <Sprite
        x={30}
        y={30}
        width={8}
        height={8}
        alpha={
          pressedKeys.includes("ArrowRight") ||
          pressedKeys.includes("d") ||
          pressedKeys.includes("D")
            ? 1
            : 0.3
        }
      />
      <Sprite
        x={10}
        y={50}
        width={8}
        height={8}
        alpha={
          pressedKeys.includes("ArrowDown") ||
          pressedKeys.includes("s") ||
          pressedKeys.includes("S")
            ? 1
            : 0.3
        }
      />
      <Sprite
        x={50}
        y={30}
        width={12}
        height={8}
        alpha={releasedKeys.includes(" ") ? 1 : 0.5}
      />
    </>
  );
}

// Simple mouse logger for debugging - no visual sprites
function SimpleMouseLogger() {
  const { componentUnderPointer } = useMouse();

  useEffect(() => {
    if (componentUnderPointer) {
      console.log(
        `🎨 Component under pointer: ${componentUnderPointer.type} ${componentUnderPointer.id}`
      );
    } else {
      console.log("🎨 Component under pointer: None (background)");
    }
  }, [componentUnderPointer]);

  return null; // No visual output
}

// Mouse logger component to demonstrate useMouse hook
function MouseLogger() {
  const {
    position,
    movement,
    pressedButtons,
    releasedButtons,
    doubleClick,
    isDragging,
    dragStart,
    dragEnd,
    currentDrag,
    componentUnderPointer,
  } = useMouse();
  const lastLogTimeRef = useRef(0);

  // Initial message
  useEffect(() => {
    console.log(
      "🖱️ Mouse logging is active! Move your mouse over the CANVAS and click buttons to see the hook outputs in the console."
    );
    console.log(
      "📊 Legend: 🖱️ = position (canvas-relative), 🏃 = movement, 🔴 = pressed buttons, ⚪ = released buttons, 🔥 = double-click, 🎯 = drag events, 🎨 = component under pointer"
    );
    console.log(
      "🎯 Note: Mouse events are now captured only within the canvas area and coordinates are relative to the canvas (0,0 = top-left corner of canvas)."
    );
    console.log(
      "🚫 Context menu (right-click menu) is disabled on the canvas for better game experience."
    );
  }, []);

  // Log mouse position periodically (every 100ms to avoid spam)
  useEffect(() => {
    const now = Date.now();
    if (now - lastLogTimeRef.current > 100) {
      console.log(`🖱️  Mouse position: (${position.x}, ${position.y})`);
      lastLogTimeRef.current = now;
    }
  }, [position]);

  // Log mouse movement when it occurs
  useEffect(() => {
    if (movement) {
      console.log(
        `🏃 Mouse movement: from (${movement.from.x}, ${movement.from.y}) to (${movement.to.x}, ${movement.to.y}) delta (${movement.delta.x}, ${movement.delta.y})`
      );
    }
  }, [movement]);

  // Log pressed buttons
  useEffect(() => {
    if (pressedButtons.length > 0) {
      const buttonNames = pressedButtons.map((btn) => {
        switch (btn) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${btn}`;
        }
      });
      console.log(`🔴 Mouse buttons pressed: [${buttonNames.join(", ")}]`);
    }
  }, [pressedButtons]);

  // Log released buttons
  useEffect(() => {
    if (releasedButtons.length > 0) {
      const buttonNames = releasedButtons.map((btn) => {
        switch (btn) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${btn}`;
        }
      });
      console.log(`⚪ Mouse buttons released: [${buttonNames.join(", ")}]`);
    }
  }, [releasedButtons]);

  // Log double-click events
  useEffect(() => {
    if (doubleClick) {
      const buttonName = (() => {
        switch (doubleClick.button) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${doubleClick.button}`;
        }
      })();
      console.log(
        `🔥 Double-click detected: ${buttonName} at (${doubleClick.position.x}, ${doubleClick.position.y})`
      );
    }
  }, [doubleClick]);

  // Log drag start events
  useEffect(() => {
    if (dragStart) {
      const buttonName = (() => {
        switch (dragStart.button) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${dragStart.button}`;
        }
      })();
      console.log(
        `🎯 Drag started: ${buttonName} from (${dragStart.startPosition.x}, ${dragStart.startPosition.y}) to (${dragStart.currentPosition.x}, ${dragStart.currentPosition.y})`
      );
    }
  }, [dragStart]);

  // Log drag end events
  useEffect(() => {
    if (dragEnd) {
      const buttonName = (() => {
        switch (dragEnd.button) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${dragEnd.button}`;
        }
      })();
      console.log(
        `🎯 Drag ended: ${buttonName} from (${dragEnd.startPosition.x}, ${dragEnd.startPosition.y}) to (${dragEnd.currentPosition.x}, ${dragEnd.currentPosition.y}) delta (${dragEnd.delta.x}, ${dragEnd.delta.y})`
      );
    }
  }, [dragEnd]);

  // Log drag state changes
  useEffect(() => {
    if (isDragging) {
      console.log("🎯 Dragging state: ACTIVE");
    }
  }, [isDragging]);

  // Log component under pointer changes
  useEffect(() => {
    if (componentUnderPointer) {
      const { type, id, props } = componentUnderPointer;
      const position = props ? `(${props.x || 0}, ${props.y || 0})` : "";
      const texture = props?.texture ? ` texture="${props.texture}"` : "";
      console.log(
        `🎨 Component under pointer: ${type} ${id} at ${position}${texture}`
      );
    } else {
      console.log("🎨 Component under pointer: None (background)");
    }
  }, [componentUnderPointer]);

  // TEMPORARILY DISABLED: Visual indicators cause sprite recreation
  // Only console logging enabled to debug the issue
  return null;
}

// Controlled Animation example with visual feedback
function ControlledAnimation() {
  const animationRef = useRef<AnimationControls>(null);
  const [animationState, setAnimationState] = useState("stopped");
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  // Demonstrate full control cycle
  useEffect(() => {
    let currentStep = 0;
    const steps = [
      { delay: 1000, action: "start", message: "▶️  STARTING animation..." },
      { delay: 2000, action: "pause", message: "⏸️  PAUSING animation..." },
      { delay: 1000, action: "resume", message: "▶️  RESUMING animation..." },
      { delay: 1000, action: "pause", message: "⏸️  PAUSING again..." },
      { delay: 2000, action: "reset", message: "🔄  RESETTING animation..." },
      { delay: 2000, action: "start", message: "▶️  STARTING again..." },
      { delay: 1000, action: "stop", message: "⏹️  STOPPING animation..." },
    ];

    const executeStep = () => {
      if (currentStep >= steps.length) return;

      const step = steps[currentStep];
      setTimeout(() => {
        if (animationRef.current) {
          console.log(step.message);
          setAnimationState(step.action);

          switch (step.action) {
            case "start":
              animationRef.current.start();
              break;
            case "pause":
              animationRef.current.pause();
              break;
            case "resume":
              animationRef.current.resume();
              break;
            case "stop":
              animationRef.current.stop();
              break;
            case "reset":
              animationRef.current.reset();
              break;
          }
        }
        currentStep++;
        executeStep();
      }, step.delay);
    };

    executeStep();
  }, []);

  return (
    <>
      {/* Main animated sprite */}
      <Animation
        ref={animationRef}
        from={{ x: 500, y: 50, width: 20, height: 20, alpha: 0.3 }}
        to={{ x: 500, y: 300, width: 50, height: 50, alpha: 1 }}
        duration={4}
        easing={Easing.easeInOutQuad}
        autoStart={false} // Start manually
        onComplete={() => {
          console.log("🏁 Controlled animation completed!");
          setAnimationState("completed");
        }}
        onUpdate={(currentProgress, values) => {
          progressRef.current = currentProgress;

          // Only update state for significant progress changes (every 10%)
          const progressPercent = Math.floor(currentProgress * 10);
          const lastProgressPercent = Math.floor(progress * 10);

          if (progressPercent !== lastProgressPercent) {
            setProgress(currentProgress);
            console.log(
              `📊 Animation progress: ${Math.round(currentProgress * 100)}%`
            );
          }
        }}
      >
        <Sprite />
      </Animation>

      {/* Visual state indicator sprites */}
      <Sprite
        x={550}
        y={50}
        width={15}
        height={15}
        alpha={animationState === "stopped" ? 1 : 0.3}
      />
      <Sprite
        x={570}
        y={50}
        width={15}
        height={15}
        alpha={
          animationState === "start" || animationState === "resume" ? 1 : 0.3
        }
      />
      <Sprite
        x={590}
        y={50}
        width={15}
        height={15}
        alpha={animationState === "pause" ? 1 : 0.3}
      />

      <Sprite x={610} y={50} width={15} height={15} texture="" />

      {/* Progress bar made of sprites */}
      {Array.from({ length: 10 }, (_, i) => (
        <Sprite
          key={i}
          x={500 + i * 6}
          y={320}
          width={5}
          height={10}
          alpha={i < progress * 10 ? 0.8 : 0.2}
        />
      ))}
    </>
  );
}

// Animated Sprites to test Animation component
function AnimatedSprites({ assets }: { assets: MyManifestAssets }) {
  return (
    <>
      {/* Bouncing sprite with easeInOutQuad */}
      <Animation
        from={{ x: 50, y: 150 }}
        to={{ x: 350, y: 150 }}
        duration={2}
        easing={Easing.easeInOutQuad}
        loop={true}
        reverse={true}
      >
        <Sprite width={40} height={40} />
      </Animation>

      {/* Rotating and scaling sprite */}
      <Animation
        from={{ x: 400, y: 200, rotation: 0, alpha: 0.5 }}
        to={{ x: 400, y: 400, rotation: 720, alpha: 1 }}
        duration={3}
        easing={Easing.easeInOutCubic}
        loop={true}
      >
        <Sprite width={30} height={30} />
      </Animation>

      {/* Growing sprite with delay */}
      <Animation
        from={{ x: 100, y: 350, width: 10, height: 10 }}
        to={{ x: 250, y: 350, width: 60, height: 60 }}
        duration={1.5}
        easing={Easing.easeOutQuad}
        delay={0.5}
        loop={true}
        reverse={true}
      >
        <Sprite />
      </Animation>

      {/* Animated sprite with SVG texture using assets object */}
      <Animation
        from={{ x: 50, y: 50, rotation: 0 }}
        to={{ x: 300, y: 250, rotation: 360 }}
        duration={4}
        easing={Easing.easeInOutQuad}
        loop={true}
        reverse={true}
      >
        <Sprite width={48} height={48} texture={assets.enemy} />
      </Animation>
    </>
  );
}

// UI Component using UI manifest
function UIElements() {
  const { assets: ui } = useUiManifest();

  return (
    <>
      {/* UI buttons */}
      <Sprite
        x={50}
        y={50}
        width={100}
        height={30}
        texture={ui.button_primary}
      />
      <Sprite
        x={50}
        y={90}
        width={100}
        height={30}
        texture={ui.button_secondary}
      />
      <Sprite x={700} y={50} width={20} height={20} texture={ui.close_icon} />
    </>
  );
}

// Component that uses manifest - must be inside Scene
function GameContent() {
  const { assets, loading, error, progress } = useMyManifest();

  // Handle error logging in useEffect to avoid re-renders
  useEffect(() => {
    if (error) {
      console.error("Failed to load manifest:", error);
    }
  }, [error]);

  // Handle loading progress logging in useEffect to avoid re-renders
  useEffect(() => {
    if (loading) {
      console.log(
        `Loading assets: ${progress.loaded}/${progress.total} (${progress.percentage}%)`
      );
    }
  }, [loading, progress.loaded, progress.total, progress.percentage]);

  return (
    <>
      <UIElements />
      <AnimatedSprites assets={assets} />
      <ControlledAnimation />
      <KeyboardControlledSprite />
      <MouseLogger />
      {/* Static sprites for reference */}
      <Sprite x={600} y={500} width={30} height={30} />
      <Sprite x={700} y={500} width={40} height={40} />

      {/* Sprite with SVG texture using assets object */}
      <Sprite
        x={400}
        y={100}
        width={64}
        height={64}
        texture={assets.sample_icon}
      />
      {/* Fading in and out Sprite with SVG texture using assets object */}
      <Animation
        from={{ alpha: 0, rotation: 0 }}
        to={{ alpha: 1, rotation: 180 }}
        duration={2}
        easing={Easing.easeInOutQuad}
        loop={true}
        reverse={true}
      >
        <Sprite x={600} y={100} width={64} height={64} texture={assets.hero} />
      </Animation>
    </>
  );
}

// Minimal Demo App - Test useGameLoop and Animation functionality with manifest
function DemoApp() {
  return (
    <Scene backgroundColor="#001122">
      <GameContent />
    </Scene>
  );
}

// Mount the app using pure ReactGame - NO React DOM!
const container = document.getElementById("root");
if (container) {
  console.log("Container found, setting up demo...");

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = "2px solid #444";
  canvas.style.backgroundColor = "#000";
  container.appendChild(canvas);

  console.log("Canvas created, about to render...");

  try {
    // Use ReactGame's render function instead of ReactDOM
    render(<DemoApp />, canvas);
    console.log("Render function completed successfully");
  } catch (error) {
    console.error("Error during render:", error);
  }

  // Signal that the page has finished loading
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => {
        console.log("ReactGame Demo: Fully loaded and ready");
      })
    : console.log("ReactGame Demo: Fully loaded and ready");
} else {
  console.error("Root container not found");
}
