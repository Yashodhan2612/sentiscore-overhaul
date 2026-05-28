import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Anchor, X, Plus, ArrowUpRight, ArrowDownRight, Info,
  ChevronDown, ChevronRight, Copy, Download, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { UNIVERSE, getDefaultPeers, isOutlier, indexToAnchor, type UniverseItem } from "@/lib/peers";
import { ESS_FORMULA_LABEL } from "@/lib/ess";
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

// ─── Sparkline data (8 quarters per ticker, keyed by ticker) ──────────────────
const SPARKLINES: Record<string, { q: string; ess: number; oss: number; nss: number; sss: number }[]> = {
  AAPL:  [ {q:"Q4'22",ess:64,oss:64,nss:58,sss:55}, {q:"Q1'23",ess:67,oss:68,nss:61,sss:57}, {q:"Q2'23",ess:70,oss:72,nss:64,sss:60}, {q:"Q3'23",ess:68,oss:69,nss:63,sss:58}, {q:"Q4'23",ess:70,oss:72,nss:65,sss:60}, {q:"Q1'24",ess:72,oss:74,nss:67,sss:63}, {q:"Q2'24",ess:74,oss:76,nss:70,sss:66}, {q:"Q3'24",ess:76,oss:78,nss:71,sss:68} ],
  MSFT:  [ {q:"Q4'22",ess:72,oss:72,nss:74,sss:76}, {q:"Q1'23",ess:74,oss:73,nss:76,sss:78}, {q:"Q2'23",ess:76,oss:75,nss:78,sss:80}, {q:"Q3'23",ess:75,oss:74,nss:77,sss:79}, {q:"Q4'23",ess:77,oss:76,nss:79,sss:81}, {q:"Q1'24",ess:79,oss:78,nss:81,sss:83}, {q:"Q2'24",ess:81,oss:79,nss:84,sss:86}, {q:"Q3'24",ess:84,oss:80,nss:88,sss:90} ],
  NVDA:  [ {q:"Q4'22",ess:74,oss:76,nss:72,sss:70}, {q:"Q1'23",ess:77,oss:79,nss:75,sss:73}, {q:"Q2'23",ess:80,oss:82,nss:78,sss:76}, {q:"Q3'23",ess:79,oss:81,nss:77,sss:75}, {q:"Q4'23",ess:83,oss:85,nss:81,sss:79}, {q:"Q1'24",ess:86,oss:88,nss:84,sss:82}, {q:"Q2'24",ess:89,oss:91,nss:87,sss:88}, {q:"Q3'24",ess:91,oss:92,nss:89,sss:91} ],
  GOOGL: [ {q:"Q4'22",ess:65,oss:63,nss:62,sss:60}, {q:"Q1'23",ess:67,oss:65,nss:64,sss:62}, {q:"Q2'23",ess:69,oss:67,nss:66,sss:64}, {q:"Q3'23",ess:68,oss:66,nss:65,sss:63}, {q:"Q4'23",ess:70,oss:68,nss:67,sss:65}, {q:"Q1'24",ess:71,oss:69,nss:68,sss:66}, {q:"Q2'24",ess:73,oss:71,nss:70,sss:68}, {q:"Q3'24",ess:72,oss:70,nss:68,sss:71} ],
  META:  [ {q:"Q4'22",ess:65,oss:65,nss:66,sss:68}, {q:"Q1'23",ess:68,oss:67,nss:69,sss:70}, {q:"Q2'23",ess:70,oss:69,nss:71,sss:72}, {q:"Q3'23",ess:71,oss:70,nss:72,sss:73}, {q:"Q4'23",ess:73,oss:72,nss:74,sss:75}, {q:"Q1'24",ess:75,oss:74,nss:76,sss:77}, {q:"Q2'24",ess:77,oss:76,nss:78,sss:79}, {q:"Q3'24",ess:79,oss:78,nss:80,sss:82} ],
  TSLA:  [ {q:"Q4'22",ess:55,oss:52,nss:57,sss:59}, {q:"Q1'23",ess:56,oss:53,nss:58,sss:60}, {q:"Q2'23",ess:57,oss:54,nss:59,sss:61}, {q:"Q3'23",ess:54,oss:51,nss:56,sss:57}, {q:"Q4'23",ess:56,oss:53,nss:58,sss:59}, {q:"Q1'24",ess:57,oss:54,nss:59,sss:60}, {q:"Q2'24",ess:59,oss:56,nss:61,sss:63}, {q:"Q3'24",ess:58,oss:55,nss:60,sss:62} ],
  JPM:   [ {q:"Q4'22",ess:60,oss:59,nss:61,sss:59}, {q:"Q1'23",ess:62,oss:61,nss:63,sss:61}, {q:"Q2'23",ess:63,oss:62,nss:64,sss:62}, {q:"Q3'23",ess:64,oss:63,nss:65,sss:63}, {q:"Q4'23",ess:65,oss:64,nss:66,sss:64}, {q:"Q1'24",ess:67,oss:66,nss:68,sss:66}, {q:"Q2'24",ess:68,oss:67,nss:69,sss:67}, {q:"Q3'24",ess:65,oss:64,nss:66,sss:65} ],
  GS:    [ {q:"Q4'22",ess:66,oss:65,nss:67,sss:63}, {q:"Q1'23",ess:67,oss:66,nss:68,sss:64}, {q:"Q2'23",ess:68,oss:67,nss:69,sss:65}, {q:"Q3'23",ess:68,oss:67,nss:69,sss:65}, {q:"Q4'23",ess:70,oss:69,nss:71,sss:67}, {q:"Q1'24",ess:71,oss:70,nss:72,sss:68}, {q:"Q2'24",ess:72,oss:71,nss:73,sss:69}, {q:"Q3'24",ess:73,oss:72,nss:74,sss:70} ],
};

