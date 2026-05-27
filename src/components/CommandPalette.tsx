import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BarChart2, BookMarked, LayoutGrid, Calendar, AlarmClock, FileText, TrendingUp, Search } from "lucide-react";

const TICKERS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","JPM","GS","BAC","NFLX","DIS","V","MA","UNH"];
const NAMES: Record<string, string> = {
  AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.", NVDA: "NVIDIA Corp.", META: "Meta Platforms",
  TSLA: "Tesla Inc.", JPM: "JPMorgan Chase", GS: "Goldman Sachs",
  BAC: "Bank of America", NFLX: "Netflix Inc.", DIS: "Walt Disney Co.",
  V: "Visa Inc.", MA: "Mastercard Inc.", UNH: "UnitedHealth Group",
};

const NAV = [
  { label: "Morning Brief", href: "/brief", icon: BarChart2, desc: "Overnight changes on your book" },
  { label: "Book / Watchlist", href: "/book", icon: BookMarked, desc: "Your tracked positions" },
  { label: "Screener", href: "/companies", icon: LayoutGrid, desc: "Filter all covered names" },
  { label: "Earnings Calendar", href: "/calendar", icon: Calendar, desc: "Upcoming earnings dates" },
  { label: "Alerts", href: "/alerts", icon: AlarmClock, desc: "Active triggered alerts" },
  { label: "Reports", href: "/reports", icon: FileText, desc: "Saved and generated reports" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.toLowerCase();

  const matchedTickers = TICKERS.filter(t =>
    t.toLowerCase().includes(q) || (NAMES[t] || "").toLowerCase().includes(q)
  ).slice(0, 6);

  const matchedNav = NAV.filter(n =>
    n.label.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q)
  );

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg bg-popover border-border overflow-hidden top-[20%] translate-y-0">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
          <Search className="h-4 w-4 text-text-tertiary shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tickers, pages, actions..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-tertiary outline-none font-mono"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-text-tertiary font-mono text-xxs">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {/* Tickers */}
          {matchedTickers.length > 0 && (
            <div>
              <div className="px-3 py-1.5 th-label">Tickers</div>
              {matchedTickers.map(t => (
                <button
                  key={t}
                  onClick={() => go(`/company/${t}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-elevated transition-colors"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-info shrink-0" />
                  <span className="ticker-badge text-primary w-12 text-left">{t}</span>
                  <span className="text-xs text-text-secondary truncate">{NAMES[t]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Nav pages */}
          {matchedNav.length > 0 && (
            <div>
              <div className="px-3 py-1.5 th-label">Pages</div>
              {matchedNav.map(n => (
                <button
                  key={n.href}
                  onClick={() => go(n.href)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-elevated transition-colors"
                >
                  <n.icon className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                  <span className="text-sm text-foreground">{n.label}</span>
                  <span className="text-xs text-text-tertiary ml-auto">{n.desc}</span>
                </button>
              ))}
            </div>
          )}

          {q && matchedTickers.length === 0 && matchedNav.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-text-tertiary">
              No results for "{query}"
            </div>
          )}

          {!q && (
            <div className="px-3 py-3 flex flex-wrap gap-1.5">
              {["g b", "g s", "g w", "g a", "1-7", "j/k", "⌘K"].map(k => (
                <span key={k} className="px-2 py-1 rounded bg-surface-elevated border border-border text-text-tertiary font-mono" style={{fontSize:"10px"}}>
                  {k}
                </span>
              ))}
              <span className="text-xs text-text-tertiary self-center ml-1">keyboard shortcuts</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
