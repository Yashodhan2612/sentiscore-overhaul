import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowUpRight, ArrowDownRight, Plus, X, LayoutGrid, Table2, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { getESSColor, getESSBg, ESS_FORMULA_LABEL } from "@/lib/ess";
import { useRovingFocus } from "@/hooks/useRovingFocus";
import KbdHint from "@/components/KbdHint";

const INITIAL_WATCHLIST = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", ess: 78, essDelta: +2, toneGap: 27, added: "Oct 1" },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", ess: 84, essDelta: +5, toneGap: 14, added: "Sep 15" },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors", ess: 91, essDelta: +8, toneGap: 9, added: "Aug 20" },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", ess: 72, essDelta: -3, toneGap: 31, added: "Oct 5" },
  { ticker: "META", name: "Meta Platforms", sector: "Technology", ess: 79, essDelta: +1, toneGap: 18, added: "Sep 28" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", ess: 65, essDelta: -4, toneGap: 22, added: "Oct 10" },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary", ess: 58, essDelta: +6, toneGap: 42, added: "Oct 12" },
  { ticker: "GS", name: "Goldman Sachs", sector: "Financials", ess: 73, essDelta: +2, toneGap: 16, added: "Sep 30" },
];

// Universe to search against when adding tickers
const TICKER_UNIVERSE = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", ess: 78, essDelta: +2, toneGap: 27 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", ess: 84, essDelta: +5, toneGap: 14 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors", ess: 91, essDelta: +8, toneGap: 9 },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", ess: 72, essDelta: -3, toneGap: 31 },
  { ticker: "META", name: "Meta Platforms", sector: "Technology", ess: 79, essDelta: +1, toneGap: 18 },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", ess: 65, essDelta: -4, toneGap: 22 },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary", ess: 58, essDelta: +6, toneGap: 42 },
  { ticker: "GS", name: "Goldman Sachs", sector: "Financials", ess: 73, essDelta: +2, toneGap: 16 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", ess: 75, essDelta: +1, toneGap: 19 },
  { ticker: "V", name: "Visa Inc.", sector: "Financials", ess: 77, essDelta: +1, toneGap: 11 },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Communication", ess: 80, essDelta: +3, toneGap: 12 },
  { ticker: "INTC", name: "Intel Corp.", sector: "Semiconductors", ess: 44, essDelta: -6, toneGap: 38 },
  { ticker: "BAC", name: "Bank of America", sector: "Financials", ess: 61, essDelta: -2, toneGap: 25 },
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", ess: 69, essDelta: -2, toneGap: 20 },
  { ticker: "EXXON", name: "ExxonMobil Corp.", sector: "Energy", ess: 67, essDelta: +1, toneGap: 17 },
];

type WatchItem = typeof INITIAL_WATCHLIST[0];

