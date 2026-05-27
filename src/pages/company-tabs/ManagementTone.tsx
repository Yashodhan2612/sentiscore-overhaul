import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const ppi = 72;
const cqti = 45;
const toneGap = ppi - cqti;

const PHRASES = [
  { phrase: "strong growth trajectory", count: 12 },
  { phrase: "exceeded expectations", count: 9 },
  { phrase: "unprecedented opportunity", count: 7 },
  { phrase: "industry-leading position", count: 6 },
  { phrase: "significant momentum", count: 5 },
  { phrase: "exceptional execution", count: 4 },
  { phrase: "highly confident", count: 4 },
  { phrase: "record performance", count: 3 },
];

const CONF_VERBS = [
  { verb: "confident", count: 15 },
  { verb: "expect", count: 12 },
  { verb: "believe", count: 10 },
  { verb: "anticipate", count: 8 },
  { verb: "committed", count: 6 },
];

const EVIDENCE = {
  promotional: [
    { id: "p1", excerpt: "We're seeing unprecedented growth in our services segment.", context: "Tim Cook, Prepared Remarks — Q3 FY25, 14:04 ET", full: "In Q3, we're seeing unprecedented growth in our services segment, driven by strong adoption across all regions. The performance has truly exceeded our most optimistic internal projections.", speaker: "Tim Cook", section: "Prepared Remarks" },
    { id: "p2", excerpt: "This positions us as the industry leader in innovation.", context: "Tim Cook, Prepared Remarks — Q3 FY25, 14:08 ET", full: "Our latest product release positions us as the industry leader in innovation, with features that are years ahead of our competitors in the marketplace.", speaker: "Tim Cook", section: "Prepared Remarks" },
    { id: "p3", excerpt: "We're extremely confident in our forward guidance.", context: "Luca Maestri, Prepared Remarks — Q3 FY25, 14:22 ET", full: "Given the strong performance this quarter, we're extremely confident in our forward guidance for the remainder of the fiscal year and into the next.", speaker: "Luca Maestri", section: "Prepared Remarks" },
  ],
  deflection: [
    { id: "d1", excerpt: "I'd prefer not to comment on that specific metric at this time.", context: "Luca Maestri, Q&A — Q3 FY25, 15:14 ET", full: "Q: What's the gross margin on Vision Pro? A: I'd prefer not to comment on that specific metric at this time, but overall margins remain healthy and we're pleased with the product trajectory.", speaker: "Luca Maestri", section: "Q&A" },
    { id: "d2", excerpt: "We'll provide more details in coming quarters.", context: "Tim Cook, Q&A — Q3 FY25, 15:22 ET", full: "Q: When will the next product category launch? A: We'll provide more details in coming quarters as our plans are finalized. We never like to pre-announce products.", speaker: "Tim Cook", section: "Q&A" },
    { id: "d3", excerpt: "That's not something we typically disclose.", context: "Luca Maestri, Q&A — Q3 FY25, 15:31 ET", full: "Q: What's the blended customer acquisition cost in Services? A: That's not something we typically disclose, but we're very pleased with the efficiency of our customer acquisition.", speaker: "Luca Maestri", section: "Q&A" },
  ],
  admissions: [
    { id: "a1", excerpt: "Supply chain constraints have impacted our ability to meet demand.", context: "Luca Maestri, Prepared Remarks — Q3 FY25, 14:18 ET", full: "While demand remains strong, supply chain constraints have impacted our ability to meet demand in certain product categories, particularly for the new Pro models.", speaker: "Luca Maestri", section: "Prepared Remarks" },
    { id: "a2", excerpt: "We're navigating a challenging regulatory environment in Europe.", context: "Tim Cook, Q&A — Q3 FY25, 15:08 ET", full: "In Europe, we're navigating a challenging regulatory environment that may impact our timeline for certain features. The DMA compliance work is ongoing.", speaker: "Tim Cook", section: "Q&A" },
    { id: "a3", excerpt: "Pricing pressure in this segment remains a headwind.", context: "Luca Maestri, Q&A — Q3 FY25, 15:44 ET", full: "Pricing pressure in the Mac segment remains a headwind to growth, though we're partially offsetting this through our expanding accessories and services attachment.", speaker: "Luca Maestri", section: "Q&A" },
  ],
};

type EvidenceKey = keyof typeof EVIDENCE;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded p-2 text-xs shadow-xl">
      <div className="font-mono font-semibold">{label}</div>
      <div className="text-text-secondary">{payload[0].value} mentions</div>
    </div>
  );
};