// Fallback sparkline data for tickers not in the map
const defaultSparkline = (item: UniverseItem) =>
  ["Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24"].map((q, i) => ({
    q, ess: Math.max(40, item.ess - 12 + i * 1.7), oss: Math.max(40, item.oss - 12 + i * 1.7),
    nss: Math.max(40, item.nss - 12 + i * 1.7), sss: Math.max(40, item.sss - 12 + i * 1.7),
  }));

const getSparkline = (ticker: string, item: UniverseItem) =>
  SPARKLINES[ticker] ?? defaultSparkline(item);

// ─── Metric groups ──────────────────────────────────────────────────────────
type MetricKey = keyof Pick<UniverseItem, "ess"|"oss"|"nss"|"sss"|"essDelta"|"toneGap"|"newRisks">;

const METRIC_GROUPS: { label: string; key: string; metrics: { label: string; key: MetricKey; lowerBetter?: boolean; fmt?: (v: number) => string }[] }[] = [
  {
    label: "ESS Composite", key: "ess",
    metrics: [
      { label: "ESS (Extended SentiScore)", key: "ess" },
      { label: "L1 · OSS (Overall Sentiment)", key: "oss" },
      { label: "L2 · NSS (News Sentiment)", key: "nss" },
      { label: "L3 · SSS (Social Sentiment)", key: "sss" },
    ],
  },
  {
    label: "Tone & Risk", key: "tone",
    metrics: [
      { label: "ESS Δ (7d)", key: "essDelta", fmt: (v) => (v > 0 ? "+" : "") + v },
      { label: "Tone Gap ↓", key: "toneGap", lowerBetter: true },
      { label: "New Risks", key: "newRisks", lowerBetter: true, fmt: (v) => v > 0 ? `+${v}` : "—" },
    ],
  },
];

// ─── Helper components ──────────────────────────────────────────────────────
const COLORS = ["hsl(35,96%,50%)", "hsl(212,80%,58%)", "hsl(142,69%,43%)", "hsl(280,70%,60%)"];

