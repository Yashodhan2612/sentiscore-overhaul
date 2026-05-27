import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PRODUCTS = [
  { id: "1", name: "Services (Apple+, iCloud)", cat: "Legacy", mentionsCur: 156, mentionsPrior: 142, mentionsDelta: +14, sentCur: 82, sentPrior: 79, sentDelta: +3 },
  { id: "2", name: "iPhone 15 Series", cat: "New Launch", mentionsCur: 127, mentionsPrior: 89, mentionsDelta: +38, sentCur: 88, sentPrior: 84, sentDelta: +4 },
  { id: "3", name: "Apple Vision Pro", cat: "New Launch", mentionsCur: 89, mentionsPrior: 112, mentionsDelta: -23, sentCur: 76, sentPrior: 80, sentDelta: -4 },
  { id: "4", name: "iPad Pro", cat: "Legacy", mentionsCur: 92, mentionsPrior: 88, mentionsDelta: +4, sentCur: 79, sentPrior: 77, sentDelta: +2 },
  { id: "5", name: "Mac Product Line", cat: "Legacy", mentionsCur: 64, mentionsPrior: 72, mentionsDelta: -8, sentCur: 71, sentPrior: 74, sentDelta: -3 },
  { id: "6", name: "Apple Car (Project Titan)", cat: "Pipeline", mentionsCur: 34, mentionsPrior: 18, mentionsDelta: +16, sentCur: 65, sentPrior: 62, sentDelta: +3 },
];

const MENTIONS_HISTORY: Record<string, {q: string; mentions: number; sentiment: number}[]> = {
  "1": [
    { q: "Q4'23", mentions: 120, sentiment: 76 },
    { q: "Q1'24", mentions: 130, sentiment: 78 },
    { q: "Q2'24", mentions: 142, sentiment: 79 },
    { q: "Q3'24", mentions: 156, sentiment: 82 },
  ],
  "2": [
    { q: "Q4'23", mentions: 45, sentiment: 78 },
    { q: "Q1'24", mentions: 72, sentiment: 82 },
    { q: "Q2'24", mentions: 89, sentiment: 84 },
    { q: "Q3'24", mentions: 127, sentiment: 88 },
  ],
};

const EXCERPTS: Record<string, {text: string; sentiment: number; speaker: string}[]> = {
  "2": [
    { text: "The iPhone 15 Series has exceeded our expectations with strong demand for the Pro models.", sentiment: 92, speaker: "Tim Cook, Prepared Remarks" },
    { text: "We're seeing particularly robust iPhone 15 sales in China despite competitive pressures.", sentiment: 85, speaker: "CFO, Q&A" },
    { text: "The titanium design of iPhone 15 Pro has resonated well with premium customers globally.", sentiment: 90, speaker: "Tim Cook, Q&A" },
    { text: "iPhone 15 supply chain is now fully optimized after initial constraints in Q2.", sentiment: 78, speaker: "Luca Maestri, Prepared Remarks" },
    { text: "We expect iPhone 15 momentum to continue through the holiday quarter.", sentiment: 88, speaker: "Tim Cook, Q&A" },
  ],
  "1": [
    { text: "Services revenue exceeded expectations, growing 18% year-over-year to a new all-time high.", sentiment: 95, speaker: "Luca Maestri, Prepared Remarks" },
    { text: "We continue to see strong engagement across Apple TV+, iCloud, and Apple Music.", sentiment: 84, speaker: "Tim Cook, Prepared Remarks" },
    { text: "Services gross margin expanded 120 basis points year-over-year, reflecting operational leverage.", sentiment: 88, speaker: "Luca Maestri, Prepared Remarks" },
  ],
};

const sentColor = (v: number) => v >= 80 ? "text-positive" : v >= 65 ? "text-caution" : "text-negative";
const catColor = (c: string) => c === "New Launch" ? "text-primary border-primary/30" : c === "Pipeline" ? "text-caution border-caution/30" : "text-info border-info/30";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded p-2 text-xs shadow-xl">
      <div className="font-mono font-semibold mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-mono">{p.value}</span></div>
      ))}
    </div>
  );
};

