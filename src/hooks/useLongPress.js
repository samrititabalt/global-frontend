import { useRef, useCallback } from 'react';

/**
 * Hook for detecting long press gestures
 * @param {Function} onLongPress - Callback for long press
 * @param {Number} delay - Delay in ms (default: 500)
 */
export const useLongPress = (onLongPress, delay = 500) => {
  const timeoutRef = useRef(null);
  const targetRef = useRef(null);

  const start = useCallback((event) => {
    if (onLongPress) {
      timeoutRef.current = setTimeout(() => {
        onLongPress(event);
      }, delay);
      targetRef.current = event.target;
    }
  }, [onLongPress, delay]);

  const clear = useCallback((event) => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    // Prevent click if long press was triggered
    if (targetRef.current === event.target && timeoutRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
};