const ManagementTone = () => {
  const { ticker } = useParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EvidenceKey>("promotional");

  const maxPhraseCount = Math.max(...PHRASES.map(p => p.count));

  return (
    <div className="space-y-4">
      {/* PPI / CQTI Barbell */}
      <div className="bg-card border border-border rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Tone Analysis — PPI vs CQTI</span>
          <span className="text-xs text-text-tertiary">Q3 FY25</span>
        </div>

        <div className="relative flex items-center gap-0 mb-4">
          {/* CQTI label */}
          <div className="text-center shrink-0 w-28">
            <div className="th-label mb-1">CQTI</div>
            <div className="score-num text-3xl text-negative">{cqti}</div>
            <div className="text-xs text-text-tertiary mt-0.5">Q&A Candor</div>
          </div>

          {/* Barbell track */}
          <div className="flex-1 mx-4 relative">
            <div className="h-2 bg-surface-elevated rounded-full relative overflow-hidden">
              <div className="tone-gap-bar absolute inset-0 opacity-20 rounded-full" />
            </div>
            {/* CQTI dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-negative border-2 border-background"
              style={{ left: `${cqti}%` }}
            />
            {/* PPI dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-caution border-2 border-background"
              style={{ left: `${ppi}%` }}
            />
            {/* Gap annotation */}
            <div
              className="absolute -top-5 text-xxs font-mono text-negative"
              style={{ left: `${(cqti + ppi) / 2}%`, transform: 'translateX(-50%)' }}
            >
              gap = {toneGap}
            </div>
            {/* Threshold line */}
            <div
              className="absolute top-0 h-2 border-l border-dashed border-negative/60"
              style={{ left: '70%' }}
            />
            <div className="absolute -bottom-5 text-xxs text-text-tertiary" style={{ left: '70%', transform: 'translateX(-50%)' }}>
              threshold 30
            </div>
          </div>

          {/* PPI label */}
          <div className="text-center shrink-0 w-28">
            <div className="th-label mb-1">PPI</div>
            <div className="score-num text-3xl text-caution">{ppi}</div>
            <div className="text-xs text-text-tertiary mt-0.5">Prepared Puffery</div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border flex items-center gap-3">
          {toneGap >= 30 ? (
            <div className="flex items-center gap-2 text-xs text-negative">
              <AlertTriangle className="h-4 w-4" />
              <span>Tone gap {toneGap} pts — significant inconsistency between prepared remarks and Q&amp;A candor.</span>
            </div>
          ) : (
            <span className="text-xs text-text-secondary">Gap {toneGap} pts — within normal range. Monitor for widening.</span>
          )}
        </div>
      </div>

      {/* Two-column analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Promotional phrase bar list */}
        <div className="bg-card border border-border rounded p-4">
          <span className="text-xs font-medium mb-3 block">Top Promotional Phrases — Prepared Remarks</span>
          <div className="space-y-2">
            {PHRASES.map(p => (
              <div key={p.phrase} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-text-secondary">{p.phrase}</span>
                    <span className="font-mono text-xs text-foreground">{p.count}×</span>
                  </div>
                  <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-caution/60 rounded-full"
                      style={{ width: `${(p.count / maxPhraseCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence verb bar chart + deflection stats */}
        <div className="bg-card border border-border rounded p-4 space-y-4">
          <div>
            <span className="text-xs font-medium mb-3 block">Confidence Verb Frequency</span>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={CONF_VERBS} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(210,12%,40%)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="verb" tick={{ fontSize: 11, fill: "hsl(210,16%,60%)" }} axisLine={false} tickLine={false} width={64} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="hsl(35,96%,50%)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Deflection phrases (Q&A)</span>
              <span className="font-mono text-sm font-semibold text-negative">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Direct answer rate (Q&A)</span>
              <span className="font-mono text-sm font-semibold text-caution">58%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">CEO/CFO divergence</span>
              <span className="font-mono text-sm font-semibold text-text-secondary">12 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence explorer */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="border-b border-border flex items-center">
          {(["promotional","deflection","admissions"] as EvidenceKey[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs capitalize border-b-2 transition-colors ${
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-text-secondary hover:text-foreground"
              }`}
            >
              {tab === "promotional" ? "Promotional Language" : tab === "deflection" ? "Deflection Phrases" : "Admissions of Constraints"}
              <span className="ml-1.5 font-mono text-xxs text-text-tertiary">({EVIDENCE[tab].length})</span>
            </button>
          ))}
        </div>

        <div className="p-4 space-y-2">
          {EVIDENCE[activeTab].map(item => (
            <div key={item.id} className="border border-border rounded overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full flex items-start gap-2.5 p-3 text-left hover:bg-surface-elevated transition-colors"
              >
                {expanded === item.id
                  ? <ChevronDown className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />
                  : <ChevronRight className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xs text-foreground italic leading-relaxed">"{item.excerpt}"</p>
                  <p className="text-xxs text-text-tertiary mt-1">— {item.context}</p>
                </div>
              </button>
              {expanded === item.id && (
                <div className="px-4 pb-4 pl-10 space-y-2">
                  <div className="p-3 bg-surface-2 rounded border border-border">
                    <p className="font-serif text-xs text-text-secondary italic leading-relaxed">{item.full}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xxs text-text-tertiary">
                    <span className="font-mono">{item.speaker}</span>
                    <span>·</span>
                    <span>{item.section}</span>
                    <Link to={`/company/${ticker}/transcripts`} className="ml-auto text-primary hover:underline flex items-center gap-1">
                      View in transcript <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagementTone;
