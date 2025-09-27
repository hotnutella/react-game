import { Scene } from "../../src/components";
import { GameContent } from "./GameContent";

// Minimal Demo Game - Test useGameLoop and Animation functionality with manifest
export function DemoGame() {
  return (
    <Scene backgroundColor="#001122">
      <GameContent />
    </Scene>
  );
}