const cellBg = (value: number, allValues: number[], lowerBetter = false, showHighlights: boolean, showOutliers: boolean) => {
  if (!showHighlights && !showOutliers) return "";
  const vals = allValues.filter(v => v !== undefined && !isNaN(v));
  if (vals.length < 2) return "";
  const sorted = [...vals].sort((a, b) => a - b);
  const best = lowerBetter ? sorted[0] : sorted[sorted.length - 1];
  const worst = lowerBetter ? sorted[sorted.length - 1] : sorted[0];
  if (showHighlights && value === best) return "bg-positive/10";
  if (showHighlights && value === worst) return "bg-negative/10";
  if (showOutliers && isOutlier(value, vals)) return "bg-caution/10";
  return "";
};

const scoreColor = (v: number, lowerBetter = false) => {
  const e = lowerBetter ? 100 - v : v;
  if (e >= 75) return "text-positive";
  if (e >= 55) return "text-caution";
  return "text-negative";
};

// Mini sparkline inline
const MiniSparkline = ({ data, color }: { data: { q: string; ess: number }[]; color: string }) => (
  <ResponsiveContainer width="100%" height={36}>
    <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
      <Line type="monotone" dataKey="ess" stroke={color} strokeWidth={1.5} dot={false} />
      <ReTooltip
        content={({ active, payload, label }) =>
          active && payload?.length ? (
            <div className="bg-popover border border-border rounded px-2 py-1 text-xs shadow">
              <span className="font-mono text-text-tertiary mr-1">{label}</span>
              <span className="font-mono" style={{ color }}>{payload[0].value}</span>
            </div>
          ) : null
        }
      />
    </LineChart>
  </ResponsiveContainer>
);

