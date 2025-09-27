import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";
import { getCurrentCanvas, getComponentAtPosition } from "../reconciler";

// Interface for mouse position coordinates
export interface MousePosition {
  x: number;
  y: number;
}

// Interface for mouse movement data
export interface MouseMovement {
  from: MousePosition;
  to: MousePosition;
  delta: MousePosition;
}

// Interface for drag event data
export interface DragEvent {
  startPosition: MousePosition;
  currentPosition: MousePosition;
  delta: MousePosition;
  button: number;
}

// Interface for mouse hook return value
export interface MouseState {
  position: MousePosition;
  movement: MouseMovement | null;
  pressedButtons: number[];
  releasedButtons: number[];
  doubleClick: { button: number; position: MousePosition } | null;
  isDragging: boolean;
  dragStart: DragEvent | null;
  dragEnd: DragEvent | null;
  currentDrag: DragEvent | null;
  componentUnderPointer: any | null; // The ReactGame component under the mouse pointer
}

// Mouse button constants for easier reference
export const MouseButtons = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
  BACK: 3,
  FORWARD: 4,
} as const;

// Hook for tracking mouse input and movement
export function useMouse(): MouseState {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [movement, setMovement] = useState<MouseMovement | null>(null);
  const [pressedButtons, setPressedButtons] = useState<number[]>([]);
  const [releasedButtons, setReleasedButtons] = useState<number[]>([]);
  const [doubleClick, setDoubleClick] = useState<{ button: number; position: MousePosition } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragEvent | null>(null);
  const [dragEnd, setDragEnd] = useState<DragEvent | null>(null);
  const [currentDrag, setCurrentDrag] = useState<DragEvent | null>(null);
  const [componentUnderPointer, setComponentUnderPointer] = useState<any | null>(null);
  
  const previousPositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const releasedButtonsRef = useRef<number[]>([]);
  const movementRef = useRef<MouseMovement | null>(null);
  const doubleClickRef = useRef<{ button: number; position: MousePosition } | null>(null);
  const dragStartRef = useRef<DragEvent | null>(null);
  const dragEndRef = useRef<DragEvent | null>(null);
  
  // State refs to avoid stale closures
  const pressedButtonsRef = useRef<number[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  
  // Double-click detection state
  const lastClickTimeRef = useRef<number>(0);
  const lastClickButtonRef = useRef<number>(-1);
  const lastClickPositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  
  // Drag detection state
  const dragStartPositionRef = useRef<MousePosition | null>(null);
  const dragButtonRef = useRef<number>(-1);
  const dragThreshold = 5; // pixels to move before considering it a drag
  const doubleClickThreshold = 300; // milliseconds for double-click detection

  // Helper function to convert window coordinates to canvas coordinates
  const getCanvasPosition = useCallback((clientX: number, clientY: number): MousePosition => {
    const canvas = getCurrentCanvas();
    if (!canvas) {
      return { x: clientX, y: clientY };
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Clear one-frame events after one frame
  useGameLoop(useCallback(() => {
    if (releasedButtonsRef.current.length > 0) {
      setReleasedButtons([]);
      releasedButtonsRef.current = [];
    }
    
    // Clear movement after one frame to ensure it's only available for one frame
    if (movementRef.current) {
      setMovement(null);
      movementRef.current = null;
    }
    
    // Clear double-click after one frame
    if (doubleClickRef.current) {
      setDoubleClick(null);
      doubleClickRef.current = null;
    }
    
    // Clear drag start event after one frame
    if (dragStartRef.current) {
      setDragStart(null);
      dragStartRef.current = null;
    }
    
    // Clear drag end event after one frame
    if (dragEndRef.current) {
      setDragEnd(null);
      dragEndRef.current = null;
    }
  }, []));

  useEffect(() => {
    const canvas = getCurrentCanvas();
    if (!canvas) {
      console.warn("useMouse: No canvas found. Make sure you're using it within a ReactGame context.");
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const newPosition = getCanvasPosition(event.clientX, event.clientY);
      const prevPosition = previousPositionRef.current;
      
      // Calculate movement data
      const newMovement: MouseMovement = {
        from: { ...prevPosition },
        to: { ...newPosition },
        delta: {
          x: newPosition.x - prevPosition.x,
          y: newPosition.y - prevPosition.y
        }
      };
      
      // Only set movement if there was actual movement
      if (newMovement.delta.x !== 0 || newMovement.delta.y !== 0) {
        setMovement(newMovement);
        movementRef.current = newMovement;
      }
      
      // Handle drag detection and updates
      if (dragStartPositionRef.current && dragButtonRef.current !== -1) {
        const dragDistance = Math.sqrt(
          Math.pow(newPosition.x - dragStartPositionRef.current.x, 2) +
          Math.pow(newPosition.y - dragStartPositionRef.current.y, 2)
        );
        
        // Start dragging if we've moved beyond threshold
        if (!isDraggingRef.current && dragDistance > dragThreshold) {
          setIsDragging(true);
          isDraggingRef.current = true;
          const dragStartEvent: DragEvent = {
            startPosition: { ...dragStartPositionRef.current },
            currentPosition: { ...newPosition },
            delta: {
              x: newPosition.x - dragStartPositionRef.current.x,
              y: newPosition.y - dragStartPositionRef.current.y
            },
            button: dragButtonRef.current
          };
          setDragStart(dragStartEvent);
          dragStartRef.current = dragStartEvent;
        }
        
        // Update current drag if we're already dragging
        if (isDraggingRef.current) {
          const currentDragEvent: DragEvent = {
            startPosition: { ...dragStartPositionRef.current },
            currentPosition: { ...newPosition },
            delta: {
              x: newPosition.x - dragStartPositionRef.current.x,
              y: newPosition.y - dragStartPositionRef.current.y
            },
            button: dragButtonRef.current
          };
          setCurrentDrag(currentDragEvent);
        }
      }
      
      setPosition(newPosition);
      previousPositionRef.current = newPosition;
      
      // Update component under pointer
      const component = getComponentAtPosition(newPosition.x, newPosition.y);
      
      // Only update state if component actually changed to prevent unnecessary re-renders
      setComponentUnderPointer((prevComponent: any) => {
        
        // Handle null cases (background)
        if (!component && !prevComponent) {
          return prevComponent; // Stay null, no change
        }
        if (!component && prevComponent) {
          return null; // Changed from component to background
        }
        if (component && !prevComponent) {
          return component; // Changed from background to component
        }
        
        // Both exist, compare IDs
        if (component && prevComponent && component.id === prevComponent.id) {
          return prevComponent; // Same component, no change
        }
        
        return component; // Different component
      });
    };

    const handleMouseDown = (event: MouseEvent) => {
      const button = event.button;
      const currentTime = Date.now();
      const currentPosition = getCanvasPosition(event.clientX, event.clientY);
      
      // Double-click detection
      const timeSinceLastClick = currentTime - lastClickTimeRef.current;
      const isSameButton = button === lastClickButtonRef.current;
      const positionDistance = Math.sqrt(
        Math.pow(currentPosition.x - lastClickPositionRef.current.x, 2) +
        Math.pow(currentPosition.y - lastClickPositionRef.current.y, 2)
      );
      
      if (timeSinceLastClick < doubleClickThreshold && isSameButton && positionDistance < 10) {
        // Double-click detected
        const doubleClickEvent = { button, position: currentPosition };
        setDoubleClick(doubleClickEvent);
        doubleClickRef.current = doubleClickEvent;
        
        // Reset double-click detection
        lastClickTimeRef.current = 0;
        lastClickButtonRef.current = -1;
      } else {
        // Single click - store for potential double-click
        lastClickTimeRef.current = currentTime;
        lastClickButtonRef.current = button;
        lastClickPositionRef.current = currentPosition;
      }
      
      // Initialize potential drag
      dragStartPositionRef.current = currentPosition;
      dragButtonRef.current = button;
      
      // Prevent duplicate additions
      setPressedButtons(prev => {
        if (!prev.includes(button)) {
          const newPressed = [...prev, button];
          pressedButtonsRef.current = newPressed;
          return newPressed;
        }
        return prev;
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      const button = event.button;
      const currentPosition = getCanvasPosition(event.clientX, event.clientY);
      
      // Handle drag end
      if (isDraggingRef.current && button === dragButtonRef.current && dragStartPositionRef.current) {
        const dragEndEvent: DragEvent = {
          startPosition: { ...dragStartPositionRef.current },
          currentPosition: currentPosition,
          delta: {
            x: currentPosition.x - dragStartPositionRef.current.x,
            y: currentPosition.y - dragStartPositionRef.current.y
          },
          button: button
        };
        setDragEnd(dragEndEvent);
        dragEndRef.current = dragEndEvent;
        setIsDragging(false);
        isDraggingRef.current = false;
        setCurrentDrag(null);
      }
      
      // Reset drag state for this button
      if (button === dragButtonRef.current) {
        dragStartPositionRef.current = null;
        dragButtonRef.current = -1;
      }
      
      // Remove from pressed buttons and add to released buttons
      setPressedButtons(prev => {
        const newPressed = prev.filter(b => b !== button);
        pressedButtonsRef.current = newPressed;
        return newPressed;
      });
      
      // Add to released buttons (will be cleared next frame)
      setReleasedButtons(prev => {
        if (!prev.includes(button)) {
          const newReleased = [...prev, button];
          releasedButtonsRef.current = newReleased;
          return newReleased;
        }
        return prev;
      });
    };

    const handleMouseLeave = () => {
      // Clear all pressed buttons when mouse leaves the window
      const currentPressed = pressedButtonsRef.current;
      if (currentPressed.length > 0) {
        setPressedButtons([]);
        pressedButtonsRef.current = [];
        setReleasedButtons(prev => {
          const newReleased = [...prev, ...currentPressed.filter(b => !prev.includes(b))];
          releasedButtonsRef.current = newReleased;
          return newReleased;
        });
      }
      
      // End any active drag
      if (isDraggingRef.current && dragStartPositionRef.current) {
        const currentPosition = previousPositionRef.current;
        const dragEndEvent: DragEvent = {
          startPosition: { ...dragStartPositionRef.current },
          currentPosition: currentPosition,
          delta: {
            x: currentPosition.x - dragStartPositionRef.current.x,
            y: currentPosition.y - dragStartPositionRef.current.y
          },
          button: dragButtonRef.current
        };
        setDragEnd(dragEndEvent);
        dragEndRef.current = dragEndEvent;
        setIsDragging(false);
        isDraggingRef.current = false;
        setCurrentDrag(null);
      }
      
      // Reset drag state
      dragStartPositionRef.current = null;
      dragButtonRef.current = -1;
    };

    const handleContextMenu = (event: Event) => {
      // Prevent context menu from appearing on right-click
      event.preventDefault();
    };

    // Add event listeners to canvas
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('contextmenu', handleContextMenu);

    // Initialize position
    const initializePosition = (event: MouseEvent) => {
      const initialPosition = getCanvasPosition(event.clientX, event.clientY);
      setPosition(initialPosition);
      previousPositionRef.current = initialPosition;
      canvas.removeEventListener('mousemove', initializePosition);
    };
    
    // Set up initial position on first mouse move
    canvas.addEventListener('mousemove', initializePosition, { once: true });

    // Cleanup function
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('mousemove', initializePosition);
    };
  }, [getCanvasPosition]);

  return {
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
  };
}
