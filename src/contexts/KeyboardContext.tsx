/**
 * KeyboardContext — global keyboard navigation state
 *
 * Exposes:
 *  - altPressed:  whether the user is holding Alt/Option (reveals kbd hints)
 *  - currentPage: the active page scope, set by each page on mount
 * And dispatches a custom DOM event "key-action" with { action: string }
 * that page-level handlers can subscribe to.
 */

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface KeyboardContextValue {
  altPressed: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const KeyboardContext = createContext<KeyboardContextValue>({
  altPressed: false,
  currentPage: "",
  setCurrentPage: () => {},
});

export const useKeyboard = () => useContext(KeyboardContext);

// NAV_MAP: two-char "g" sequences → routes
const NAV_MAP: Record<string, string> = {
  "gb": "/brief",
  "gw": "/book",
  "gs": "/companies",
  "gc": "/calendar",
  "ga": "/alerts",
  "gr": "/reports",
  "gp": "/profile",
};

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const [altPressed, setAltPressed] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Track Alt hold
      if (e.key === "Alt") setAltPressed(true);

      const target = e.target as HTMLElement;
      const inInput = target.matches("input,textarea,select,[contenteditable]");

      // Allow Esc everywhere
      if (e.key === "Escape" && !inInput) {
        document.dispatchEvent(new CustomEvent("key-action", { detail: { action: "escape" } }));
        return;
      }

      // Skip all other shortcuts when in text input
      if (inInput) return;

      // "?" — open shortcut overlay
      if (e.key === "?") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("key-action", { detail: { action: "shortcut-overlay" } }));
        return;
      }

      // "t" — toggle theme
      if (e.key === "t") {
        document.dispatchEvent(new CustomEvent("key-action", { detail: { action: "toggle-theme" } }));
        return;
      }

      // "g" prefix navigation
      if (e.key === "g") {
        e.preventDefault();
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => { gPending.current = false; }, 600);
        return;
      }

      if (gPending.current) {
        gPending.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        const combo = "g" + e.key;
        if (NAV_MAP[combo]) {
          e.preventDefault();
          navigate(NAV_MAP[combo]);
          return;
        }
      }

      // Page-level actions — dispatch for pages to handle
      const pageKeys = ["j", "k", "a", "x", "n", "d", "v", "c", "i", "b", "o", "f",
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "[", "]"];
      if (pageKeys.includes(e.key)) {
        document.dispatchEvent(new CustomEvent("key-action", { detail: { action: e.key } }));
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [navigate]);

  return (
    <KeyboardContext.Provider value={{ altPressed, currentPage, setCurrentPage }}>
      {children}
    </KeyboardContext.Provider>
  );
};
