import { useEffect } from "react";
import { Sprite, Animation, Easing } from "../../src/components";
import { useMyManifest } from "../manifests/manifestTypes";
import { UIElements } from "./UIElements";
import { AnimatedSprites } from "./AnimatedSprites";
import { ControlledAnimation } from "./ControlledAnimation";
import { KeyboardControlledSprite } from "./KeyboardControlledSprite";
import { MouseLogger } from "./MouseLogger";
import { InteractiveDemo } from "./InteractiveDemo";

// Component that uses manifest - must be inside Scene
export function GameContent() {
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
      <InteractiveDemo />
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
