import { useState } from "react";
import { Save, RotateCcw, Copy, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_PARAMS = {
  promotionalWeight: 1.0,
  hedgingPenalty: 1.0,
  specificityBonus: 1.0,
  confidenceThreshold: 50,
  volatilitySensitivity: 50,
};

const HOUSE_PARAMS = {
  promotionalWeight: 1.0,
  hedgingPenalty: 1.0,
  specificityBonus: 1.0,
  confidenceThreshold: 50,
  volatilitySensitivity: 50,
};

const BASELINE = [
  { name: "Overall Sentiment", abbr: "OSS", value: 68, group: "Sentiment" },
  { name: "Product Sentiment", abbr: "PS", value: 72, group: "Sentiment" },
  { name: "Financial Sentiment", abbr: "FS", value: 65, group: "Sentiment" },
  { name: "Sentiment Volatility", abbr: "SV", value: 42, group: "Sentiment", lowerBetter: true },
  { name: "Outlook Score", abbr: "OLK", value: 70, group: "Outlook" },
  { name: "Conviction Score", abbr: "CON", value: 58, group: "Outlook" },
  { name: "Guidance Quality", abbr: "GQ", value: 61, group: "Communication" },
  { name: "Transparency Score", abbr: "TRN", value: 75, group: "Communication" },
  { name: "PPI", abbr: "PPI", value: 72, group: "Tone" },
  { name: "CQTI", abbr: "CQTI", value: 45, group: "Tone" },
  { name: "Tone Gap", abbr: "TG", value: 27, group: "Tone", lowerBetter: true },
  { name: "ESS (Extended SentiScore)", abbr: "ESS", value: 74, group: "Composite" },
];

type Params = typeof DEFAULT_PARAMS;

const calcAdjusted = (base: typeof BASELINE, params: Params) =>
  base.map(s => {
    let adj = 0;
    if (s.abbr === "PS") adj += (params.promotionalWeight - 1) * 10;
    if (s.abbr === "OSS") { adj += (params.hedgingPenalty - 1) * -8; adj += (params.specificityBonus - 1) * 5; }
    if (s.abbr === "SV") adj += (params.volatilitySensitivity - 50) / 5;
    if (s.abbr === "CON") adj += (params.confidenceThreshold - 50) / 10;
    if (s.abbr === "ESS") adj = (
      ((params.promotionalWeight - 1) * 5) +
      ((params.specificityBonus - 1) * 3) +
      ((params.confidenceThreshold - 50) / 15)
    );
    const v = Math.max(0, Math.min(100, s.value + adj));
    return { ...s, adjusted: Math.round(v), delta: Math.round(v - s.value) };
  });

const deltaColor = (d: number) => d > 0 ? "delta-pos" : d < 0 ? "delta-neg" : "delta-muted";
const scoreColor = (v: number, lb = false) => { const e = lb ? 100 - v : v; return e >= 70 ? "text-positive" : e >= 50 ? "text-caution" : "text-negative"; };

const Playground = () => {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const [presetName, setPresetName] = useState("");

  const adjusted = calcAdjusted(BASELINE, params);
  const house = calcAdjusted(BASELINE, HOUSE_PARAMS);
  const hasChanges = JSON.stringify(params) !== JSON.stringify(DEFAULT_PARAMS);

  const setParam = (key: keyof Params, val: number) =>
    setParams(p => ({ ...p, [key]: val }));

  const PARAM_CONFIG = [
    { key: "promotionalWeight" as keyof Params, label: "Promotional Weight", min: 0.5, max: 1.5, step: 0.05, fmt: (v: number) => v.toFixed(2), desc: "Scales PPI contribution to ESS" },
    { key: "hedgingPenalty" as keyof Params, label: "Hedging Penalty", min: 0.5, max: 1.5, step: 0.05, fmt: (v: number) => v.toFixed(2), desc: "Penalizes hedged/uncertain language" },
    { key: "specificityBonus" as keyof Params, label: "Specificity Bonus", min: 0.5, max: 1.5, step: 0.05, fmt: (v: number) => v.toFixed(2), desc: "Rewards quantitative specificity" },
    { key: "confidenceThreshold" as keyof Params, label: "Confidence Threshold", min: 0, max: 100, step: 5, fmt: (v: number) => `${v}`, desc: "Min confidence level to count as strong signal" },
    { key: "volatilitySensitivity" as keyof Params, label: "Volatility Sensitivity", min: 0, max: 100, step: 5, fmt: (v: number) => `${v}`, desc: "Weight given to tone volatility penalty" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Calibration</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Adjust algorithm parameters and see the effect on all 12 dimensions in real time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setParams(DEFAULT_PARAMS)}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="h-3.5 w-3.5" /> Save preset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tweaking">
        <TabsList className="h-8 gap-0 bg-card border border-border p-0 rounded overflow-hidden">
          <TabsTrigger value="tweaking" className="rounded-none border-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs h-full px-4">Parameters</TabsTrigger>
          <TabsTrigger value="scenario" className="rounded-none border-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs h-full px-4">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="tweaking" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Parameters panel */}
            <div className="lg:col-span-4 bg-card border border-border rounded p-4 space-y-5">
              <div className="th-label">Algorithm Parameters</div>
              {PARAM_CONFIG.map(cfg => (
                <div key={cfg.key}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-text-secondary">{cfg.label}</Label>
                    <span className={`font-mono text-sm font-semibold ${hasChanges && params[cfg.key] !== DEFAULT_PARAMS[cfg.key] ? "text-primary" : "text-foreground"}`}>
                      {cfg.fmt(params[cfg.key] as number)}
                    </span>
                  </div>
                  <Slider
                    value={[params[cfg.key] as number]}
                    min={cfg.min}
                    max={cfg.max}
                    step={cfg.step}
                    onValueChange={([v]) => setParam(cfg.key, v)}
                    className="mb-1"
                  />
                  <p className="text-xxs text-text-tertiary">{cfg.desc}</p>
                </div>
              ))}
            </div>

            {/* Before/after delta table */}
            <div className="lg:col-span-8">
              <div className="bg-card border border-border rounded overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-medium">Impact — Baseline vs Adjusted</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-text-tertiary hover:text-foreground">
                    <Copy className="h-3 w-3" /> Copy diff
                  </Button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2 th-label">Dimension</th>
                      <th className="text-right px-3 py-2 th-label">Baseline</th>
                      <th className="text-right px-3 py-2 th-label">Adjusted</th>
                      <th className="text-right px-3 py-2 th-label">Δ</th>
                      <th className="text-right px-3 py-2 th-label">House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjusted.map(s => (
                      <tr key={s.abbr} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors">
                        <td className="px-4 py-2">
                          <div>
                            <span className="text-xs text-text-secondary">{s.name}</span>
                            <span className="text-xxs text-text-tertiary ml-1.5 font-mono">({s.abbr})</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`font-mono text-sm ${scoreColor(s.value, s.lowerBetter)}`}>{s.value}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`font-mono text-sm ${scoreColor(s.adjusted, s.lowerBetter)}`}>{s.adjusted}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`font-mono text-xs ${deltaColor(s.delta)}`}>
                            {s.delta !== 0 ? (s.delta > 0 ? "+" : "") + s.delta : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`font-mono text-xs text-text-tertiary`}>
                            {house.find(h => h.abbr === s.abbr)?.value}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xxs text-text-tertiary">
                <span><span className="font-mono text-foreground">Baseline</span> = house defaults</span>
                <span><span className="font-mono text-primary">Adjusted</span> = your parameter changes</span>
                <span><span className="font-mono text-text-tertiary">House</span> = locked consensus preset (read-only)</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scenario" className="mt-4">
          <div className="bg-card border border-border rounded p-8 text-center">
            <div className="text-sm font-medium text-foreground mb-2">Scenario Simulation</div>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Run hypothetical scenarios: "What if management had been 20% more specific in Q&A?" or
              "What if tone gap narrowed to 15?"
            </p>
            <Button size="sm" className="mt-4 bg-primary text-primary-foreground text-xs">
              Build a scenario
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Playground;
