import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "./useGameLoop";

// Interface for keyboard hook return value
export interface KeyboardState {
  pressedKeys: string[];
  releasedKeys: string[];
}

// Hook for tracking keyboard input
export function useKeyboard(): KeyboardState {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [releasedKeys, setReleasedKeys] = useState<string[]>([]);
  const releasedKeysRef = useRef<string[]>([]);

  // Clear released keys after one frame
  useGameLoop(useCallback(() => {
    if (releasedKeysRef.current.length > 0) {
      setReleasedKeys([]);
      releasedKeysRef.current = [];
    }
  }, []));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Prevent duplicate additions
      setPressedKeys(prev => {
        if (!prev.includes(key)) {
          return [...prev, key];
        }
        return prev;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Remove from pressed keys and add to released keys
      setPressedKeys(prev => prev.filter(k => k !== key));
      
      // Add to released keys (will be cleared next frame)
      setReleasedKeys(prev => {
        if (!prev.includes(key)) {
          const newReleased = [...prev, key];
          releasedKeysRef.current = newReleased;
          return newReleased;
        }
        return prev;
      });
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    pressedKeys,
    releasedKeys,
  };
}
