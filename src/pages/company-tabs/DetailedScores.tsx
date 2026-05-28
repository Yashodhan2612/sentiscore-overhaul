import { useState } from "react";
import { ChevronRight, Info } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const DIMENSIONS = [
  { name: "Overall Sentiment Score", abbr: "OSS", group: "Sentiment",
    scores: { "Q4'22": 64, "Q1'23": 67, "Q2'23": 70, "Q3'23": 68, "Q4'23": 70, "Q1'24": 73, "Q2'24": 75, "Q3'24": 78 },
    description: "Composite sentiment derived from all positive/negative language in the call." },
  { name: "Tone Shift Score", abbr: "TSS", group: "Sentiment",
    scores: { "Q4'22": 18, "Q1'23": 16, "Q2'23": 14, "Q3'23": 17, "Q4'23": 15, "Q1'24": 13, "Q2'24": 14, "Q3'24": 12 },
    lowerBetter: true,
    description: "Measures tone divergence vs. prior quarter. Lower = more consistent." },
  { name: "Sentiment Volatility", abbr: "SVS", group: "Sentiment",
    scores: { "Q4'22": 22, "Q1'23": 20, "Q2'23": 18, "Q3'23": 21, "Q4'23": 19, "Q1'24": 17, "Q2'24": 16, "Q3'24": 15 },
    lowerBetter: true,
    description: "Variance of sentiment across speakers and sections. Lower = more uniform message." },
  { name: "Management Confidence", abbr: "MC", group: "Outlook",
    scores: { "Q4'22": 60, "Q1'23": 62, "Q2'23": 65, "Q3'23": 63, "Q4'23": 65, "Q1'24": 68, "Q2'24": 70, "Q3'24": 72 } },
  { name: "Uncertainty Index", abbr: "UI", group: "Outlook",
    scores: { "Q4'22": 45, "Q1'23": 43, "Q2'23": 40, "Q3'23": 42, "Q4'23": 40, "Q1'24": 38, "Q2'24": 37, "Q3'24": 35 },
    lowerBetter: true },
  { name: "Forward-Looking Index", abbr: "FLI", group: "Outlook",
    scores: { "Q4'22": 60, "Q1'23": 62, "Q2'23": 64, "Q3'23": 63, "Q4'23": 65, "Q1'24": 66, "Q2'24": 67, "Q3'24": 68 } },
  { name: "Growth Orientation", abbr: "GO", group: "Outlook",
    scores: { "Q4'22": 68, "Q1'23": 70, "Q2'23": 74, "Q3'23": 72, "Q4'23": 74, "Q1'24": 77, "Q2'24": 80, "Q3'24": 82 } },
  { name: "PPI (Promotional Preparedness)", abbr: "PPI", group: "Tone",
    scores: { "Q4'22": 65, "Q1'23": 67, "Q2'23": 69, "Q3'23": 68, "Q4'23": 70, "Q1'24": 71, "Q2'24": 72, "Q3'24": 72 },
    description: "Puffery level in prepared remarks. Higher = more promotional language." },
  { name: "CQTI (Q&A Transparency)", abbr: "CQTI", group: "Tone",
    scores: { "Q4'22": 50, "Q1'23": 48, "Q2'23": 47, "Q3'23": 46, "Q4'23": 46, "Q1'24": 45, "Q2'24": 46, "Q3'24": 45 },
    description: "Candor in Q&A answers. Higher = more transparent, fewer deflections." },
  { name: "Tone Gap (PPI–CQTI)", abbr: "TG", group: "Tone",
    scores: { "Q4'22": 15, "Q1'23": 19, "Q2'23": 22, "Q3'23": 22, "Q4'23": 24, "Q1'24": 26, "Q2'24": 26, "Q3'24": 27 },
    lowerBetter: true, flagAbove: 30,
    description: "Gap between prepared-remarks puffery and Q&A candor. Above 30 = red flag." },
  { name: "CEO/CFO Divergence", abbr: "CEOCFO", group: "Tone",
    scores: { "Q4'22": 8, "Q1'23": 9, "Q2'23": 10, "Q3'23": 11, "Q4'23": 10, "Q1'24": 11, "Q2'24": 12, "Q3'24": 12 },
    lowerBetter: true },
  { name: "Q&A Transparency", abbr: "QAT", group: "Communication",
    scores: { "Q4'22": 68, "Q1'23": 67, "Q2'23": 66, "Q3'23": 67, "Q4'23": 66, "Q1'24": 65, "Q2'24": 66, "Q3'24": 65 } },
  { name: "Answer Specificity", abbr: "AS", group: "Communication",
    scores: { "Q4'22": 65, "Q1'23": 66, "Q2'23": 68, "Q3'23": 67, "Q4'23": 68, "Q1'24": 69, "Q2'24": 70, "Q3'24": 70 } },
  { name: "Deflection Rate", abbr: "DR", group: "Communication",
    scores: { "Q4'22": 35, "Q1'23": 37, "Q2'23": 38, "Q3'23": 36, "Q4'23": 37, "Q1'24": 38, "Q2'24": 39, "Q3'24": 38 },
    lowerBetter: true },
  { name: "News Sentiment Score", abbr: "NSS", group: "External",
    scores: { "Q4'22": 58, "Q1'23": 60, "Q2'23": 63, "Q3'23": 61, "Q4'23": 63, "Q1'24": 67, "Q2'24": 69, "Q3'24": 71 } },
  { name: "Social Sentiment Score", abbr: "SSS", group: "External",
    scores: { "Q4'22": 55, "Q1'23": 57, "Q2'23": 60, "Q3'23": 58, "Q4'23": 60, "Q1'24": 63, "Q2'24": 65, "Q3'24": 68 } },
  { name: "Inter-Quarter Signal", abbr: "IQS", group: "External",
    scores: { "Q4'22": 60, "Q1'23": 61, "Q2'23": 63, "Q3'23": 62, "Q4'23": 64, "Q1'24": 65, "Q2'24": 65, "Q3'24": 65 } },
  { name: "Insider Divergence", abbr: "INDIV", group: "External",
    scores: { "Q4'22": 20, "Q1'23": 22, "Q2'23": 24, "Q3'23": 28, "Q4'23": 30, "Q1'24": 35, "Q2'24": 38, "Q3'24": 42 },
    lowerBetter: true },
  { name: "OSS Composite (L1)", abbr: "OSS-L1", group: "Composite",
    scores: { "Q4'22": 62, "Q1'23": 65, "Q2'23": 68, "Q3'23": 66, "Q4'23": 68, "Q1'24": 72, "Q2'24": 74, "Q3'24": 78 },
    description: "L1 transcript-derived OSS aggregate. Weighted 50% in ESS." },
  { name: "NSS Composite (L2)", abbr: "NSS-L2", group: "Composite",
    scores: { "Q4'22": 58, "Q1'23": 61, "Q2'23": 64, "Q3'23": 62, "Q4'23": 64, "Q1'24": 67, "Q2'24": 70, "Q3'24": 72 },
    description: "L2 news sentiment aggregate (NSS). Weighted 30% in ESS." },
  { name: "SSS Composite (L3)", abbr: "SSS-L3", group: "Composite",
    scores: { "Q4'22": 54, "Q1'23": 57, "Q2'23": 60, "Q3'23": 58, "Q4'23": 60, "Q1'24": 63, "Q2'24": 65, "Q3'24": 68 },
    description: "L3 social sentiment aggregate (SSS). Weighted 20% in ESS." },
  { name: "ESS (Extended SentiScore)", abbr: "ESS", group: "Composite",
    scores: { "Q4'22": 60, "Q1'23": 63, "Q2'23": 66, "Q3'23": 64, "Q4'23": 66, "Q1'24": 70, "Q2'24": 72, "Q3'24": 76 },
    description: "ESS = 50% OSS (L1) + 30% NSS (L2) + 20% SSS (L3). Primary composite score." },
];

