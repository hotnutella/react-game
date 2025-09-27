import { useRef, useEffect, useState } from "react";
import { Sprite, Animation, Easing } from "../../src/components";
import type { AnimationControls } from "../../src/components";

// Controlled Animation example with visual feedback
export function ControlledAnimation() {
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
