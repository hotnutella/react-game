import { Game, Layer, Scene } from "../../src/components";
import { GameContent } from "./GameContent";
import BackgroundAnimations from "./BackgroundAnimations";

export function DemoGame() {
  return (
    <Game width={800} height={600} debug={true}>
      <Scene>
        <GameContent />
      </Scene>
      <Layer name="background">
        <Scene backgroundColor="#001122">
          <BackgroundAnimations />
        </Scene>
      </Layer>
    </Game>
  );
}
