import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ChevronRight, TrendingUp, Clock } from "lucide-react";

const MACRO = [
  { label: "SPX", value: "5,842.47", change: "+0.34%", up: true },
  { label: "NDX", value: "20,381.52", change: "+0.61%", up: true },
  { label: "VIX", value: "13.42", change: "-1.2%", up: false },
  { label: "10Y", value: "4.312%", change: "+2bp", up: true },
  { label: "DXY", value: "105.14", change: "-0.18%", up: false },
  { label: "WTI", value: "$78.20", change: "+0.8%", up: true },
];

const BOOK = [
  {
    ticker: "AAPL", name: "Apple Inc.", last: "232.14", chg1d: "+0.8%", chg1dUp: true,
    cci: 78, cciDelta: +2, toneGap: 27, newRisks: 0, newsT1: 3, newsT2: 5,
    nextEarnings: "Oct 30, 4pm ET",
    summary: "Services revenue beat by 180bps; China down 3% YoY; management guided flat margins for Q4.",
  },
  {
    ticker: "MSFT", name: "Microsoft Corp.", last: "418.92", chg1d: "+1.2%", chg1dUp: true,
    cci: 84, cciDelta: +5, toneGap: 14, newRisks: 0, newsT1: 2, newsT2: 4,
    nextEarnings: "Oct 23, 4pm ET",
    summary: "Azure growth re-accelerated to 29%; copilot seat expansion ahead of consensus.",
  },
  {
    ticker: "NVDA", name: "NVIDIA Corp.", last: "875.40", chg1d: "+2.1%", chg1dUp: true,
    cci: 91, cciDelta: +8, toneGap: 9, newRisks: 1, newsT1: 6, newsT2: 8,
    nextEarnings: "Nov 20, 4pm ET",
    summary: "Blackwell shipments confirmed for Q4; supply constraint cited as only near-term risk.",
  },
  {
    ticker: "GOOGL", name: "Alphabet Inc.", last: "164.52", chg1d: "-0.4%", chg1dUp: false,
    cci: 72, cciDelta: -3, toneGap: 31, newRisks: 2, newsT1: 4, newsT2: 3,
    nextEarnings: "Oct 29, 4pm ET",
    summary: "DOJ antitrust verdict risk elevated; Search share steady; Waymo optionality unpriced.",
  },
  {
    ticker: "META", name: "Meta Platforms", last: "536.30", chg1d: "+0.3%", chg1dUp: true,
    cci: 79, cciDelta: +1, toneGap: 18, newRisks: 0, newsT1: 2, newsT2: 5,
    nextEarnings: "Oct 30, 4pm ET",
    summary: "Ad ARPU inflecting higher; Reality Labs losses stabilizing. AI spend guidance key watch.",
  },
  {
    ticker: "JPM", name: "JPMorgan Chase", last: "211.80", chg1d: "-0.6%", chg1dUp: false,
    cci: 65, cciDelta: -4, toneGap: 22, newRisks: 1, newsT1: 1, newsT2: 3,
    nextEarnings: "Oct 11, 7am ET",
    summary: "NII guidance trimmed by $500M; credit card net charge-offs tracking slightly above model.",
  },
  {
    ticker: "TSLA", name: "Tesla Inc.", last: "245.18", chg1d: "+3.2%", chg1dUp: true,
    cci: 58, cciDelta: +6, toneGap: 42, newRisks: 3, newsT1: 7, newsT2: 9,
    nextEarnings: "Oct 23, 4pm ET",
    summary: "High tone gap — prepared remarks bullish on energy; Q&A deflective on margin path.",
  },
  {
    ticker: "GS", name: "Goldman Sachs", last: "488.44", chg1d: "+0.9%", chg1dUp: true,
    cci: 73, cciDelta: +2, toneGap: 16, newRisks: 0, newsT1: 2, newsT2: 2,
    nextEarnings: "Oct 15, 7am ET",
    summary: "IB revenue recovery on track; AM fee revenue +11% YoY; provisioning light.",
  },
];

const getCCIColor = (v: number) => {
  if (v >= 75) return "text-positive";
  if (v >= 55) return "text-caution";
  return "text-negative";
};

const getToneGapBadge = (v: number) => {
  if (v >= 30) return "text-negative";
  if (v >= 20) return "text-caution";
  return "text-text-tertiary";
};