const Book = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [watchlist, setWatchlist] = useState<WatchItem[]>(INITIAL_WATCHLIST);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const alreadyInBook = new Set(watchlist.map(w => w.ticker));

  const filteredUniverse = TICKER_UNIVERSE.filter(t => {
    if (alreadyInBook.has(t.ticker)) return false;
    if (!searchQuery) return true;
    return (
      t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const addTicker = (item: typeof TICKER_UNIVERSE[0]) => {
    const now = new Date();
    const added = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setWatchlist(prev => [...prev, { ...item, added }]);
    toast.success(`${item.ticker} added to Book`, {
      description: item.name,
    });
    // Keep dialog open to allow adding more
    setSearchQuery("");
  };

  const removeTicker = (ticker: string) => {
    const item = watchlist.find(w => w.ticker === ticker);
    setWatchlist(prev => prev.filter(w => w.ticker !== ticker));
    toast(`${ticker} removed from Book`, {
      description: item?.name,
    });
  };

  // Roving focus for the table
  const { getRowProps } = useRovingFocus({
    count: watchlist.length,
    active: !addOpen,
    onEnter: (i) => navigate(`/company/${watchlist[i].ticker}`),
    onDismiss: (i) => removeTicker(watchlist[i].ticker),
  });

  // Page-level shortcuts
  useEffect(() => {
    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      if (action === "a" && !addOpen) { setAddOpen(true); setSearchQuery(""); }
      if (action === "v") setViewMode(m => m === "table" ? "grid" : "table");
    };
    document.addEventListener("key-action", handler);
    return () => document.removeEventListener("key-action", handler);
  }, [addOpen]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">Book</h1>
          <p className="text-xs text-text-tertiary mt-0.5">{watchlist.length} positions tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-card border border-border rounded overflow-hidden">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-8 p-0 rounded-none"
              onClick={() => setViewMode("table")}
            >
              <Table2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-8 p-0 rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>
          <KbdHint k="a">
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => { setAddOpen(true); setSearchQuery(""); }}
            >
              <Plus className="h-3.5 w-3.5" /> Add ticker
            </Button>
          </KbdHint>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 th-label">Ticker</th>
                <th className="text-left px-3 py-2 th-label">Sector</th>
                <th className="text-right px-3 py-2 th-label">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 cursor-default">
                          ESS <Info className="h-3 w-3 text-text-tertiary" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-48">
                        {ESS_FORMULA_LABEL}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="text-right px-3 py-2 th-label">Δ 7d</th>
                <th className="text-right px-3 py-2 th-label">Tone Gap</th>
                <th className="text-left px-3 py-2 th-label">Added</th>
                <th className="px-2 py-2 th-label w-8"></th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((row, idx) => {
                const rowProps = getRowProps(idx);
                return (
                <tr key={row.ticker} {...rowProps as any} className={`border-b border-border last:border-0 hover:bg-surface-elevated transition-colors group ${rowProps.className}`}>
                  <td className="px-3 py-2.5">
                    <Link to={`/company/${row.ticker}`} className="flex flex-col">
                      <span className="ticker-badge text-primary">{row.ticker}</span>
                      <span className="text-xs text-text-tertiary">{row.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-secondary">{row.sector}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`score-num text-sm ${getESSColor(row.ess)}`}>{row.ess}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs flex items-center justify-end gap-0.5 ${row.essDelta > 0 ? "delta-pos" : row.essDelta < 0 ? "delta-neg" : "delta-muted"}`}>
                      {row.essDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {row.essDelta > 0 ? "+" : ""}{row.essDelta}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs ${row.toneGap >= 30 ? "text-negative" : row.toneGap >= 20 ? "text-caution" : "text-text-tertiary"}`}>
                      {row.toneGap}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-tertiary">{row.added}</td>
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => removeTicker(row.ticker)}
                      className="text-text-tertiary hover:text-negative transition-colors opacity-0 group-hover:opacity-100"
                      title={`Remove ${row.ticker}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {watchlist.map(row => (
            <div key={row.ticker} className="relative group">
              <Link
                to={`/company/${row.ticker}`}
                className={`p-4 rounded border ${getESSBg(row.ess)} hover:border-primary/40 transition-colors block`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="ticker-badge text-primary">{row.ticker}</span>
                  <span className={`font-mono text-xs ${row.essDelta > 0 ? "delta-pos" : "delta-neg"}`}>
                    {row.essDelta > 0 ? "+" : ""}{row.essDelta}
                  </span>
                </div>
                <div className={`score-num text-3xl ${getESSColor(row.ess)} mb-1`}>{row.ess}</div>
                <div className="text-xxs text-text-tertiary th-label">ESS</div>
                <div className="mt-3 text-xs text-text-secondary truncate">{row.name}</div>
                <div className="text-xxs text-text-tertiary mt-0.5">{row.sector}</div>
              </Link>
              <button
                onClick={() => removeTicker(row.ticker)}
                className="absolute top-2 right-2 text-text-tertiary hover:text-negative transition-colors opacity-0 group-hover:opacity-100 bg-card rounded p-0.5"
                title={`Remove ${row.ticker}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => { setAddOpen(true); setSearchQuery(""); }}
            className="p-4 rounded border border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-text-tertiary hover:text-primary"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add ticker</span>
          </button>
        </div>
      )}

      {/* Add Ticker Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add to Book</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Search and add tickers to your watchlist
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-border rounded">
              <Search className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticker or company..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-tertiary outline-none font-mono"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredUniverse.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-4">
                  {alreadyInBook.size === TICKER_UNIVERSE.length ? "All available tickers are already in your Book" : "No matches found"}
                </p>
              )}
              {filteredUniverse.map(t => (
                <button
                  key={t.ticker}
                  onClick={() => addTicker(t)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-surface-elevated transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="ticker-badge text-primary w-14 text-left">{t.ticker}</span>
                    <div className="text-left">
                      <div className="text-xs text-foreground">{t.name}</div>
                      <div className="text-xxs text-text-tertiary">{t.sector}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`score-num text-sm ${getESSColor(t.ess)}`}>{t.ess}</span>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">+ Add</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Book;
