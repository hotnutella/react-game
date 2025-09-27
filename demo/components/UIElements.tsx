import { Sprite } from "../../src/components";
import { useUiManifest } from "../manifests/manifestTypes";

// UI Component using UI manifest
export function UIElements() {
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
