import { useRef, useCallback, useState } from "react";

interface UseLongPressDragOptions {
  holdDuration?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

interface DragState {
  isDragging: boolean;
  isHolding: boolean;
  holdProgress: number; // 0-1
}

export function useLongPressDrag(options: UseLongPressDragOptions = {}) {
  const { holdDuration = 2000, onDragStart, onDragEnd } = options;
  const [state, setState] = useState<DragState>({
    isDragging: false,
    isHolding: false,
    holdProgress: 0,
  });

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    startTime.current = Date.now();
    setState({ isDragging: false, isHolding: true, holdProgress: 0 });

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / holdDuration, 1);
      setState((prev) => ({ ...prev, holdProgress: progress }));
    }, 16);

    holdTimer.current = setTimeout(() => {
      clearTimers();
      setState({ isDragging: true, isHolding: false, holdProgress: 1 });
      onDragStart?.();
    }, holdDuration);
  }, [holdDuration, onDragStart, clearTimers]);

  const cancelHold = useCallback(() => {
    clearTimers();
    const wasDragging = state.isDragging;
    setState({ isDragging: false, isHolding: false, holdProgress: 0 });
    if (wasDragging) {
      onDragEnd?.();
    }
  }, [clearTimers, state.isDragging, onDragEnd]);

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      // Only respond to primary button (left click / touch)
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startHold();
    },
    onPointerUp: () => {
      cancelHold();
    },
    onPointerCancel: () => {
      cancelHold();
    },
    onPointerLeave: () => {
      if (state.isHolding) {
        cancelHold();
      }
    },
  };

  return { ...state, handlers, cancelHold };
}
