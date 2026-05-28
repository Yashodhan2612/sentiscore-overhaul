import { useState } from "react";
import Layout from "@/components/Layout";
import { FileText, Download, Plus, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const TEMPLATES = [
  { id: "pre-earn", label: "Pre-Earnings Brief", desc: "ESS snapshot + top risks & catalysts + tone summary" },
  { id: "post-earn", label: "Post-Earnings Recap", desc: "Score delta analysis + management tone assessment" },
  { id: "weekly", label: "Watchlist Weekly", desc: "All book names — weekly delta table + anomalies" },
  { id: "deep-dive", label: "Single-Name Deep Dive", desc: "Full 20-dimension breakdown + transcript highlights" },
];

const TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "JPM", "TSLA", "GS"];
const QUARTERS = ["Q3 FY25", "Q2 FY25", "Q1 FY25", "Q4 FY24", "Q3 FY24"];
const FORMATS = ["PDF", "Excel", "CSV"];

type RecentReport = {
  id: number;
  name: string;
  template: string;
  created: string;
  format: string;
};

const INITIAL_RECENT: RecentReport[] = [
  { id: 1, name: "AAPL Pre-Earnings Brief", template: "Pre-Earnings Brief", created: "Oct 28, 09:12 ET", format: "PDF" },
  { id: 2, name: "Watchlist Weekly — Oct 21", template: "Watchlist Weekly", created: "Oct 21, 07:00 ET", format: "Excel" },
  { id: 3, name: "NVDA Deep Dive — Q3 FY25", template: "Single-Name Deep Dive", created: "Oct 20, 14:35 ET", format: "PDF" },
  { id: 4, name: "JPM Post-Earnings Recap", template: "Post-Earnings Recap", created: "Oct 15, 11:00 ET", format: "PDF" },
  { id: 5, name: "GOOGL Deep Dive — Q3 FY25", template: "Single-Name Deep Dive", created: "Oct 14, 16:20 ET", format: "PDF" },
];

const ReportsPage = () => {
  const [recentReports, setRecentReports] = useState<RecentReport[]>(INITIAL_RECENT);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [selectedQuarter, setSelectedQuarter] = useState("Q3 FY25");
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const isTickerless = (templateId: string) => templateId === "weekly";

  const openGenerate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setGenerating(false);
    setGenProgress(0);
    setGenerateOpen(true);
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    setGenProgress(0);

    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.floor(Math.random() * 15) + 8;
      });
    }, 220);

    setTimeout(() => {
      clearInterval(interval);
      setGenProgress(100);

      const ticker = isTickerless(selectedTemplate.id) ? "Book" : selectedTicker;
      const now = new Date();
      const created = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        ", " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) + " ET";
      const newReport: RecentReport = {
        id: Date.now(),
        name: isTickerless(selectedTemplate.id)
          ? `${selectedTemplate.label} — ${selectedQuarter}`
          : `${ticker} ${selectedTemplate.label}`,
        template: selectedTemplate.label,
        created,
        format: selectedFormat,
      };

      setTimeout(() => {
        setRecentReports(prev => [newReport, ...prev]);
        setGenerateOpen(false);
        setGenerating(false);
        setGenProgress(0);
        toast.success("Report ready", {
          description: `${newReport.name} · ${selectedFormat}`,
          action: {
            label: "Download",
            onClick: () => simulateDownload(newReport),
          },
        });
      }, 500);
    }, 2200);
  };

  const simulateDownload = (report: RecentReport) => {
    setDownloadingId(report.id);
    toast(`Downloading ${report.format}…`, { description: report.name });
    setTimeout(() => {
      setDownloadingId(null);
      toast.success("Download complete", { description: report.name });
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">Reports</h1>
          <p className="text-xs text-text-tertiary mt-0.5">Generate and download analyst-ready reports</p>
        </div>
      </div>

      {/* Templates */}
      <div className="mb-6">
        <h2 className="text-xs th-label mb-3">Templates</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => openGenerate(t)}
              className="p-4 bg-card border border-border rounded text-left hover:border-primary/40 transition-colors group"
            >
              <FileText className="h-5 w-5 text-text-tertiary group-hover:text-primary mb-3 transition-colors" />
              <div className="text-sm font-medium text-foreground mb-1">{t.label}</div>
              <div className="text-xs text-text-tertiary leading-relaxed">{t.desc}</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-3.5 w-3.5" /> Generate
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-xs th-label mb-3">Recent Reports</h2>
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 th-label">Name</th>
                <th className="text-left px-3 py-2 th-label">Template</th>
                <th className="text-left px-3 py-2 th-label">Created</th>
                <th className="text-left px-3 py-2 th-label">Format</th>
                <th className="px-2 py-2 th-label w-16"></th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors group">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                      <span className="text-sm text-foreground">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-secondary">{r.template}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                      <Clock className="h-3 w-3" />{r.created}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-xs font-mono text-text-secondary">
                      {r.format}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-text-tertiary hover:text-foreground opacity-0 group-hover:opacity-100"
                      onClick={() => simulateDownload(r)}
                      disabled={downloadingId === r.id}
                    >
                      {downloadingId === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={v => { if (!generating) setGenerateOpen(v); }}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <DialogTitle className="text-foreground">{selectedTemplate?.label}</DialogTitle>
            </div>
            <DialogDescription className="text-text-secondary">
              {selectedTemplate?.desc}
            </DialogDescription>
          </DialogHeader>

          {!generating ? (
            <div className="mt-2 space-y-4">
              {!isTickerless(selectedTemplate?.id || "") && (
                <div className="space-y-1.5">
                  <label className="th-label block">Company</label>
                  <Select value={selectedTicker} onValueChange={setSelectedTicker}>
                    <SelectTrigger className="h-8 text-xs bg-surface-elevated border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-xs">
                      {TICKERS.map(t => (
                        <SelectItem key={t} value={t} className="text-xs cursor-pointer font-mono">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="th-label block">Period</label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="h-8 text-xs bg-surface-elevated border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-xs">
                    {QUARTERS.map(q => (
                      <SelectItem key={q} value={q} className="text-xs cursor-pointer font-mono">{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="th-label block">Format</label>
                <div className="flex gap-2">
                  {FORMATS.map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      className={`flex-1 py-1.5 rounded border text-xs font-mono transition-colors ${
                        selectedFormat === f
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-text-secondary hover:border-primary/40"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setGenerateOpen(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleGenerate}
                >
                  Generate {selectedFormat}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-5 py-4">
              <div className="text-center space-y-1">
                {genProgress < 100 ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-foreground">Generating report…</p>
                    <p className="text-xs text-text-tertiary">Compiling scores, tone analysis, and evidence</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-positive mx-auto mb-3" />
                    <p className="text-sm text-foreground">Report ready!</p>
                  </>
                )}
              </div>
              <Progress value={genProgress} className="h-1.5" />
              <p className="text-center text-xs text-text-tertiary font-mono">{genProgress}%</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ReportsPage;
