import React, { useRef, useEffect, useCallback } from "react";
import {
  useMouse,
  MouseButtons,
  type MousePosition,
  type DragEvent,
} from "../../hooks/useMouse";

// Interactive event handlers interface
export interface InteractiveEventHandlers {
  onLeftClick?: (position: MousePosition) => void;
  onRightClick?: (position: MousePosition) => void;
  onMiddleClick?: (position: MousePosition) => void;
  onDoubleClick?: (button: number, position: MousePosition) => void;
  onDragStart?: (dragEvent: DragEvent) => void;
  onDragEnd?: (dragEvent: DragEvent) => void;
  onDrag?: (dragEvent: DragEvent) => void;
  onMouseEnter?: (position: MousePosition) => void;
  onMouseLeave?: (position: MousePosition) => void;
  onMouseMove?: (position: MousePosition) => void;
  onButtonPress?: (
    button: number,
    position: MousePosition,
    pressedButtons: number[]
  ) => void;
  onButtonRelease?: (
    button: number,
    position: MousePosition,
    pressedButtons: number[]
  ) => void;
  onButtonsChange?: (pressedButtons: number[], position: MousePosition) => void;
}

export interface InteractiveProps extends InteractiveEventHandlers {
  children: React.ReactElement;
  enabled?: boolean;
}

// Interactive component that wraps children and provides mouse event handling
export function Interactive({
  children,
  enabled = true,
  onLeftClick,
  onRightClick,
  onMiddleClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onDrag,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onButtonPress,
  onButtonRelease,
  onButtonsChange,
}: InteractiveProps): React.ReactElement {
  const {
    position,
    pressedButtons,
    releasedButtons,
    doubleClick,
    dragStart,
    dragEnd,
    currentDrag,
    componentUnderPointer,
  } = useMouse();

  // Track if mouse is currently over this component
  const isHoveredRef = useRef(false);
  const lastPositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const isDraggingThisRef = useRef(false); // Track if this Interactive is the one being dragged
  const previousPressedButtonsRef = useRef<number[]>([]); // Track previous button state for change detection

  // Handle mouse enter/leave detection
  useEffect(() => {
    if (!componentUnderPointer || !enabled) {
      // If no component under pointer, mouse has left
      if (isHoveredRef.current) {
        isHoveredRef.current = false;
        if (onMouseLeave) {
          onMouseLeave(lastPositionRef.current);
        }
      }
      lastPositionRef.current = position;
      return;
    }

    // Check if mouse is over this element
    const actualProps = componentUnderPointer.props;
    const spriteX = actualProps.x || 0;
    const spriteY = actualProps.y || 0;
    const spriteWidth = actualProps.width || 32;
    const spriteHeight = actualProps.height || 32;

    const isCurrentlyOver =
      componentUnderPointer.type === "sprite" &&
      position.x >= spriteX &&
      position.x <= spriteX + spriteWidth &&
      position.y >= spriteY &&
      position.y <= spriteY + spriteHeight;

    if (isCurrentlyOver && !isHoveredRef.current) {
      // Mouse entered
      isHoveredRef.current = true;
      if (onMouseEnter) {
        onMouseEnter(position);
      }
    } else if (!isCurrentlyOver && isHoveredRef.current) {
      // Mouse left
      isHoveredRef.current = false;
      if (onMouseLeave) {
        onMouseLeave(lastPositionRef.current);
      }
    }

    lastPositionRef.current = position;
  }, [componentUnderPointer, enabled, position, onMouseEnter, onMouseLeave]);

  // Handle mouse movement over this element
  useEffect(() => {
    if (isHoveredRef.current && onMouseMove) {
      onMouseMove(position);
    }
  }, [position, onMouseMove]);

  // Handle button releases (clicks)
  useEffect(() => {
    if (!enabled || !isHoveredRef.current || releasedButtons.length === 0)
      return;

    releasedButtons.forEach((button) => {
      switch (button) {
        case MouseButtons.LEFT:
          if (onLeftClick) {
            onLeftClick(position);
          }
          break;
        case MouseButtons.RIGHT:
          if (onRightClick) {
            onRightClick(position);
          }
          break;
        case MouseButtons.MIDDLE:
          if (onMiddleClick) {
            onMiddleClick(position);
          }
          break;
      }
    });
  }, [
    releasedButtons,
    position,
    enabled,
    onLeftClick,
    onRightClick,
    onMiddleClick,
  ]);

  // Handle button press/release events and button state changes
  useEffect(() => {
    if (!enabled || !isHoveredRef.current) return;

    const previousButtons = previousPressedButtonsRef.current;
    const currentButtons = pressedButtons;

    // Detect newly pressed buttons
    const newlyPressed = currentButtons.filter(
      (button) => !previousButtons.includes(button)
    );
    newlyPressed.forEach((button) => {
      if (onButtonPress) {
        onButtonPress(button, position, currentButtons);
      }
    });

    // Detect newly released buttons
    const newlyReleased = previousButtons.filter(
      (button) => !currentButtons.includes(button)
    );
    newlyReleased.forEach((button) => {
      if (onButtonRelease) {
        onButtonRelease(button, position, currentButtons);
      }
    });

    // Detect any change in button state
    if (newlyPressed.length > 0 || newlyReleased.length > 0) {
      if (onButtonsChange) {
        onButtonsChange(currentButtons, position);
      }
    }

    // Update previous state
    previousPressedButtonsRef.current = [...currentButtons];
  }, [
    pressedButtons,
    position,
    enabled,
    onButtonPress,
    onButtonRelease,
    onButtonsChange,
  ]);

  // Handle double clicks
  useEffect(() => {
    if (!enabled || !doubleClick || !isHoveredRef.current) return;

    if (onDoubleClick) {
      onDoubleClick(doubleClick.button, doubleClick.position);
    }
  }, [doubleClick, enabled, onDoubleClick]);

  // Handle drag start
  useEffect(() => {
    if (!enabled || !dragStart) return;

    // Check if the drag actually started within this Interactive component's bounds
    if (!componentUnderPointer) return;

    const actualProps = componentUnderPointer.props;
    const spriteX = actualProps.x || 0;
    const spriteY = actualProps.y || 0;
    const spriteWidth = actualProps.width || 32;
    const spriteHeight = actualProps.height || 32;

    const dragStartedInBounds =
      componentUnderPointer.type === "sprite" &&
      dragStart.startPosition.x >= spriteX &&
      dragStart.startPosition.x <= spriteX + spriteWidth &&
      dragStart.startPosition.y >= spriteY &&
      dragStart.startPosition.y <= spriteY + spriteHeight;

    if (dragStartedInBounds && onDragStart) {
      isDraggingThisRef.current = true; // Mark this Interactive as the active dragger
      onDragStart(dragStart);
    }
  }, [dragStart, enabled, onDragStart, componentUnderPointer]);

  // Handle drag end
  useEffect(() => {
    if (!enabled || !dragEnd || !isDraggingThisRef.current) return;

    isDraggingThisRef.current = false; // Reset the drag state
    if (onDragEnd) {
      onDragEnd(dragEnd);
    }
  }, [dragEnd, enabled, onDragEnd]);

  // Handle ongoing drag
  useEffect(() => {
    if (!enabled || !currentDrag || !isDraggingThisRef.current) return;

    if (onDrag) {
      onDrag(currentDrag);
    }
  }, [currentDrag, enabled, onDrag]);

  // Return the children unchanged - Interactive is a behavioral wrapper
  return children;
}
