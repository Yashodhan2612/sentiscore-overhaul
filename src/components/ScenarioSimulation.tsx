import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Undo2, Redo2, RotateCcw, FileDown } from "lucide-react";

const ORIGINAL_TRANSCRIPT = `Q2 2024 Earnings Call Transcript

CEO: Good afternoon everyone. I'm pleased to report another strong quarter with revenue growth of 15% year-over-year, reaching $85.2 billion. Our Services segment continues to show exceptional momentum, growing 18% and now representing 28% of total revenue.

The launch of Vision Pro exceeded our expectations. While it's early days, customer reception has been overwhelmingly positive. We're seeing strong adoption in enterprise applications, particularly in design, training, and collaboration use cases.

iPhone revenue was up 8% despite market headwinds. The iPhone 15 Pro Max is our most successful premium device launch to date. We're particularly encouraged by switcher rates from Android, which reached a record high this quarter.

CFO: From a financial perspective, we're maintaining healthy gross margins at 46.5%, up 120 basis points year-over-year. Operating leverage continues to improve as we scale our Services business.

Our balance sheet remains robust with $165 billion in cash and marketable securities. We returned $28 billion to shareholders this quarter through dividends and buybacks, and we're increasing our quarterly dividend by 4%.

Looking ahead, we expect revenue growth in the mid-single digits for Q3, with continued margin expansion. We're monitoring supply chain conditions closely, but we feel confident in our ability to meet demand.

Q&A Session:

Analyst 1: Can you provide more color on Vision Pro demand and production capacity?

CEO: We're ramping production steadily. Demand has been strong, but we're being methodical about the rollout to ensure the best customer experience. We expect to expand to additional markets in the second half of the year.

Analyst 2: How are you thinking about AI integration across your product portfolio?

CEO: AI is foundational to everything we do. We've been investing in machine learning for over a decade. You're seeing it in features like Personal Voice, advanced photo editing, and predictive text. We have significant developments coming that will further integrate AI capabilities while maintaining our privacy-first approach.`;

const BASELINE_SCORES = [
  { name: "Overall Sentiment", value: 68 },
  { name: "Product Sentiment", value: 72 },
  { name: "Financial Sentiment", value: 65 },
  { name: "Volatility Score", value: 42 },
  { name: "Outlook Score", value: 70 },
  { name: "Conviction Score", value: 58 },
  { name: "Guidance Quality", value: 61 },
  { name: "Transparency Score", value: 75 },
];

