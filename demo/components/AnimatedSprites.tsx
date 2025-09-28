import { Sprite, Animation, Easing } from "../../src/components";
import type { MyManifestAssets } from "../manifests/manifestTypes";

// Animated Sprites to test Animation component
export function AnimatedSprites({ assets }: { assets: MyManifestAssets }) {
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
    </>
  );
}
