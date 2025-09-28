import { useState, useCallback } from "react";
import { Sprite, Interactive } from "../../src/components";
import type { MousePosition, DragEvent } from "../../src/hooks";

// Interactive Demo Component - Shows how to use the Interactive wrapper
export function InteractiveDemo() {
  const [isDragging, setIsDragging] = useState(false);
  const [spritePosition, setSpritePosition] = useState({ x: 100, y: 100 });

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
    setIsDragging(true);
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
    setIsDragging(false);
    console.log(
      `Drag ended at (${dragEvent.currentPosition.x}, ${dragEvent.currentPosition.y})`
    );
  }, []);

  const handleMouseEnter = useCallback((position: MousePosition) => {
    console.log(`Mouse entered at (${position.x}, ${position.y})`);
  }, []);

  const handleMouseLeave = useCallback((position: MousePosition) => {
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
    <>
      {/* Interactive Sprite that responds to mouse events */}
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
          alpha={isDragging ? 0.7 : 1.0}
        />
      </Interactive>

      {/* Status Display Sprites */}
      <Sprite
        x={10}
        y={10}
        width={200}
        height={20}
        texture="sample.svg"
        alpha={0.3}
      />

      {/* Click Counter Display */}
      <Sprite
        x={10}
        y={40}
        width={150}
        height={20}
        texture="sample.svg"
        alpha={0.3}
      />

      {/* Instructions */}
      <Sprite
        x={10}
        y={300}
        width={300}
        height={100}
        texture="sample.svg"
        alpha={0.2}
      />
    </>
  );
}
