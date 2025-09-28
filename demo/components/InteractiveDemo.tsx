import { useState, useCallback } from "react";
import { Sprite, Interactive } from "../../src/components";
import type { MousePosition, DragEvent } from "../../src/hooks";

// Interactive Demo Component - Shows how to use the Interactive wrapper
export function InteractiveDemo() {
  const [spritePosition, setSpritePosition] = useState({ x: 100, y: 400 });
  const [interactiveAlpha, setInteractiveAlpha] = useState(0.3);

  const handleLeftClick = useCallback((position: MousePosition) => {
    console.log(`Left clicked at (${position.x}, ${position.y})`);
  }, []);

  const handleRightClick = useCallback((position: MousePosition) => {
    console.log(`Right clicked at (${position.x}, ${position.y})`);
  }, []);

  const handleDoubleClick = useCallback(
    (button: number, position: MousePosition) => {
      console.log(
        `Double clicked with button ${button} at (${position.x}, ${position.y})`
      );
      // Move sprite to double-click position
      setSpritePosition({ x: position.x - 25, y: position.y - 25 });
    },
    []
  );

  const handleDragStart = useCallback((dragEvent: DragEvent) => {
    console.log(
      `Drag started at (${dragEvent.startPosition.x}, ${dragEvent.startPosition.y})`
    );
  }, []);

  const handleDrag = useCallback((dragEvent: DragEvent) => {
    // Move sprite with drag using absolute position relative to drag start
    setSpritePosition({
      x: dragEvent.currentPosition.x - 25, // Center the sprite on cursor
      y: dragEvent.currentPosition.y - 25,
    });
  }, []);

  const handleDragEnd = useCallback((dragEvent: DragEvent) => {
    console.log(
      `Drag ended at (${dragEvent.currentPosition.x}, ${dragEvent.currentPosition.y})`
    );
  }, []);

  const handleMouseEnter = useCallback((position: MousePosition) => {
    setInteractiveAlpha(1);
    console.log(`Mouse entered at (${position.x}, ${position.y})`);
  }, []);

  const handleMouseLeave = useCallback((position: MousePosition) => {
    setInteractiveAlpha(0.3);
    console.log(`Mouse left at (${position.x}, ${position.y})`);
  }, []);

  const handleButtonPress = useCallback(
    (button: number, position: MousePosition, pressedButtons: number[]) => {
      console.log(
        `Button ${button} pressed at (${position.x}, ${
          position.y
        }). Currently pressed: [${pressedButtons.join(", ")}]`
      );
    },
    []
  );

  const handleButtonRelease = useCallback(
    (button: number, position: MousePosition, pressedButtons: number[]) => {
      console.log(
        `Button ${button} released at (${position.x}, ${
          position.y
        }). Currently pressed: [${pressedButtons.join(", ")}]`
      );
    },
    []
  );

  const handleButtonsChange = useCallback(
    (pressedButtons: number[], position: MousePosition) => {
      console.log(
        `Buttons changed at (${position.x}, ${
          position.y
        }). Now pressed: [${pressedButtons.join(", ")}]`
      );
    },
    []
  );

  return (
    <Interactive
      onLeftClick={handleLeftClick}
      onRightClick={handleRightClick}
      onDoubleClick={handleDoubleClick}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onButtonPress={handleButtonPress}
      onButtonRelease={handleButtonRelease}
      onButtonsChange={handleButtonsChange}
    >
      <Sprite
        x={spritePosition.x}
        y={spritePosition.y}
        width={50}
        height={50}
        texture="sample.svg"
        alpha={interactiveAlpha}
      />
    </Interactive>
  );
}
