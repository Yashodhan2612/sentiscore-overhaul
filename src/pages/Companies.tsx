import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Search, Table2, LayoutGrid, GitCompare, ChevronDown, ArrowUpRight, ArrowDownRight, SlidersHorizontal, X, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getESSColor, ESS_FORMULA_LABEL } from "@/lib/ess";
import { toast } from "sonner";

const COMPANIES = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", mktCap: "3.52T", ess: 78, essDelta: +2, toneGap: 27, newRisks: 0, nextEarnings: "Oct 30", inBook: true },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", mktCap: "3.11T", ess: 84, essDelta: +5, toneGap: 14, newRisks: 0, nextEarnings: "Oct 23", inBook: true },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors", mktCap: "2.15T", ess: 91, essDelta: +8, toneGap: 9, newRisks: 1, nextEarnings: "Nov 20", inBook: true },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", mktCap: "2.04T", ess: 72, essDelta: -3, toneGap: 31, newRisks: 2, nextEarnings: "Oct 29", inBook: true },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer", mktCap: "1.90T", ess: 75, essDelta: +1, toneGap: 19, newRisks: 0, nextEarnings: "Oct 30", inBook: false },
  { ticker: "META", name: "Meta Platforms", sector: "Technology", mktCap: "1.37T", ess: 79, essDelta: +1, toneGap: 18, newRisks: 0, nextEarnings: "Oct 30", inBook: true },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer", mktCap: "0.79T", ess: 58, essDelta: +6, toneGap: 42, newRisks: 3, nextEarnings: "Oct 23", inBook: true },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", mktCap: "0.62T", ess: 65, essDelta: -4, toneGap: 22, newRisks: 1, nextEarnings: "Oct 11", inBook: true },
  { ticker: "GS", name: "Goldman Sachs", sector: "Financials", mktCap: "0.17T", ess: 73, essDelta: +2, toneGap: 16, newRisks: 0, nextEarnings: "Oct 15", inBook: true },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Technology", mktCap: "0.31T", ess: 80, essDelta: +3, toneGap: 12, newRisks: 0, nextEarnings: "Oct 17", inBook: false },
  { ticker: "V", name: "Visa Inc.", sector: "Financials", mktCap: "0.55T", ess: 77, essDelta: +1, toneGap: 11, newRisks: 0, nextEarnings: "Oct 22", inBook: false },
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", mktCap: "0.43T", ess: 69, essDelta: -2, toneGap: 20, newRisks: 1, nextEarnings: "Oct 15", inBook: false },
];

type SortKey = "ess" | "essDelta" | "toneGap" | "mktCap" | "nextEarnings";

const EARNINGS_STRIP = [
  { date: "Oct 11", tickers: ["JPM", "GS", "UNH"] },
  { date: "Oct 15", tickers: ["NFLX"] },
  { date: "Oct 17", tickers: ["V"] },
  { date: "Oct 22", tickers: [] },
  { date: "Oct 23", tickers: ["MSFT", "TSLA"] },
];

