import { useEffect, useState } from "react";
import { Sprite } from "../../src/components";
import { useKeyboard } from "../../src/index";

// Keyboard-controlled sprite example
export function KeyboardControlledSprite() {
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
