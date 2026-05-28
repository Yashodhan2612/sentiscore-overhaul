/**
 * KbdHint — renders a keyboard shortcut badge next to its child when Alt is held.
 *
 * Usage:
 *   <KbdHint k="a"><Button>Add ticker</Button></KbdHint>
 *
 * The hint appears as an absolutely-positioned <kbd> chip, so the child layout
 * is never shifted. Wrap the usage site in `relative` if needed.
 */

import { type ReactNode } from "react";
import { useKeyboard } from "@/contexts/KeyboardContext";

interface KbdHintProps {
  k: string;
  children: ReactNode;
  position?: "top-right" | "bottom-right" | "top-left";
  className?: string;
}

const KbdHint = ({ k, children, position = "top-right", className = "" }: KbdHintProps) => {
  const { altPressed } = useKeyboard();

  const posClass = {
    "top-right": "-top-2 -right-2",
    "bottom-right": "-bottom-2 -right-2",
    "top-left": "-top-2 -left-2",
  }[position];

  return (
    <span className={`relative inline-flex ${className}`}>
      {children}
      {altPressed && (
        <kbd
          className={`absolute ${posClass} z-50 px-1 py-0.5 rounded bg-primary text-primary-foreground font-mono pointer-events-none`}
          style={{ fontSize: "9px", lineHeight: 1.4 }}
        >
          {k}
        </kbd>
      )}
    </span>
  );
};

export default KbdHint;
