import { useRef, useEffect, useState } from "react";
import { Scene, Sprite, Animation, Easing } from "../src/components";
import type { AnimationControls } from "../src/components";
import { render } from "../src/index";

// Controlled Animation example with visual feedback
function ControlledAnimation() {
  const animationRef = useRef<AnimationControls>(null);
  const [animationState, setAnimationState] = useState("stopped");
  const [progress, setProgress] = useState(0);

  // Demonstrate full control cycle
  useEffect(() => {
    let currentStep = 0;
    const steps = [
      { delay: 1000, action: "start", message: "▶️  STARTING animation..." },
      { delay: 3000, action: "pause", message: "⏸️  PAUSING animation..." },
      { delay: 5000, action: "resume", message: "▶️  RESUMING animation..." },
      { delay: 7000, action: "pause", message: "⏸️  PAUSING again..." },
      { delay: 9000, action: "stop", message: "⏹️  STOPPING animation..." },
      { delay: 11000, action: "reset", message: "🔄  RESETTING animation..." },
      { delay: 12000, action: "start", message: "▶️  STARTING again..." },
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
          setProgress(currentProgress);

          // Log progress every 10%
          if (
            Math.floor(currentProgress * 10) !==
            Math.floor((currentProgress - 0.01) * 10)
          ) {
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
function AnimatedSprites() {
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
        to={{ x: 400, y: 400, rotation: 360, alpha: 1 }}
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
    </>
  );
}

// Minimal Demo App - Test useGameLoop and Animation functionality
function DemoApp() {
  return (
    <Scene backgroundColor="#001122">
      <AnimatedSprites />
      <ControlledAnimation />
      {/* Static sprites for reference */}
      <Sprite x={600} y={500} width={30} height={30} />
      <Sprite x={700} y={500} width={40} height={40} />
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
