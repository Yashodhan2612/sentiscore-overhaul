/**
 * ShortcutOverlay — full-screen keyboard shortcut reference.
 * Opens on "?" keypress (via key-action event) or from the "?" chip in the bottom-left.
 * Closes on "?" again or Escape.
 */

import { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  {
    section: "Navigation",
    items: [
      { keys: ["g", "b"], label: "Morning Brief" },
      { keys: ["g", "w"], label: "Book (Watchlist)" },
      { keys: ["g", "s"], label: "Screener" },
      { keys: ["g", "c"], label: "Calendar" },
      { keys: ["g", "a"], label: "Alerts" },
      { keys: ["g", "r"], label: "Reports" },
      { keys: ["g", "p"], label: "Profile" },
    ],
  },
  {
    section: "Global",
    items: [
      { keys: ["/"], label: "Jump to ticker" },
      { keys: ["⌘", "K"], label: "Command palette" },
      { keys: ["?"], label: "Toggle shortcut overlay" },
      { keys: ["t"], label: "Toggle theme" },
      { keys: ["Esc"], label: "Close modal / clear focus" },
    ],
  },
  {
    section: "Lists (Book, Companies, Alerts, Reports)",
    items: [
      { keys: ["j"], label: "Move focus down" },
      { keys: ["k"], label: "Move focus up" },
      { keys: ["Enter"], label: "Open focused item" },
      { keys: ["x"], label: "Dismiss / remove focused item" },
      { keys: ["a"], label: "Add ticker (Book)" },
      { keys: ["n"], label: "New rule (Alerts)" },
      { keys: ["d"], label: "Download focused report" },
      { keys: ["v"], label: "Toggle table / grid view" },
    ],
  },
  {
    section: "Company Analysis",
    items: [
      { keys: ["1–8"], label: "Jump to sub-tab" },
      { keys: ["["], label: "Previous quarter" },
      { keys: ["]"], label: "Next quarter" },
    ],
  },
  {
    section: "Comparison",
    items: [
      { keys: ["i"], label: "Toggle raw / indexed view" },
      { keys: ["b"], label: "Toggle best/worst highlights" },
      { keys: ["o"], label: "Toggle outlier markers" },
      { keys: ["c"], label: "Compare selected (Screener)" },
      { keys: ["Space"], label: "Select for comparison" },
    ],
  },
];

const Kbd = ({ k }: { k: string }) => (
  <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[22px] rounded bg-surface-elevated border border-border text-text-secondary font-mono text-xs">
    {k}
  </kbd>
);

const ShortcutOverlay = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      if (action === "shortcut-overlay") setOpen(prev => !prev);
      if (action === "escape" && open) setOpen(false);
    };
    document.addEventListener("key-action", handler);
    return () => document.removeEventListener("key-action", handler);
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="fixed bottom-4 left-4 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border text-text-tertiary hover:text-foreground text-xs shadow-md transition-colors"
      >
        <Keyboard className="h-3 w-3" />
        <kbd className="font-mono text-xs">?</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Keyboard Shortcuts</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">Works outside text inputs · <kbd className="px-1 py-0.5 rounded bg-surface-elevated border border-border font-mono text-xs">?</kbd> to toggle</span>
            <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SHORTCUTS.map(section => (
            <div key={section.section}>
              <div className="th-label mb-3">{section.section}</div>
              <div className="space-y-2">
                {section.items.map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-text-secondary">{item.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-text-tertiary text-xs">then</span>}
                          <Kbd k={k} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutOverlay;
