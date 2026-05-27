import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ChevronRight, FileText } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const QUARTERLY = [
  { q: "Q4'22", l1: 68, l2: 61, l3: 55, cci: 64 },
  { q: "Q1'23", l1: 71, l2: 63, l3: 58, cci: 67 },
  { q: "Q2'23", l1: 74, l2: 65, l3: 60, cci: 70 },
  { q: "Q3'23", l1: 70, l2: 66, l3: 62, cci: 68 },
  { q: "Q4'23", l1: 73, l2: 68, l3: 64, cci: 70 },
  { q: "Q1'24", l1: 75, l2: 70, l3: 66, cci: 72 },
  { q: "Q2'24", l1: 76, l2: 71, l3: 68, cci: 74 },
  { q: "Q3'24", l1: 78, l2: 73, l3: 69, cci: 76 },
];

const SECTOR_MEDIAN = 68;

const HEATMAP = [
  { q: "Q4'23", sentiment: 70, confidence: 65, growth: 72, transparency: 68, tone: 28 },
  { q: "Q1'24", sentiment: 73, confidence: 68, growth: 76, transparency: 66, tone: 24 },
  { q: "Q2'24", sentiment: 75, confidence: 70, growth: 79, transparency: 65, tone: 27 },
  { q: "Q3'24", sentiment: 78, confidence: 72, growth: 82, transparency: 65, tone: 27 },
];

const SCORES = [
  { name: "Overall Sentiment", value: 78, delta: +5, dim: "Sentiment" },
  { name: "Tone Shift", value: 12, delta: +3, dim: "Sentiment", lowerBetter: true },
  { name: "Sentiment Volatility", value: 15, delta: -2, dim: "Sentiment", lowerBetter: true },
  { name: "Mgmt Confidence", value: 72, delta: +8, dim: "Outlook" },
  { name: "Uncertainty Index", value: 35, delta: -5, dim: "Outlook", lowerBetter: true },
  { name: "Forward-Looking", value: 68, delta: +2, dim: "Outlook" },
  { name: "Growth Orientation", value: 82, delta: +10, dim: "Outlook" },
  { name: "Q&A Transparency", value: 65, delta: -3, dim: "Communication" },
  { name: "Answer Specificity", value: 70, delta: +1, dim: "Communication" },
];

const RISKS = [
  { title: "Antitrust Litigation (DOJ)", priority: 9, cat: "Regulatory" },
  { title: "EU Regulatory (DMA)", priority: 8, cat: "Regulatory" },
  { title: "China Market Slowdown", priority: 6, cat: "Geopolitical" },
];

const CATALYSTS = [
  { title: "New Product Launch", date: "Q4 2025" },
  { title: "Services Growth Acceleration", date: "Ongoing" },
  { title: "AI Integration Upside", date: "CY 2026" },
];

const scoreColor = (v: number, lb = false) => {
  const e = lb ? 100 - v : v;
  if (e >= 75) return "text-positive";
  if (e >= 55) return "text-caution";
  return "text-negative";
};

