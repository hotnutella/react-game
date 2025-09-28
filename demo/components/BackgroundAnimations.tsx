import { Animation, Easing, Sprite } from "../../src/components";
import { useMyManifest } from "../manifests/manifestTypes";

const BackgroundAnimations = () => {
  const { assets } = useMyManifest();

  return (
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
  );
};

export default BackgroundAnimations;
