import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

const TRANSCRIPT = [
  { id: "t1", section: "prepared", speaker: "Tim Cook", role: "CEO", sentiment: 85, text: "Good afternoon and thank you for joining us. Today I'm pleased to share that we achieved record revenue this quarter, driven by exceptional growth in our Services business and continued strong demand for iPhone 15. Our innovation pipeline remains robust, and we're incredibly excited about the opportunities ahead.", highlights: ["exceptional growth", "strong demand", "incredibly excited"], hlType: "positive" },
  { id: "t2", section: "prepared", speaker: "Tim Cook", role: "CEO", sentiment: 74, text: "Looking at our geographic performance, we saw strength across the Americas and Europe, though Greater China faced headwinds from both macroeconomic pressure and competitive dynamics in the smartphone market. We're actively addressing these challenges with targeted investment and product strategy adjustments.", highlights: ["headwinds", "macroeconomic pressure", "competitive dynamics"], hlType: "negative" },
  { id: "t3", section: "prepared", speaker: "Luca Maestri", role: "CFO", sentiment: 81, text: "Our financial performance was outstanding this quarter. Services revenue exceeded expectations, growing 18% year-over-year to a new all-time high. Product revenue was led by iPhone, which generated its highest revenue in any non-holiday quarter. Gross margin was 46.2%, at the high end of our guidance range.", highlights: ["exceeded expectations", "all-time high", "high end of guidance"], hlType: "positive" },
  { id: "t4", section: "prepared", speaker: "Luca Maestri", role: "CFO", sentiment: 68, text: "For the fourth quarter of fiscal 2025, we expect revenue to be between $93 billion and $97 billion. We expect gross margin to be between 46% and 47%. We expect operating expenses to be between $15 billion and $15.5 billion. We expect our tax rate to be approximately 16%.", highlights: [], hlType: "neutral" },
  { id: "t5", section: "qa", speaker: "Analyst", role: "Morgan Stanley", sentiment: 55, text: "Can you provide more color on the Vision Pro trajectory and whether the pace of adoption is meeting your internal expectations for the first year of a new product category?", highlights: [], hlType: "neutral" },
  { id: "t6", section: "qa", speaker: "Tim Cook", role: "CEO", sentiment: 70, text: "Vision Pro represents a major leap forward in spatial computing. While it's still early days, customer feedback has been quite positive, particularly from enterprise customers who are seeing real productivity gains. We're taking a long-term view on this category. That said, we acknowledge that the price point and content ecosystem are areas where we have work to do, and we're actively investing there.", highlights: ["major leap forward", "positive", "areas where we have work to do"], hlType: "mixed" },
  { id: "t7", section: "qa", speaker: "Analyst", role: "Goldman Sachs", sentiment: 52, text: "On the China revenue decline, can you help us understand how much is macro versus share loss to Huawei and domestic competitors? And what gives you confidence in a recovery?", highlights: [], hlType: "neutral" },
  { id: "t8", section: "qa", speaker: "Luca Maestri", role: "CFO", sentiment: 62, text: "It's a combination of both factors, frankly. The macro environment in China continues to be challenging, and we are also seeing some competitive pressure in the premium segment from domestic players. What gives us confidence is the strength of our installed base and the loyalty of our customers. Our customer satisfaction scores in China remain very high, and we continue to see strong upgrade intent among existing iPhone users.", highlights: ["challenging", "competitive pressure"], hlType: "mixed" },
];

const CONTEXT = {
  sectionStats: { sentiment: 74, confidence: 72, specificity: 68 },
  products: ["iPhone 15 Pro", "Services", "Vision Pro", "Mac"],
  risks: ["China competitive pressure", "Vision Pro adoption", "EU regulation"],
  catalysts: ["Services growth", "Enterprise Vision Pro"],
};

const sentimentBadge = (v: number) => {
  if (v >= 75) return "text-positive border-positive/30 bg-positive/5";
  if (v >= 60) return "text-caution border-caution/30 bg-caution/5";
  return "text-negative border-negative/30 bg-negative/5";
};