const ProductIntelligence = () => {
  const [selected, setSelected] = useState<typeof PRODUCTS[0] | null>(null);
  const [sortBy, setSortBy] = useState<"mentionsDelta" | "sentDelta" | "mentionsCur">("mentionsDelta");

  const sorted = [...PRODUCTS].sort((a, b) => Math.abs(b[sortBy]) - Math.abs(a[sortBy]));

  return (
    <div className="flex gap-4">
      {/* Product list */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">Sort by:</span>
          {([["mentionsDelta","Mention Δ"],["sentDelta","Sentiment Δ"],["mentionsCur","Volume"]] as const).map(([k,l]) => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              className={`px-2.5 py-1 rounded text-xs border transition-colors ${sortBy === k ? "bg-primary text-primary-foreground border-primary" : "border-border text-text-secondary hover:text-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 th-label">Product</th>
                <th className="text-center px-2 py-2 th-label hidden sm:table-cell">Cat</th>
                <th className="text-right px-3 py-2 th-label">Mentions</th>
                <th className="text-right px-3 py-2 th-label">ΔQ</th>
                <th className="text-right px-3 py-2 th-label">Sentiment</th>
                <th className="text-right px-3 py-2 th-label">ΔQ</th>
                <th className="px-2 py-2 th-label w-6"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr
                  key={p.id}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors ${selected?.id === p.id ? "bg-surface-elevated" : "hover:bg-surface-elevated"}`}
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                >
                  <td className="px-3 py-2.5 text-sm text-foreground">{p.name}</td>
                  <td className="px-2 py-2.5 text-center hidden sm:table-cell">
                    <span className={`text-xxs border rounded px-1.5 py-0.5 ${catColor(p.cat)}`}>{p.cat}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm text-foreground">{p.mentionsCur}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs flex items-center justify-end gap-0.5 ${p.mentionsDelta > 0 ? "delta-pos" : "delta-neg"}`}>
                      {p.mentionsDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {p.mentionsDelta > 0 ? "+" : ""}{p.mentionsDelta}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`score-num text-sm ${sentColor(p.sentCur)}`}>{p.sentCur}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono text-xs ${p.sentDelta > 0 ? "delta-pos" : "delta-neg"}`}>
                      {p.sentDelta > 0 ? "+" : ""}{p.sentDelta}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    {selected?.id === p.id ? <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" /> : <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down panel */}
      {selected && (
        <div className="w-80 shrink-0 space-y-3">
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{selected.name}</span>
              <button onClick={() => setSelected(null)} className="text-xs text-text-tertiary hover:text-foreground">Close</button>
            </div>

            {/* Charts */}
            {MENTIONS_HISTORY[selected.id] && (
              <div className="space-y-3">
                <div>
                  <div className="th-label mb-1">Sentiment Trend</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={MENTIONS_HISTORY[selected.id]} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis dataKey="q" tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="sentiment" name="Sentiment" stroke="hsl(142,69%,43%)" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="th-label mb-1">Mention Volume</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={MENTIONS_HISTORY[selected.id]} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis dataKey="q" tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="mentions" name="Mentions" fill="hsl(35,96%,50%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Excerpts */}
          {EXCERPTS[selected.id] && (
            <div className="bg-card border border-border rounded p-4">
              <div className="th-label mb-2">Excerpts</div>
              <div className="space-y-2.5">
                {EXCERPTS[selected.id].map((e, i) => (
                  <div key={i} className="border-b border-border last:border-0 pb-2.5 last:pb-0">
                    <p className="font-serif text-xs text-text-secondary italic leading-relaxed">"{e.text}"</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xxs text-text-tertiary">{e.speaker}</span>
                      <span className={`font-mono text-xxs ${sentColor(e.sentiment)}`}>{e.sentiment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductIntelligence;
