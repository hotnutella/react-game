import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useGameLoop } from "../../hooks";

// Animation properties that can be animated
export interface AnimatableProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  alpha?: number;
  [key: string]: number | undefined;
}

// Easing function type
export type EasingFunction = (t: number) => number;

// Built-in easing functions
export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

export interface AnimationProps {
  from: AnimatableProps;
  to: AnimatableProps;
  duration: number; // in seconds
  easing?: EasingFunction;
  autoStart?: boolean;
  loop?: boolean;
  reverse?: boolean;
  delay?: number; // in seconds
  onComplete?: () => void;
  onUpdate?: (progress: number, currentValues: AnimatableProps) => void;
  children: React.ReactElement;
}

// Animation control methods exposed via ref
export interface AnimationControls {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  isPlaying: () => boolean;
  getCurrentProgress: () => number;
  getCurrentValues: () => AnimatableProps;
}

export const Animation = forwardRef<AnimationControls, AnimationProps>(
  (
    {
      from,
      to,
      duration,
      easing = Easing.linear,
      autoStart = true,
      loop = false,
      reverse = false,
      delay = 0,
      onComplete,
      onUpdate,
      children,
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(autoStart);
    const [currentValues, setCurrentValues] = useState<AnimatableProps>(from);
    const elapsedTimeRef = useRef(0);
    const delayTimeRef = useRef(0);
    const isReversingRef = useRef(false);
    const hasStartedRef = useRef(false);

    // Reset animation
    const reset = useCallback(() => {
      elapsedTimeRef.current = 0;
      delayTimeRef.current = 0;
      isReversingRef.current = false;
      hasStartedRef.current = false;
      setCurrentValues(from);
    }, [from]);

    // Start animation
    const start = useCallback(() => {
      if (!hasStartedRef.current) {
        reset();
      }
      setIsPlaying(true);
    }, [reset]);

    // Stop animation
    const stop = useCallback(() => {
      setIsPlaying(false);
    }, []);

    // Pause animation
    const pause = useCallback(() => {
      setIsPlaying(false);
    }, []);

    // Resume animation
    const resume = useCallback(() => {
      setIsPlaying(true);
    }, []);

    // Interpolate between two values
    const interpolate = useCallback(
      (startValue: number, endValue: number, progress: number) => {
        return startValue + (endValue - startValue) * progress;
      },
      []
    );

    // Animation loop
    const animationLoop = useCallback(
      (deltaTime: number) => {
        if (!isPlaying) return;

        // Handle delay
        if (delayTimeRef.current < delay) {
          delayTimeRef.current += deltaTime;
          return;
        }

        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
        }

        // Update elapsed time
        elapsedTimeRef.current += deltaTime;

        // Calculate progress (0 to 1)
        let progress = Math.min(elapsedTimeRef.current / duration, 1);

        // Apply easing
        const easedProgress = easing(progress);

        // Calculate current values based on direction
        const newValues: AnimatableProps = {};
        const isGoingReverse = reverse && isReversingRef.current;
        const sourceValues = isGoingReverse ? to : from;
        const targetValues = isGoingReverse ? from : to;

        for (const key in targetValues) {
          const startValue = sourceValues[key] ?? 0;
          const endValue = targetValues[key] ?? 0;
          newValues[key] = interpolate(startValue, endValue, easedProgress);
        }

        setCurrentValues(newValues);

        // Call update callback
        if (onUpdate) {
          onUpdate(progress, newValues);
        }

        // Check if animation is complete
        if (elapsedTimeRef.current >= duration) {
          if (reverse) {
            if (loop) {
              // Reverse loop: flip direction and continue
              isReversingRef.current = !isReversingRef.current;
              elapsedTimeRef.current = 0;
            } else if (!isReversingRef.current) {
              // Single reverse: go backwards once
              isReversingRef.current = true;
              elapsedTimeRef.current = 0;
            } else {
              // Reverse complete
              setIsPlaying(false);
              if (onComplete) {
                onComplete();
              }
            }
          } else if (loop) {
            // Regular loop: restart from beginning
            elapsedTimeRef.current = 0;
          } else {
            // Single animation complete
            setIsPlaying(false);
            if (onComplete) {
              onComplete();
            }
          }
        }
      },
      [
        isPlaying,
        delay,
        duration,
        reverse,
        easing,
        from,
        to,
        interpolate,
        onUpdate,
        onComplete,
        loop,
      ]
    );

    useGameLoop(animationLoop);

    // Expose animation controls via ref
    useImperativeHandle(
      ref,
      () => ({
        start,
        stop,
        pause,
        resume,
        reset,
        isPlaying: () => isPlaying,
        getCurrentProgress: () => {
          return Math.min(elapsedTimeRef.current / duration, 1);
        },
        getCurrentValues: () => currentValues,
      }),
      [start, stop, pause, resume, reset, isPlaying, duration, currentValues]
    );

    // Clone child element with animated props
    const animatedChild = React.cloneElement(children, {
      ...children.props,
      ...currentValues,
    });

    return animatedChild;
  }
);

// Export animation component
export default Animation;