const highlightText = (text: string, keywords: string[], mode: string) => {
  if (!keywords.length || mode === "none") return text;
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
      : part
  );
};

const TranscriptViewer = () => {
  const [section, setSection] = useState("all");
  const [hlMode, setHlMode] = useState("sentiment");
  const [search, setSearch] = useState("");

  const filtered = TRANSCRIPT.filter(s =>
    (section === "all" || s.section === section) &&
    (!search || s.text.toLowerCase().includes(search.toLowerCase()) || s.speaker.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex gap-4 h-full">
      {/* Main transcript */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-card border border-border rounded overflow-hidden">
            {["all","prepared","qa"].map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`px-2.5 py-1 text-xs transition-colors ${section === s ? "bg-primary text-primary-foreground" : "text-text-secondary hover:text-foreground"}`}
              >
                {s === "all" ? "All" : s === "prepared" ? "Prepared Remarks" : "Q&A"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {["sentiment","risks","catalysts","products","none"].map(m => (
              <button
                key={m}
                onClick={() => setHlMode(m)}
                className={`px-2.5 py-1 rounded text-xs border transition-colors capitalize ${hlMode === m ? "bg-primary/20 border-primary/40 text-foreground" : "border-border text-text-secondary hover:text-foreground"}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transcript..."
              className="pl-8 h-7 text-xs w-48 bg-surface-elevated border-border/50"
            />
          </div>
        </div>

        {/* Jump to */}
        <div className="flex items-center gap-1.5 text-xxs text-text-tertiary">
          <span>Jump to:</span>
          <button onClick={() => setSection("prepared")} className="text-primary hover:underline">Q&A start</button>
          <span>·</span>
          <button className="text-primary hover:underline">Next analyst Q</button>
          <span>·</span>
          <button className="text-primary hover:underline">Guidance section</button>
        </div>

        {/* Transcript paragraphs */}
        <div className="space-y-3">
          {filtered.map(para => (
            <div key={para.id} className={`border rounded p-4 transition-colors ${para.section === "qa" ? "border-surface-elevated bg-surface-2/50" : "border-border bg-card"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-semibold text-foreground">{para.speaker}</span>
                <span className="text-xxs text-text-tertiary">{para.role}</span>
                <span className={`ml-auto px-1.5 py-0.5 rounded border text-xxs font-mono ${sentimentBadge(para.sentiment)}`}>
                  {para.sentiment}
                </span>
                {para.section === "qa" && (
                  <span className="text-xxs border border-border rounded px-1.5 py-0.5 text-text-tertiary">Q&A</span>
                )}
              </div>
              <p className="font-serif text-sm text-text-secondary leading-relaxed">
                {highlightText(para.text, para.highlights, hlMode)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Context sidebar — sticky */}
      <div className="w-56 shrink-0 space-y-3 hidden xl:block">
        <div className="sticky top-4 space-y-3">
          <div className="bg-card border border-border rounded p-3">
            <div className="th-label mb-2">Section Stats</div>
            {Object.entries(CONTEXT.sectionStats).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1">
                <span className="text-xs text-text-secondary capitalize">{k}</span>
                <span className="font-mono text-xs text-foreground">{v}</span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded p-3">
            <div className="th-label mb-2">Products Mentioned</div>
            {CONTEXT.products.map(p => (
              <div key={p} className="text-xs text-text-secondary py-0.5">{p}</div>
            ))}
          </div>

          <div className="bg-card border border-border rounded p-3">
            <div className="th-label mb-2">Risks</div>
            {CONTEXT.risks.map(r => (
              <div key={r} className="text-xs text-text-secondary py-0.5">{r}</div>
            ))}
          </div>

          <div className="bg-card border border-border rounded p-3">
            <div className="th-label mb-2">Catalysts</div>
            {CONTEXT.catalysts.map(c => (
              <div key={c} className="text-xs text-positive py-0.5">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptViewer;