const MorningBrief = () => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const now = new Date();
  const etTime = now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <Layout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Morning Brief</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Overnight changes on your book · as of {etTime} ET ·{" "}
            <span className="text-text-secondary">Tue, Oct 29 2025</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Clock className="h-3 w-3" />
          <span>Next refresh in 14 min</span>
        </div>
      </div>

      {/* Macro strip */}
      <div className="flex items-center gap-0 mb-4 bg-card border border-border rounded overflow-x-auto">
        {MACRO.map((m, i) => (
          <div
            key={m.label}
            className={`flex items-center gap-3 px-4 py-2 shrink-0 ${i < MACRO.length - 1 ? "border-r border-border" : ""}`}
          >
            <span className="th-label">{m.label}</span>
            <span className="font-mono text-xs text-foreground">{m.value}</span>
            <span className={`font-mono text-xs ${m.up ? "text-positive" : "text-negative"}`}>
              {m.change}
            </span>
          </div>
        ))}
      </div>

      {/* Book table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 th-label w-32">Ticker</th>
              <th className="text-right px-3 py-2 th-label w-20">Last</th>
              <th className="text-right px-3 py-2 th-label w-16">1D%</th>
              <th className="text-right px-3 py-2 th-label w-20">CCI</th>
              <th className="text-right px-3 py-2 th-label w-20">Δ 24h</th>
              <th className="text-right px-3 py-2 th-label w-20">Tone Gap</th>
              <th className="text-right px-3 py-2 th-label w-20">New Risks</th>
              <th className="text-right px-3 py-2 th-label w-24">T1/T2 News</th>
              <th className="text-left px-3 py-2 th-label">Next Earnings</th>
              <th className="px-2 py-2 th-label w-8"></th>
            </tr>
          </thead>
          <tbody>
            {BOOK.map(row => (
              <>
                <tr
                  key={row.ticker}
                  onMouseEnter={() => setHoveredRow(row.ticker)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-2.5">
                    <Link to={`/company/${row.ticker}`} className="flex items-center gap-2">
                      <span className="ticker-badge text-primary">{row.ticker}</span>
                      <span className="text-xs text-text-tertiary hidden xl:inline truncate max-w-32">{row.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground">{row.last}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs flex items-center justify-end gap-0.5 ${row.chg1dUp ? "text-positive" : "text-negative"}`}>
                      {row.chg1dUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {row.chg1d}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`score-num text-sm ${getCCIColor(row.cci)}`}>{row.cci}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs ${row.cciDelta > 0 ? "delta-pos" : row.cciDelta < 0 ? "delta-neg" : "delta-muted"}`}>
                      {row.cciDelta > 0 ? "+" : ""}{row.cciDelta}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs ${getToneGapBadge(row.toneGap)}`}>
                      {row.toneGap >= 30 && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                      {row.toneGap}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {row.newRisks > 0 ? (
                      <span className="font-mono text-xs text-negative">+{row.newRisks}</span>
                    ) : (
                      <span className="text-text-tertiary"><Minus className="h-3 w-3 inline" /></span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono text-xs text-text-secondary">{row.newsT1}</span>
                    <span className="text-text-tertiary text-xs">/</span>
                    <span className="font-mono text-xs text-text-tertiary">{row.newsT2}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-text-tertiary shrink-0" />
                      <span className="text-xs text-text-secondary font-mono">{row.nextEarnings}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <Link to={`/company/${row.ticker}`} className="text-text-tertiary hover:text-primary transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
                {/* Hover summary */}
                {hoveredRow === row.ticker && (
                  <tr className="border-b border-border bg-surface-2">
                    <td colSpan={10} className="px-3 py-2">
                      <p className="text-xs text-text-secondary font-serif italic leading-relaxed">{row.summary}</p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="mt-3 flex items-center gap-3 text-xs text-text-tertiary">
        <span><kbd className="px-1 py-0.5 rounded bg-surface-elevated border border-border font-mono text-xxs">j</kbd> / <kbd className="px-1 py-0.5 rounded bg-surface-elevated border border-border font-mono text-xxs">k</kbd> navigate</span>
        <span><kbd className="px-1 py-0.5 rounded bg-surface-elevated border border-border font-mono text-xxs">enter</kbd> open</span>
        <span><kbd className="px-1 py-0.5 rounded bg-surface-elevated border border-border font-mono text-xxs">/</kbd> jump to ticker</span>
        <span className="ml-auto">T1 = Bloomberg/Reuters/WSJ · T2 = CNBC/FT</span>
      </div>
    </Layout>
  );
};

export default MorningBrief;