// Peer picker popover
const PeerPicker = ({
  onSelect, exclude, onClose,
}: { onSelect: (ticker: string) => void; exclude: string[]; onClose: () => void }) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const filtered = UNIVERSE.filter(c =>
    !exclude.includes(c.ticker) &&
    (q === "" || c.ticker.includes(q.toUpperCase()) || c.name.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded shadow-2xl z-30">
      <div className="p-2 border-b border-border">
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && filtered.length > 0) { onSelect(filtered[0].ticker); onClose(); }
            if (e.key === "Escape") onClose();
          }}
          placeholder="Search ticker…"
          className="w-full bg-transparent text-xs text-foreground placeholder:text-text-tertiary outline-none font-mono"
        />
      </div>
      <div className="py-1 max-h-52 overflow-y-auto">
        {filtered.map(c => (
          <button
            key={c.ticker}
            onClick={() => { onSelect(c.ticker); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-elevated transition-colors"
          >
            <span className="ticker-badge text-primary">{c.ticker}</span>
            <span className="text-xs text-text-secondary truncate ml-2 flex-1 text-right">{c.name}</span>
          </button>
        ))}
        {filtered.length === 0 && <div className="px-3 py-3 text-xs text-text-tertiary text-center">No matches</div>}
      </div>
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────
const ComparisonPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const anchorParam = searchParams.get("anchor") || "AAPL";
  const peersParam = (searchParams.get("peers") || "").split(",").filter(Boolean);

  // State
  const [anchor, setAnchor] = useState(anchorParam);
  const [peers, setPeers] = useState<string[]>(() => {
    if (peersParam.length > 0) return peersParam.slice(0, 3);
    return getDefaultPeers(anchorParam, 3);
  });
  const [indexed, setIndexed] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showOutliers, setShowOutliers] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const allTickers = [anchor, ...peers];
  const companies = allTickers.map(t => UNIVERSE.find(c => c.ticker === t)).filter(Boolean) as UniverseItem[];
  const anchorItem = companies[0];

  // Keyboard shortcuts for comparison page
  useEffect(() => {
    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      if (action === "i") setIndexed(v => !v);
      if (action === "b") setShowHighlights(v => !v);
      if (action === "o") setShowOutliers(v => !v);
    };
    document.addEventListener("key-action", handler);
    return () => document.removeEventListener("key-action", handler);
  }, []);

  // Sync URL
  useEffect(() => {
    setSearchParams({ anchor, peers: peers.join(",") }, { replace: true });
  }, [anchor, peers]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setSwapTarget(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const removePeer = (ticker: string) => {
    setPeers(p => p.filter(t => t !== ticker));
    toast(`${ticker} removed from comparison`);
  };

  const makeAnchor = (ticker: string) => {
    const oldAnchor = anchor;
    setAnchor(ticker);
    setPeers(p => [oldAnchor, ...p.filter(t => t !== ticker)]);
    toast(`${ticker} is now the anchor`);
  };

  const addPeer = (ticker: string) => {
    if (peers.length >= 3) {
      const dropped = peers[peers.length - 1];
      setPeers(p => [ticker, ...p.slice(0, 2)]);
      toast(`${dropped} dropped — cap of 4 companies reached`);
    } else {
      setPeers(p => [...p, ticker]);
    }
    setPickerOpen(false);
  };

  const swapPeer = (oldTicker: string, newTicker: string) => {
    if (oldTicker === anchor) {
      makeAnchor(newTicker);
    } else {
      setPeers(p => p.map(t => t === oldTicker ? newTicker : t));
    }
    setSwapTarget(null);
    setPickerOpen(false);
  };

  const toggleGroup = (key: string) =>
    setCollapsedGroups(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const display = (value: number, anchorValue: number) => {
    if (!indexed) return value;
    return indexToAnchor(value, anchorValue);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const colCount = allTickers.length;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-semibold">Benchmark Comparison</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {anchor} vs {peers.length > 0 ? peers.join(", ") : "no peers"}
            {" "}· {colCount} compan{colCount === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Raw / Indexed toggle */}
          <div className="flex items-center bg-card border border-border rounded overflow-hidden text-xs">
            <button
              onClick={() => setIndexed(false)}
              className={`px-3 py-1.5 transition-colors ${!indexed ? "bg-primary text-primary-foreground" : "text-text-secondary hover:text-foreground"}`}
            >
              Raw
            </button>
            <button
              onClick={() => setIndexed(true)}
              className={`px-3 py-1.5 transition-colors ${indexed ? "bg-primary text-primary-foreground" : "text-text-secondary hover:text-foreground"}`}
            >
              Indexed to {anchor}=100
            </button>
          </div>

          {/* Highlight toggles */}
          <Button
            variant="outline"
            size="sm"
            className={`h-7 text-xs px-2 ${showHighlights ? "border-primary text-primary" : ""}`}
            onClick={() => setShowHighlights(!showHighlights)}
          >
            Best / Worst
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 text-xs px-2 ${showOutliers ? "border-caution text-caution" : ""}`}
            onClick={() => setShowOutliers(!showOutliers)}
          >
            Outliers
          </Button>

          {/* Share / export */}
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main comparison table */}
      <div className="bg-card border border-border rounded overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Company header row */}
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 th-label w-52 sticky left-0 bg-card z-10">Metric</th>
              {/* Anchor */}
              <th className="px-4 py-3 min-w-[150px]">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="ticker-badge text-primary">{anchor}</span>
                    <Anchor className="h-3 w-3 text-primary/60" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => { setSwapTarget(anchor); setPickerOpen(true); }}
                            className="text-text-tertiary hover:text-foreground transition-colors"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Swap anchor</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs text-text-tertiary truncate max-w-32">
                    {UNIVERSE.find(c => c.ticker === anchor)?.name}
                  </span>
                </div>
              </th>
              {/* Peers */}
              {peers.map(ticker => {
                const item = UNIVERSE.find(c => c.ticker === ticker);
                return (
                  <th key={ticker} className="px-4 py-3 min-w-[150px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="ticker-badge text-text-secondary">{ticker}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => makeAnchor(ticker)} className="text-text-tertiary hover:text-primary transition-colors" title="Make anchor">
                                <Anchor className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Make {ticker} the anchor</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => { setSwapTarget(ticker); setPickerOpen(true); }}
                                className="text-text-tertiary hover:text-foreground transition-colors"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Swap peer</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <button onClick={() => removePeer(ticker)} className="text-text-tertiary hover:text-negative transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs text-text-tertiary truncate max-w-32">{item?.name}</span>
                    </div>
                  </th>
                );
              })}
              {/* Add peer col (only if under 3 peers) */}
              {peers.length < 3 && (
                <th className="px-4 py-3 min-w-[120px] relative" ref={pickerRef}>
                  <button
                    onClick={() => { setSwapTarget(null); setPickerOpen(true); }}
                    className="flex items-center gap-1 text-xs text-text-tertiary hover:text-primary transition-colors border border-dashed border-border rounded px-2.5 py-1 mx-auto"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                  {pickerOpen && swapTarget === null && (
                    <PeerPicker
                      exclude={allTickers}
                      onSelect={addPeer}
                      onClose={() => setPickerOpen(false)}
                    />
                  )}
                </th>
              )}
            </tr>
          </thead>

          {/* Identity row */}
          <tbody>
            <tr className="border-b border-border bg-surface-2/30">
              <td className="px-4 py-2 sticky left-0 bg-surface-2/30 th-label">Sector</td>
              {companies.map((c, i) => (
                <td key={c.ticker} className="px-4 py-2 text-center text-xs text-text-secondary">{c.sector}</td>
              ))}
              {peers.length < 3 && <td />}
            </tr>
            <tr className="border-b border-border bg-surface-2/30">
              <td className="px-4 py-2 sticky left-0 bg-surface-2/30 th-label">Mkt Cap</td>
              {companies.map(c => (
                <td key={c.ticker} className="px-4 py-2 text-center font-mono text-xs text-text-secondary">${c.mktCap}</td>
              ))}
              {peers.length < 3 && <td />}
            </tr>
            <tr className="border-b border-border bg-surface-2/30">
              <td className="px-4 py-2 sticky left-0 bg-surface-2/30 th-label">Next Earnings</td>
              {companies.map(c => (
                <td key={c.ticker} className="px-4 py-2 text-center font-mono text-xs text-text-secondary">{c.nextEarnings}</td>
              ))}
              {peers.length < 3 && <td />}
            </tr>

            {/* Metric groups */}
            {METRIC_GROUPS.map(group => (
              <>
                {/* Group header */}
                <tr key={`header-${group.key}`} className="border-b border-border bg-surface-elevated">
                  <td
                    colSpan={companies.length + (peers.length < 3 ? 2 : 1)}
                    className="px-4 py-1.5 sticky left-0"
                  >
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {collapsedGroups.has(group.key)
                        ? <ChevronRight className="h-3.5 w-3.5" />
                        : <ChevronDown className="h-3.5 w-3.5" />}
                      {group.label}
                    </button>
                  </td>
                </tr>
                {/* Metric rows */}
                {!collapsedGroups.has(group.key) && group.metrics.map(metric => {
                  const rawValues = companies.map(c => c[metric.key] as number);
                  return (
                    <tr
                      key={`${group.key}-${metric.key}`}
                      className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors"
                    >
                      <td className="px-4 py-2 sticky left-0 bg-card">
                        <span className="text-xs text-text-secondary">{metric.label}</span>
                        {metric.key === "ess" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-text-tertiary inline ml-1 cursor-default" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs max-w-48">{ESS_FORMULA_LABEL}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {metric.lowerBetter && (
                          <span className="text-xxs text-text-tertiary ml-1">(↓ better)</span>
                        )}
                      </td>
                      {companies.map((c, i) => {
                        const raw = c[metric.key] as number;
                        const anchorRaw = anchorItem[metric.key] as number;
                        const shown = display(raw, anchorRaw);
                        const bg = cellBg(raw, rawValues, metric.lowerBetter, showHighlights, showOutliers);
                        const isAnchorCol = i === 0;
                        const fmt = metric.fmt ? metric.fmt(shown) : shown;
                        return (
                          <td key={c.ticker} className={`px-4 py-2 text-center ${bg}`}>
                            <span
                              className={`font-mono text-sm font-semibold ${
                                isAnchorCol ? scoreColor(raw, metric.lowerBetter) :
                                indexed ? "text-foreground" : scoreColor(raw, metric.lowerBetter)
                              }`}
                            >
                              {fmt}
                            </span>
                            {indexed && i > 0 && (
                              <span className={`block text-xxs font-mono mt-0.5 ${
                                shown > 100 ? "text-positive" : shown < 100 ? "text-negative" : "text-text-tertiary"
                              }`}>
                                {shown > 100 ? "+" : ""}{shown - 100}
                              </span>
                            )}
                            {indexed && i === 0 && (
                              <span className="block text-xxs text-text-tertiary font-mono mt-0.5">base</span>
                            )}
                          </td>
                        );
                      })}
                      {peers.length < 3 && <td />}
                    </tr>
                  );
                })}
              </>
            ))}

            {/* ESS sparklines group */}
            <tr className="border-b border-border bg-surface-elevated">
              <td colSpan={companies.length + (peers.length < 3 ? 2 : 1)} className="px-4 py-1.5 sticky left-0">
                <button
                  onClick={() => toggleGroup("sparklines")}
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  {collapsedGroups.has("sparklines")
                    ? <ChevronRight className="h-3.5 w-3.5" />
                    : <ChevronDown className="h-3.5 w-3.5" />}
                  Trends — ESS (8 Quarters)
                </button>
              </td>
            </tr>
            {!collapsedGroups.has("sparklines") && (
              <tr className="border-b border-border">
                <td className="px-4 py-3 sticky left-0 bg-card">
                  <span className="text-xs text-text-secondary">ESS over time</span>
                  <div className="text-xxs text-text-tertiary mt-0.5">shared y-axis</div>
                </td>
                {companies.map((c, i) => (
                  <td key={c.ticker} className="px-4 py-3">
                    <MiniSparkline data={getSparkline(c.ticker, c)} color={COLORS[i % COLORS.length]} />
                    <div className="text-center text-xxs text-text-tertiary mt-1 font-mono">
                      {getSparkline(c.ticker, c)[0].ess} → {getSparkline(c.ticker, c)[7].ess}
                    </div>
                  </td>
                ))}
                {peers.length < 3 && <td />}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Swap picker overlay (attached to the button) */}
      {pickerOpen && swapTarget !== null && (
        <div ref={pickerRef} className="fixed inset-0 z-40 flex items-start justify-center pt-32 pointer-events-none">
          <div className="pointer-events-auto w-64 bg-popover border border-border rounded shadow-2xl">
            <div className="px-3 py-2 border-b border-border text-xs text-text-tertiary">
              Swap {swapTarget} with…
            </div>
            <PeerPicker
              exclude={allTickers.filter(t => t !== swapTarget)}
              onSelect={(newTicker) => swapPeer(swapTarget, newTicker)}
              onClose={() => { setPickerOpen(false); setSwapTarget(null); }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary flex-wrap">
        <span>ESS = Extended SentiScore · {ESS_FORMULA_LABEL}</span>
        <span className="ml-auto">
          <Link to="/companies" className="text-primary hover:underline">← Back to Screener</Link>
        </span>
      </div>
    </Layout>
  );
};

export default ComparisonPage;