const ScenarioSimulation = () => {
  const [transcript, setTranscript] = useState(ORIGINAL_TRANSCRIPT);
  const [history, setHistory] = useState<string[]>([ORIGINAL_TRANSCRIPT]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showDiffView, setShowDiffView] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate modified scores based on transcript changes
  const calculateModifiedScores = () => {
    const modifiedScores = BASELINE_SCORES.map(score => {
      let adjustment = 0;
      
      // Simple simulation based on keyword presence
      const lowerTranscript = transcript.toLowerCase();
      
      if (score.name === "Overall Sentiment") {
        adjustment += (transcript.match(/strong|positive|exceeded|record/gi)?.length || 0) * 2;
        adjustment -= (transcript.match(/concern|headwind|challenge|decline/gi)?.length || 0) * 2;
      }
      
      if (score.name === "Product Sentiment") {
        adjustment += (transcript.match(/vision pro|iphone|exceptional|overwhelmingly positive/gi)?.length || 0) * 3;
        adjustment -= (transcript.match(/disappointed|below expectations/gi)?.length || 0) * 3;
      }
      
      if (score.name === "Financial Sentiment") {
        adjustment += (transcript.match(/revenue growth|margin expansion|robust/gi)?.length || 0) * 2;
        adjustment -= (transcript.match(/margin pressure|decline/gi)?.length || 0) * 2;
      }
      
      if (score.name === "Outlook Score") {
        adjustment += (transcript.match(/confident|expect.*growth|expansion/gi)?.length || 0) * 2;
        adjustment -= (transcript.match(/uncertain|monitoring.*closely/gi)?.length || 0) * 2;
      }
      
      if (score.name === "Conviction Score") {
        adjustment += (transcript.match(/we will|we're committed|confident/gi)?.length || 0) * 2;
        adjustment -= (transcript.match(/might|could|potentially/gi)?.length || 0) * 1;
      }
      
      const newValue = Math.max(0, Math.min(100, score.value + adjustment));
      return {
        ...score,
        modifiedValue: Math.round(newValue),
        delta: Math.round(newValue - score.value),
        percentChange: score.value > 0 ? ((newValue - score.value) / score.value * 100).toFixed(1) : "0.0"
      };
    });
    
    return modifiedScores;
  };

  const modifiedScores = calculateModifiedScores();
  const changedScores = modifiedScores.filter(s => s.delta !== 0);

  const handleTranscriptChange = (value: string) => {
    setTranscript(value);
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTranscript(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTranscript(history[historyIndex + 1]);
    }
  };

  const handleReset = () => {
    setTranscript(ORIGINAL_TRANSCRIPT);
    setHistory([ORIGINAL_TRANSCRIPT]);
    setHistoryIndex(0);
  };

  const wordCount = transcript.trim().split(/\s+/).length;
  const charCount = transcript.length;

  const getScoreColor = (value: number) => {
    if (value >= 70) return "text-positive";
    if (value >= 50) return "text-warning";
    return "text-negative";
  };

  return (
    <div className="space-y-6">
      {/* TOP PANEL: Transcript Editor (40% height) */}
      <div className="h-[400px]">
        <Card className="p-4 bg-surface border-border h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Transcript Editor</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs hover:bg-surface-elevated"
                onClick={handleUndo}
                disabled={historyIndex === 0}
              >
                <Undo2 className="h-3 w-3 mr-1.5" />
                Undo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs hover:bg-surface-elevated"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo2 className="h-3 w-3 mr-1.5" />
                Redo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs hover:bg-surface-elevated"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reset to Original
              </Button>
            </div>
          </div>
          
          <Textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => handleTranscriptChange(e.target.value)}
            className="flex-1 bg-background border-border text-xs font-mono resize-none leading-relaxed"
            placeholder="Edit the transcript to see how scores change..."
          />
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span>{wordCount.toLocaleString()} words</span>
              <span>{charCount.toLocaleString()} characters</span>
            </div>
            <Button size="sm" className="h-8 text-xs">
              <FileDown className="h-3 w-3 mr-1.5" />
              Export Scenario Analysis
            </Button>
          </div>
        </Card>
      </div>

      {/* BOTTOM PANEL: Comparison View (60% height) */}
      <div className="min-h-[500px]">
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Comparison View</h3>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-foreground">Show Diff View</Label>
              <Switch checked={showDiffView} onCheckedChange={setShowDiffView} />
            </div>
          </div>

          {!showDiffView ? (
            /* Split-screen view */
            <div className="grid grid-cols-2 gap-4">
              {/* LEFT: Original Scores */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-text-secondary mb-3">Original Scores</div>
                {BASELINE_SCORES.map((score) => (
                  <div key={score.name} className="p-3 bg-background rounded border border-border opacity-75">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-text-secondary">{score.name}</div>
                      <span className={`text-lg font-semibold ${getScoreColor(score.value)}`}>
                        {score.value}
                      </span>
                    </div>
                    <Progress value={score.value} className="h-1.5" />
                  </div>
                ))}
              </div>

              {/* RIGHT: Modified Scores */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-text-secondary mb-3">Modified Scores</div>
                {modifiedScores.map((score) => {
                  const hasChanged = score.delta !== 0;
                  return (
                    <div
                      key={score.name}
                      className={`p-3 rounded border ${
                        hasChanged ? "bg-warning/10 border-warning/30" : "bg-background border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-text-secondary">{score.name}</div>
                        <div className="flex items-center gap-2">
                          {hasChanged && (
                            <span className={`text-xs font-mono ${score.delta > 0 ? "text-positive" : "text-negative"}`}>
                              {score.delta > 0 ? "+" : ""}{score.delta}
                            </span>
                          )}
                          <span className={`text-lg font-semibold ${getScoreColor(score.modifiedValue)}`}>
                            {score.modifiedValue}
                          </span>
                        </div>
                      </div>
                      <Progress value={score.modifiedValue} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Diff table view */
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-text-secondary mb-3">
                {changedScores.length} score{changedScores.length !== 1 ? "s" : ""} changed
              </div>
              
              {changedScores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-text-secondary font-medium">Score Name</th>
                        <th className="text-right py-2 px-3 text-text-secondary font-medium">Original</th>
                        <th className="text-right py-2 px-3 text-text-secondary font-medium">Modified</th>
                        <th className="text-right py-2 px-3 text-text-secondary font-medium">Delta</th>
                        <th className="text-right py-2 px-3 text-text-secondary font-medium">% Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changedScores
                        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
                        .map((score) => (
                          <tr key={score.name} className="border-b border-border/50 hover:bg-surface-elevated">
                            <td className="py-3 px-3 text-foreground">{score.name}</td>
                            <td className="py-3 px-3 text-right text-text-secondary">{score.value}</td>
                            <td className="py-3 px-3 text-right">
                              <span className={getScoreColor(score.modifiedValue)}>
                                {score.modifiedValue}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={score.delta > 0 ? "text-positive" : "text-negative"}>
                                {score.delta > 0 ? "+" : ""}{score.delta}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={score.delta > 0 ? "text-positive" : "text-negative"}>
                                {score.delta > 0 ? "+" : ""}{score.percentChange}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-text-secondary">
                  No changes detected. Edit the transcript to see score differences.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ScenarioSimulation;
