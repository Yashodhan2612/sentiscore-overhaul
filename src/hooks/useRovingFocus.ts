/**
 * useRovingFocus — keyboard j/k (or ↑/↓) navigation for list containers.
 *
 * Usage:
 *   const { focusedIndex, setFocusedIndex, getRowProps } = useRovingFocus(items.length);
 *   <tr {...getRowProps(index)} />
 *
 * The hook:
 *  - Listens to the global "key-action" event for j/k/ArrowDown/ArrowUp/Enter/x
 *  - Calls onEnter(index) when Enter is pressed on the focused row
 *  - Calls onDismiss(index) when x is pressed on the focused row
 *  - Auto-scrolls the focused element into view
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface Options {
  count: number;
  onEnter?: (index: number) => void;
  onDismiss?: (index: number) => void;
  active?: boolean; // whether this roving focus instance should respond to events
}

export const useRovingFocus = ({ count, onEnter, onDismiss, active = true }: Options) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!active || count === 0) return;

    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      setFocusedIndex(prev => {
        if (action === "j" || action === "ArrowDown") {
          const next = prev < count - 1 ? prev + 1 : 0;
          return next;
        }
        if (action === "k" || action === "ArrowUp") {
          const next = prev > 0 ? prev - 1 : count - 1;
          return next;
        }
        if (action === "Enter" && prev >= 0 && onEnter) {
          onEnter(prev);
        }
        if (action === "x" && prev >= 0 && onDismiss) {
          onDismiss(prev);
        }
        if (action === "escape") return -1;
        return prev;
      });
    };

    document.addEventListener("key-action", handler);
    return () => document.removeEventListener("key-action", handler);
  }, [active, count, onEnter, onDismiss]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedIndex >= 0 && rowRefs.current[focusedIndex]) {
      rowRefs.current[focusedIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  const getRowProps = useCallback((index: number) => ({
    tabIndex: focusedIndex === index ? 0 : -1,
    ref: (el: HTMLElement | null) => { rowRefs.current[index] = el; },
    "data-focused": focusedIndex === index ? "true" : undefined,
    className: focusedIndex === index ? "outline outline-2 outline-primary/60 outline-offset-[-2px]" : "",
    onMouseEnter: () => setFocusedIndex(index),
  }), [focusedIndex]);

  return { focusedIndex, setFocusedIndex, getRowProps };
};
