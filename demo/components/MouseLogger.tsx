import { useRef, useEffect } from "react";
import { useMouse, MouseButtons } from "../../src/index";

// Simple mouse logger for debugging - no visual sprites
export function SimpleMouseLogger() {
  const { componentUnderPointer } = useMouse();

  useEffect(() => {
    if (componentUnderPointer) {
      console.log(
        `🎨 Component under pointer: ${componentUnderPointer.type} ${componentUnderPointer.id}`
      );
    } else {
      console.log("🎨 Component under pointer: None (background)");
    }
  }, [componentUnderPointer]);

  return null; // No visual output
}

// Mouse logger component to demonstrate useMouse hook
export function MouseLogger() {
  const {
    position,
    movement,
    pressedButtons,
    releasedButtons,
    doubleClick,
    isDragging,
    dragStart,
    dragEnd,
    currentDrag,
    componentUnderPointer,
  } = useMouse();
  const lastLogTimeRef = useRef(0);

  // Initial message
  useEffect(() => {
    console.log(
      "🖱️ Mouse logging is active! Move your mouse over the CANVAS and click buttons to see the hook outputs in the console."
    );
    console.log(
      "📊 Legend: 🖱️ = position (canvas-relative), 🏃 = movement, 🔴 = pressed buttons, ⚪ = released buttons, 🔥 = double-click, 🎯 = drag events, 🎨 = component under pointer"
    );
    console.log(
      "🎯 Note: Mouse events are now captured only within the canvas area and coordinates are relative to the canvas (0,0 = top-left corner of canvas)."
    );
    console.log(
      "🚫 Context menu (right-click menu) is disabled on the canvas for better game experience."
    );
  }, []);

  // Log mouse position periodically (every 100ms to avoid spam)
  useEffect(() => {
    const now = Date.now();
    if (now - lastLogTimeRef.current > 100) {
      console.log(`🖱️  Mouse position: (${position.x}, ${position.y})`);
      lastLogTimeRef.current = now;
    }
  }, [position]);

  // Log mouse movement when it occurs
  useEffect(() => {
    if (movement) {
      console.log(
        `🏃 Mouse movement: from (${movement.from.x}, ${movement.from.y}) to (${movement.to.x}, ${movement.to.y}) delta (${movement.delta.x}, ${movement.delta.y})`
      );
    }
  }, [movement]);

  // Log pressed buttons
  useEffect(() => {
    if (pressedButtons.length > 0) {
      const buttonNames = pressedButtons.map((btn) => {
        switch (btn) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${btn}`;
        }
      });
      console.log(`🔴 Mouse buttons pressed: [${buttonNames.join(", ")}]`);
    }
  }, [pressedButtons]);

  // Log released buttons
  useEffect(() => {
    if (releasedButtons.length > 0) {
      const buttonNames = releasedButtons.map((btn) => {
        switch (btn) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${btn}`;
        }
      });
      console.log(`⚪ Mouse buttons released: [${buttonNames.join(", ")}]`);
    }
  }, [releasedButtons]);

  // Log double-click events
  useEffect(() => {
    if (doubleClick) {
      const buttonName = (() => {
        switch (doubleClick.button) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${doubleClick.button}`;
        }
      })();
      console.log(
        `🔥 Double-click detected: ${buttonName} at (${doubleClick.position.x}, ${doubleClick.position.y})`
      );
    }
  }, [doubleClick]);

  // Log drag start events
  useEffect(() => {
    if (dragStart) {
      const buttonName = (() => {
        switch (dragStart.button) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${dragStart.button}`;
        }
      })();
      console.log(
        `🎯 Drag started: ${buttonName} from (${dragStart.startPosition.x}, ${dragStart.startPosition.y}) to (${dragStart.currentPosition.x}, ${dragStart.currentPosition.y})`
      );
    }
  }, [dragStart]);

  // Log drag end events
  useEffect(() => {
    if (dragEnd) {
      const buttonName = (() => {
        switch (dragEnd.button) {
          case MouseButtons.LEFT:
            return "LEFT";
          case MouseButtons.RIGHT:
            return "RIGHT";
          case MouseButtons.MIDDLE:
            return "MIDDLE";
          case MouseButtons.BACK:
            return "BACK";
          case MouseButtons.FORWARD:
            return "FORWARD";
          default:
            return `BUTTON_${dragEnd.button}`;
        }
      })();
      console.log(
        `🎯 Drag ended: ${buttonName} from (${dragEnd.startPosition.x}, ${dragEnd.startPosition.y}) to (${dragEnd.currentPosition.x}, ${dragEnd.currentPosition.y}) delta (${dragEnd.delta.x}, ${dragEnd.delta.y})`
      );
    }
  }, [dragEnd]);

  // Log drag state changes
  useEffect(() => {
    if (isDragging) {
      console.log("🎯 Dragging state: ACTIVE");
    }
  }, [isDragging]);

  // Log component under pointer changes
  useEffect(() => {
    if (componentUnderPointer) {
      const { type, id, props } = componentUnderPointer;
      const position = props ? `(${props.x || 0}, ${props.y || 0})` : "";
      const texture = props?.texture ? ` texture="${props.texture}"` : "";
      console.log(
        `🎨 Component under pointer: ${type} ${id} at ${position}${texture}`
      );
    } else {
      console.log("🎨 Component under pointer: None (background)");
    }
  }, [componentUnderPointer]);

  // TEMPORARILY DISABLED: Visual indicators cause sprite recreation
  // Only console logging enabled to debug the issue
  return null;
}