const heatCell = (v: number) => {
  if (v >= 75) return "bg-positive/15 text-positive";
  if (v >= 60) return "bg-caution/10 text-caution";
  return "bg-negative/10 text-negative";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded p-2 text-xs shadow-xl">
      <div className="font-mono font-semibold mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const Overview = () => {
  const { ticker } = useParams();
  const toneGap = 27;

  return (
    <div className="space-y-4">
      {/* Decision strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded p-4 flex flex-col">
          <span className="th-label mb-1">Composite CCI</span>
          <span className="score-num text-4xl text-positive">78</span>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="font-mono text-xs delta-pos">+2 vs Q2</span>
            <span className="text-text-tertiary text-xxs">·</span>
            <span className="font-mono text-xs text-info">+10 vs sector</span>
          </div>
          <button className="mt-auto pt-3 text-xs text-text-tertiary hover:text-primary transition-colors flex items-center gap-1">
            Why did this change? <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <span className="th-label mb-1 block">L1 Transcript (62%)</span>
          <span className="score-num text-3xl text-positive">82</span>
          <div className="mt-1 text-xs text-text-tertiary">ESS · Tone Gap · CEO/CFO</div>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <span className="th-label mb-1 block">L2 News (23%)</span>
          <span className="score-num text-3xl text-caution">71</span>
          <div className="mt-1 text-xs text-text-tertiary">NSS · Inter-Quarter</div>
        </div>
        <div className={`rounded p-4 border ${toneGap >= 30 ? "bg-negative/5 border-negative/30" : "bg-card border-border"}`}>
          <span className="th-label mb-1 block">Tone Gap</span>
          <div className="flex items-center gap-1.5">
            {toneGap >= 30 && <AlertTriangle className="h-4 w-4 text-negative shrink-0" />}
            <span className={`score-num text-3xl ${toneGap >= 30 ? "text-negative" : toneGap >= 20 ? "text-caution" : "text-text-secondary"}`}>{toneGap}</span>
          </div>
          <div className="mt-1 text-xs text-text-tertiary">PPI 72 − CQTI 45</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: charts */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">CCI Evolution <span className="text-xs text-text-tertiary font-normal ml-1">8 quarters</span></span>
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-positive rounded" /> CCI</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t border-dashed border-data-muted" /> Sector med.</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={QUARTERLY} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="cciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142,69%,43%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(142,69%,43%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="q" tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[55, 100]} tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                <ReferenceLine y={SECTOR_MEDIAN} stroke="hsl(210,14%,36%)" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cci" name="CCI" stroke="hsl(142,69%,43%)" strokeWidth={1.5} fill="url(#cciGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded p-4">
            <span className="text-xs font-medium mb-3 block">Layer Attribution — Last 4 Quarters</span>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={QUARTERLY.slice(-4)} layout="vertical" margin={{ top: 0, right: 48, left: 32, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="q" tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} width={34} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="l1" name="L1" stackId="a" fill="hsl(142,69%,43%)" />
                <Bar dataKey="l2" name="L2" stackId="a" fill="hsl(38,90%,48%)" />
                <Bar dataKey="l3" name="L3" stackId="a" fill="hsl(212,80%,58%)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1 text-xxs text-text-tertiary">
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-positive align-middle mr-1" />L1 (62%)</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-caution align-middle mr-1" />L2 (23%)</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-info align-middle mr-1" />L3 (15%)</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded p-4">
            <span className="text-xs font-medium mb-3 block">Score Heatmap — Last 4 Quarters</span>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="th-label text-left pb-2 w-16"></th>
                  <th className="th-label text-center pb-2 px-1">Sentiment</th>
                  <th className="th-label text-center pb-2 px-1">Confidence</th>
                  <th className="th-label text-center pb-2 px-1">Growth</th>
                  <th className="th-label text-center pb-2 px-1">Transparency</th>
                  <th className="th-label text-center pb-2 px-1">Tone Gap</th>
                </tr>
              </thead>
              <tbody>
                {HEATMAP.map(row => (
                  <tr key={row.q}>
                    <td className="font-mono text-text-secondary py-1.5 text-xs">{row.q}</td>
                    {[row.sentiment, row.confidence, row.growth, row.transparency].map((v, i) => (
                      <td key={i} className="py-1 px-1 text-center">
                        <span className={`inline-block font-mono px-2 py-0.5 rounded text-xs ${heatCell(v)}`}>{v}</span>
                      </td>
                    ))}
                    <td className="py-1 px-1 text-center">
                      <span className={`inline-block font-mono px-2 py-0.5 rounded text-xs ${row.tone >= 30 ? "bg-negative/15 text-negative" : "bg-surface-elevated text-text-secondary"}`}>
                        {row.tone}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: scores + risks + AI */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium">Scores by Dimension</span>
              <Link to={`/company/${ticker}/scores`} className="text-xs text-text-tertiary hover:text-primary flex items-center gap-0.5">
                All 20 <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-1.5 th-label">Metric</th>
                  <th className="text-right px-3 py-1.5 th-label">Score</th>
                  <th className="text-right px-3 py-1.5 th-label">Δ QoQ</th>
                  <th className="px-2 py-1.5 th-label w-6"></th>
                </tr>
              </thead>
              <tbody>
                {SCORES.map(s => (
                  <tr key={s.name} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors">
                    <td className="px-4 py-1.5 text-xs text-text-secondary">{s.name}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={`score-num text-sm ${scoreColor(s.value, s.lowerBetter)}`}>{s.value}</span>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={`font-mono text-xs ${s.delta > 0 ? "delta-pos" : s.delta < 0 ? "delta-neg" : "delta-muted"}`}>
                        {s.delta > 0 ? "+" : ""}{s.delta}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <Link to={`/company/${ticker}/transcripts`} className="text-text-tertiary hover:text-primary transition-colors">
                        <FileText className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded p-3">
              <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-negative" /> Top Risks
              </div>
              {RISKS.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <div className="text-xs text-foreground leading-tight">{r.title}</div>
                    <div className="text-xxs text-text-tertiary">{r.cat}</div>
                  </div>
                  <span className={`font-mono text-xs font-semibold shrink-0 ${r.priority >= 8 ? "text-negative" : "text-caution"}`}>{r.priority}/10</span>
                </div>
              ))}
              <Link to={`/company/${ticker}/risks`} className="mt-2 text-xs text-text-tertiary hover:text-primary flex items-center gap-0.5 pt-1">
                All risks <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-card border border-border rounded p-3">
              <div className="text-xs font-medium mb-2">Catalysts</div>
              {CATALYSTS.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <div className="text-xs text-foreground leading-tight">{c.title}</div>
                  <span className="font-mono text-xxs text-text-tertiary shrink-0">{c.date}</span>
                </div>
              ))}
              <Link to={`/company/${ticker}/risks`} className="mt-2 text-xs text-text-tertiary hover:text-primary flex items-center gap-0.5 pt-1">
                Timeline <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-xs font-medium">AI Summary</span>
              <span className="text-xxs text-text-tertiary ml-auto font-mono">CLAUDE · Oct 13, 06:14 ET</span>
            </div>
            <p className="font-serif text-xs text-text-secondary leading-relaxed italic">
              Apple shows strong positive momentum across all three signal layers. Services revenue
              beat consensus by ~180bps; management tone in prepared remarks is notably bullish.
              The tone gap of 27 warrants monitoring — Q&amp;A deflection on China margin guidance
              diverged from the optimistic prepared script. Key watch for Q4: whether tone gap
              narrows as China comps ease.
            </p>
            <div className="mt-2 flex items-center gap-3 pt-2 border-t border-border">
              <button className="text-xxs text-text-tertiary hover:text-foreground">Helpful</button>
              <button className="text-xxs text-text-tertiary hover:text-foreground">Not helpful</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