const QUARTERS = ["Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24"];

const cellColor = (v: number, lb = false, flagAbove?: number) => {
  if (flagAbove !== undefined && v >= flagAbove) return "bg-negative/20 text-negative font-bold";
  const e = lb ? 100 - v : v;
  if (e >= 75) return "bg-positive/15 text-positive";
  if (e >= 60) return "bg-caution/10 text-caution";
  return "bg-negative/10 text-negative";
};

const GROUPS = ["Sentiment","Outlook","Tone","Communication","External","Composite"];

const DetailedScores = () => {
  const { ticker } = useParams();
  const [selected, setSelected] = useState<typeof DIMENSIONS[0] | null>(null);
  const [activeGroup, setActiveGroup] = useState("All");

  const filtered = activeGroup === "All" ? DIMENSIONS : DIMENSIONS.filter(d => d.group === activeGroup);

  return (
    <div className="space-y-4">
      {/* Group filter */}
      <div className="flex items-center gap-1 flex-wrap">
        {["All", ...GROUPS].map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-3 py-1 rounded text-xs transition-colors ${activeGroup === g ? "bg-primary text-primary-foreground" : "bg-card border border-border text-text-secondary hover:text-foreground"}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Heatmap matrix */}
        <div className="flex-1 overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="th-label text-left py-2 pr-4 sticky left-0 bg-background z-10 min-w-44">Dimension</th>
                <th className="th-label text-center py-2 px-1 min-w-8">Abbr</th>
                {QUARTERS.map(q => (
                  <th key={q} className="th-label text-center py-2 px-1 min-w-14">{q}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(dim => (
                <tr
                  key={dim.abbr}
                  className="hover:bg-surface-elevated transition-colors cursor-pointer"
                  onClick={() => setSelected(selected?.abbr === dim.abbr ? null : dim)}
                >
                  <td className="py-1.5 pr-4 sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${selected?.abbr === dim.abbr ? "text-primary" : "text-text-secondary"}`}>{dim.name}</span>
                      {dim.description && <Info className="h-3 w-3 text-text-tertiary shrink-0" />}
                    </div>
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    <span className="font-mono text-xxs text-text-tertiary">{dim.abbr}</span>
                  </td>
                  {QUARTERS.map(q => (
                    <td key={q} className="py-1 px-0.5 text-center">
                      <span className={`inline-block font-mono text-xs px-1.5 py-0.5 rounded ${cellColor(dim.scores[q], dim.lowerBetter, dim.flagAbove)}`}>
                        {dim.scores[q]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side panel — evidence drill-down */}
        {selected && (
          <div className="w-72 shrink-0 bg-card border border-border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{selected.abbr}</span>
              <button onClick={() => setSelected(null)} className="text-text-tertiary hover:text-foreground text-xs">Close</button>
            </div>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              {selected.description || "Click any cell to view evidence from that quarter's transcript."}
            </p>
            <div className="text-xs font-medium mb-2">Q3'24 Evidence</div>
            <div className="space-y-2">
              <div className="p-2 bg-surface-elevated rounded border border-border text-xs text-text-secondary font-serif italic leading-relaxed">
                "We're seeing unprecedented growth in our services segment, driven by strong adoption across all regions..."
              </div>
              <div className="p-2 bg-surface-elevated rounded border border-border text-xs text-text-secondary font-serif italic leading-relaxed">
                "Our innovation pipeline remains robust, and we're incredibly excited about the opportunities ahead..."
              </div>
            </div>
            <Link
              to={`/company/${ticker}/transcripts`}
              className="mt-3 text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Open in transcript <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      <div className="text-xxs text-text-tertiary">
        Click any row to drill into evidence from the transcript. Lower-is-better metrics (Uncertainty, Tone Gap, etc.) are inverted for color scaling.
      </div>
    </div>
  );
};

export default DetailedScores;
