import { useState } from "react";
import { AlertTriangle, TrendingUp, ChevronDown, ChevronRight, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

const RISKS = [
  { id: "r1", title: "Antitrust Litigation (DOJ)", cat: "Regulatory/Legal", priority: 9, prob: "High", impact: "High", firstMention: "Q2 FY24", mentions: 4, evidence: "Ongoing DOJ antitrust case could force structural changes to our ecosystem integration.", full: "Legal team provided update on federal antitrust litigation, acknowledging the case represents a significant risk to current business practices around App Store, default search arrangements, and cross-device integration. Resolution timeline remains uncertain." },
  { id: "r2", title: "EU Regulatory (DMA Compliance)", cat: "Regulatory/Legal", priority: 8, prob: "Medium", impact: "High", firstMention: "Q3 FY23", mentions: 6, evidence: "The Digital Markets Act compliance will require significant changes to our App Store business model.", full: "CFO discussed the impact of EU regulatory requirements, noting that compliance with the Digital Markets Act will necessitate substantial operational and technical changes to the App Store business." },
  { id: "r3", title: "China Market Slowdown", cat: "Geopolitical", priority: 6, prob: "Medium", impact: "Medium", firstMention: "Q1 FY24", mentions: 8, evidence: "Greater China revenue declined 3% year-over-year amid increased local competition.", full: "Q3 results showed continued pressure in the Greater China region, with management citing both macroeconomic headwinds and intensifying competition from domestic smartphone manufacturers." },
  { id: "r4", title: "Supply Chain Disruption", cat: "Supply Chain", priority: 7, prob: "Low", impact: "Medium", firstMention: "Q4 FY22", mentions: 12, evidence: "We're monitoring potential disruptions in Asian component suppliers due to geopolitical tensions.", full: "Management acknowledged ongoing supply chain monitoring, particularly focused on semiconductor and display component suppliers in the Asia-Pacific region. Contingency planning is in place." },
  { id: "r5", title: "AI Competitive Displacement", cat: "Competition", priority: 7, prob: "Medium", impact: "High", firstMention: "Q1 FY25", mentions: 3, evidence: "Emerging AI-native competitors could disrupt our core device and services ecosystems.", full: "New entry from AI-first companies represents a medium-term risk to services monetization and device stickiness, particularly in productivity and search-adjacent features." },
];

const CATALYSTS = [
  { id: "c1", title: "New Product Launch (Vision Pro 2)", type: "Hard", date: "Q4 FY25", priority: 8, evidence: "Vision Pro second generation expected to address price and form factor concerns.", full: "Management confirmed iterative product development with next generation addressing major customer feedback themes: price, weight, and battery life." },
  { id: "c2", title: "Services Revenue Acceleration", type: "Soft", priority: 9, evidence: "Services margin expansion expected to drive EPS beat in next 3 quarters.", full: "Structural growth in Services gross margin from 71% to 75%+ expected as licensing revenues scale faster than cost." },
  { id: "c3", title: "AI Siri Re-launch", type: "Soft", date: "WWDC 2026", priority: 7, evidence: "Overhauled AI assistant positioned as first-party alternative to ChatGPT on device.", full: "On-device AI model integration will be a key platform differentiator by CY 2026, per management commentary." },
  { id: "c4", title: "India Manufacturing Ramp", type: "Hard", date: "H1 FY26", priority: 6, evidence: "Diversified manufacturing from China to India reduces supply chain risk and tariff exposure.", full: "10% of global iPhone production now in India; target 25% by FY26. Significant margin and geopolitical hedge." },
];

type Risk = typeof RISKS[0];
type Cat = typeof CATALYSTS[0];

const probColor = (p: string) => p === "High" ? "text-negative" : p === "Medium" ? "text-caution" : "text-text-secondary";
const impactColor = (i: string) => i === "High" ? "text-negative" : i === "Medium" ? "text-caution" : "text-text-secondary";

const RisksCatalysts = () => {
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");
  const [tab, setTab] = useState<"risks" | "catalysts">("risks");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const cats = ["All", "Regulatory/Legal", "Geopolitical", "Supply Chain", "Competition", "Financial"];

  const filteredRisks = RISKS.filter(r =>
    (catFilter === "All" || r.cat === catFilter) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border">
        {(["risks","catalysts"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            {t === "risks" ? `Risks (${RISKS.length})` : `Catalysts (${CATALYSTS.length})`}
          </button>
        ))}
      </div>

      {tab === "risks" && (
        <>
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search risks..."
                className="pl-8 h-7 text-xs bg-surface-elevated border-border/50"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    catFilter === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-text-secondary hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setViewMode("list")} className={`px-2.5 py-1 rounded text-xs border ${viewMode === "list" ? "bg-primary text-primary-foreground border-primary" : "border-border text-text-secondary hover:text-foreground"}`}>List</button>
              <button onClick={() => setViewMode("matrix")} className={`px-2.5 py-1 rounded text-xs border ${viewMode === "matrix" ? "bg-primary text-primary-foreground border-primary" : "border-border text-text-secondary hover:text-foreground"}`}>Matrix</button>
            </div>
          </div>

          {viewMode === "matrix" ? (
            /* 2-axis scatter matrix */
            <div className="bg-card border border-border rounded p-4">
              <div className="text-xs font-medium mb-4">Probability × Impact Matrix</div>
              <div className="relative h-64 border-l-2 border-b-2 border-border ml-8 mr-4">
                {/* Y-axis label */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xxs text-text-tertiary th-label whitespace-nowrap">Impact</div>
                {/* X-axis label */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5 text-xxs text-text-tertiary th-label">Probability</div>

                {/* Quadrant shading */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-negative/5 rounded" />

                {/* Risks as dots */}
                {filteredRisks.map(r => {
                  const x = r.prob === "Low" ? 15 : r.prob === "Medium" ? 50 : 82;
                  const y = r.impact === "Low" ? 80 : r.impact === "Medium" ? 50 : 18;
                  return (
                    <div
                      key={r.id}
                      className="absolute flex items-center justify-center cursor-pointer group"
                      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                      title={r.title}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-110 ${
                        r.priority >= 8 ? "bg-negative/15 border-negative text-negative" : r.priority >= 6 ? "bg-caution/15 border-caution text-caution" : "bg-surface-elevated border-border text-text-secondary"
                      }`}>
                        {r.priority}
                      </div>
                      <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl">
                        {r.title}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-6 text-xxs text-text-tertiary">
                <span><span className="inline-block w-3.5 h-3.5 rounded-full bg-negative/15 border border-negative align-middle mr-1" />Priority ≥ 8</span>
                <span><span className="inline-block w-3.5 h-3.5 rounded-full bg-caution/15 border border-caution align-middle mr-1" />Priority 6–7</span>
                <span>Number = priority score</span>
              </div>
            </div>
          ) : (
            /* List view */
            <div className="space-y-2">
              {filteredRisks.map(r => (
                <div key={r.id} className="bg-card border border-border rounded overflow-hidden">
                  <button
                    onClick={() => setExpandedRisk(expandedRisk === r.id ? null : r.id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-elevated transition-colors"
                  >
                    {expandedRisk === r.id ? <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground">{r.title}</span>
                        <span className="text-xxs text-text-tertiary border border-border rounded px-1.5 py-0.5">{r.cat}</span>
                        {r.firstMention !== "Q4 FY22" && <span className="text-xxs text-info">NEW Q</span>}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{r.evidence}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-xs">
                      <div className="text-right hidden sm:block">
                        <div className="th-label">Prob</div>
                        <div className={`font-mono font-semibold ${probColor(r.prob)}`}>{r.prob}</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="th-label">Impact</div>
                        <div className={`font-mono font-semibold ${impactColor(r.impact)}`}>{r.impact}</div>
                      </div>
                      <div className="text-right">
                        <div className="th-label">Priority</div>
                        <div className={`score-num text-lg ${r.priority >= 8 ? "text-negative" : "text-caution"}`}>{r.priority}/10</div>
                      </div>
                    </div>
                  </button>
                  {expandedRisk === r.id && (
                    <div className="px-4 pb-4 pl-9 space-y-2.5 border-t border-border">
                      <p className="font-serif text-xs text-text-secondary leading-relaxed italic mt-3">{r.full}</p>
                      <div className="flex items-center gap-4 text-xxs text-text-tertiary">
                        <span>First mentioned: <span className="font-mono text-text-secondary">{r.firstMention}</span></span>
                        <span>Mentions: <span className="font-mono text-text-secondary">{r.mentions}×</span></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "catalysts" && (
        /* Catalyst timeline */
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary mb-3">Hard-dated catalysts shown with date · Soft catalysts are directional signals without firm dates</div>
          {CATALYSTS.sort((a, b) => b.priority - a.priority).map(c => (
            <div key={c.id} className="bg-card border border-border rounded overflow-hidden">
              <button
                onClick={() => setExpandedCat(expandedCat === c.id ? null : c.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-elevated transition-colors"
              >
                {expandedCat === c.id ? <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{c.title}</span>
                    <span className={`text-xxs border rounded px-1.5 py-0.5 ${c.type === "Hard" ? "border-positive/40 text-positive" : "border-info/40 text-info"}`}>{c.type}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{c.evidence}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {c.date && (
                    <div className="text-right hidden sm:block">
                      <div className="th-label">Timeline</div>
                      <div className="flex items-center gap-1 font-mono text-xs text-text-secondary">
                        <Calendar className="h-3 w-3" />{c.date}
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="th-label">Priority</div>
                    <div className="score-num text-lg text-positive">{c.priority}/10</div>
                  </div>
                </div>
              </button>
              {expandedCat === c.id && (
                <div className="px-4 pb-4 pl-9 border-t border-border">
                  <p className="font-serif text-xs text-text-secondary leading-relaxed italic mt-3">{c.full}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RisksCatalysts;