const Companies = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "comparison">("table");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("ess");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sectors = ["All", ...Array.from(new Set(COMPANIES.map(c => c.sector)))];

  const toggle = (ticker: string) => {
    setSelected(s => {
      if (s.includes(ticker)) return s.filter(t => t !== ticker);
      if (s.length >= 4) {
        toast("Max 4 companies for comparison", { description: "Remove one before adding another." });
        return s;
      }
      return [...s, ticker];
    });
  };

  const setSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortKey(k); setSortDir(-1); }
  };

  const sorted = [...COMPANIES]
    .filter(c =>
      (sectorFilter === "All" || c.sector === sectorFilter) &&
      (!search || c.ticker.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortKey === "mktCap") return sortDir * (parseFloat(b.mktCap) - parseFloat(a.mktCap));
      return sortDir * ((b[sortKey] as number) - (a[sortKey] as number));
    });

  const handleCompare = () => {
    if (selected.length < 2) {
      toast("Select at least 2 companies to compare");
      return;
    }
    const [anchor, ...peers] = selected;
    navigate(`/compare?anchor=${anchor}&peers=${peers.join(",")}`);
  };

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="text-right px-3 py-2 th-label cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => setSort(k)}
    >
      {label}{sortKey === k ? (sortDir === -1 ? " ↓" : " ↑") : ""}
    </th>
  );

  return (
    <Layout>
      {/* Next 5 earnings strip */}
      <div className="flex items-center gap-0 mb-4 bg-card border border-border rounded overflow-x-auto">
        <span className="th-label px-3 py-2 shrink-0 border-r border-border">Earnings</span>
        {EARNINGS_STRIP.map((e, i) => (
          <div key={e.date} className={`flex items-center gap-2 px-3 py-2 shrink-0 ${i < EARNINGS_STRIP.length - 1 ? "border-r border-border" : ""}`}>
            <span className="font-mono text-xxs text-text-tertiary">{e.date}</span>
            {e.tickers.map(t => (
              <Link key={t} to={`/company/${t}`} className="ticker-badge text-primary hover:text-primary/80 transition-colors">{t}</Link>
            ))}
            {e.tickers.length === 0 && <span className="text-xxs text-text-tertiary">—</span>}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ticker or company name..."
            className="pl-8 h-8 text-xs bg-surface-elevated border-border/50"
          />
        </div>

        {/* Sector chips */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setSectorFilter(s)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors shrink-0 ${sectorFilter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-text-secondary hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> Advanced
          </Button>

          <div className="flex items-center bg-card border border-border rounded overflow-hidden">
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-none" onClick={() => setViewMode("table")}><Table2 className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-none" onClick={() => setViewMode("grid")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === "comparison" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-none" onClick={() => setViewMode("comparison")}><GitCompare className="h-3.5 w-3.5" /></Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 hover:bg-surface-elevated">
                Bulk <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border text-xs">
              <DropdownMenuItem className="hover:bg-surface-elevated cursor-pointer">Export Selected</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-surface-elevated cursor-pointer">Add to Watchlist</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-surface-elevated cursor-pointer">Generate Reports</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      {viewMode === "table" && (
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 w-8">
                  <input type="checkbox" className="accent-primary" onChange={e => setSelected(e.target.checked ? sorted.slice(0, 4).map(c => c.ticker) : [])} />
                </th>
                <th className="text-left px-3 py-2 th-label">Ticker</th>
                <th className="text-left px-3 py-2 th-label hidden md:table-cell">Sector</th>
                <th className="text-right px-3 py-2 th-label hidden lg:table-cell">Mkt Cap</th>
                <th
                  className="text-right px-3 py-2 th-label cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => setSort("ess")}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1">
                          ESS <Info className="h-3 w-3 text-text-tertiary" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-48">
                        {ESS_FORMULA_LABEL}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {sortKey === "ess" ? (sortDir === -1 ? " ↓" : " ↑") : ""}
                </th>
                <SortHeader k="essDelta" label="Δ 7d" />
                <SortHeader k="toneGap" label="Tone Gap" />
                <th className="text-right px-3 py-2 th-label">New Risks</th>
                <th className="text-left px-3 py-2 th-label hidden xl:table-cell">Next Earnings</th>
                <th className="px-2 py-2 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => (
                <tr key={c.ticker} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors group">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={selected.includes(c.ticker)}
                      onChange={() => toggle(c.ticker)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link to={`/company/${c.ticker}`} className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="ticker-badge text-primary">{c.ticker}</span>
                        {c.inBook && <span className="text-xxs border border-primary/30 rounded px-1 text-primary/70">Book</span>}
                      </div>
                      <span className="text-xs text-text-tertiary hidden sm:block">{c.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-secondary hidden md:table-cell">{c.sector}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-secondary hidden lg:table-cell">${c.mktCap}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`score-num text-sm ${getESSColor(c.ess)}`}>{c.ess}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs flex items-center justify-end gap-0.5 ${c.essDelta > 0 ? "delta-pos" : c.essDelta < 0 ? "delta-neg" : "delta-muted"}`}>
                      {c.essDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {c.essDelta > 0 ? "+" : ""}{c.essDelta}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs ${c.toneGap >= 30 ? "text-negative" : c.toneGap >= 20 ? "text-caution" : "text-text-tertiary"}`}>{c.toneGap}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {c.newRisks > 0
                      ? <span className="font-mono text-xs text-negative">+{c.newRisks}</span>
                      : <span className="text-text-tertiary text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5 hidden xl:table-cell">
                    <span className="font-mono text-xs text-text-secondary">{c.nextEarnings}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <Link to={`/company/${c.ticker}`} className="text-text-tertiary hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {sorted.map(c => (
            <Link
              key={c.ticker}
              to={`/company/${c.ticker}`}
              className="p-3 bg-card border border-border rounded hover:border-primary/40 transition-colors block"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="ticker-badge text-primary">{c.ticker}</span>
                <span className={`font-mono text-xs ${c.essDelta > 0 ? "delta-pos" : "delta-neg"}`}>{c.essDelta > 0 ? "+" : ""}{c.essDelta}</span>
              </div>
              <div className={`score-num text-2xl ${getESSColor(c.ess)} mb-1`}>{c.ess}</div>
              <div className="th-label">ESS</div>
              <div className="mt-2 text-xs text-text-tertiary truncate">{c.sector}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Selection bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-4 py-2.5 flex items-center gap-3 shadow-2xl z-20">
          <span className="text-xs text-text-secondary font-mono">{selected.length}/4 selected</span>
          <Button size="sm" className="h-6 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCompare}>
            <GitCompare className="h-3 w-3 mr-1" /> Compare
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-xs">Export</Button>
          <Button size="sm" variant="outline" className="h-6 text-xs">Add to Book</Button>
          <button onClick={() => setSelected([])} className="text-text-tertiary hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mt-2 text-xs text-text-tertiary">
        {sorted.length} of {COMPANIES.length} names · ESS = Extended SentiScore (50% OSS · 30% NSS · 20% SSS) ·
        <Link to="/company/AAPL" className="text-primary ml-1 hover:underline">Click any row to deep-dive</Link>
      </div>
    </Layout>
  );
};

export default Companies;
