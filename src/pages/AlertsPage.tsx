import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { AlertTriangle, TrendingDown, Newspaper, Bell, Plus, Check, X, ChevronRight } from "lucide-react";
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
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useRovingFocus } from "@/hooks/useRovingFocus";
import KbdHint from "@/components/KbdHint";

const INITIAL_ALERTS = [
  {
    id: 1, time: "06:14 ET", ticker: "TSLA", rule: "Tone Gap > 40", value: 42, threshold: 40,
    type: "tone", triggered: true, msg: "Tone gap reached 42 (+3 from yesterday)",
  },
  {
    id: 2, time: "05:58 ET", ticker: "GOOGL", rule: "ESS Δ < -3 pts", value: -3, threshold: -3,
    type: "ess", triggered: true, msg: "ESS dropped 3 pts to 72 (was 75 yesterday)",
  },
  {
    id: 3, time: "04:30 ET", ticker: "GOOGL", rule: "New High-Priority Risk", value: 2, threshold: 0,
    type: "risk", triggered: true, msg: "2 new high-priority risks identified: Antitrust ruling timeline, EU DMA compliance",
  },
  {
    id: 4, time: "03:12 ET", ticker: "JPM", rule: "T1 Negative News", value: 1, threshold: 0,
    type: "news", triggered: true, msg: "Reuters: JPMorgan credit card charge-offs rise to 3.6% in Sept",
  },
  {
    id: 5, time: "Yesterday", ticker: "NVDA", rule: "ESS Δ > +5 pts", value: 8, threshold: 5,
    type: "ess", triggered: true, msg: "ESS climbed 8 pts to 91 post-analyst day",
  },
];

const INITIAL_RULES = [
  { id: 1, ticker: "All", rule: "Tone Gap > 40", active: true },
  { id: 2, ticker: "All", rule: "ESS Δ (1d) > ±5 pts", active: true },
  { id: 3, ticker: "All", rule: "New High-Priority Risk", active: true },
  { id: 4, ticker: "All", rule: "T1 Negative News", active: true },
  { id: 5, ticker: "TSLA", rule: "ESS < 55", active: false },
];

const RULE_TYPES = [
  "Tone Gap >",
  "ESS Δ (1d) >",
  "ESS Δ (1d) <",
  "ESS <",
  "ESS >",
  "New High-Priority Risk",
  "New Risk Identified",
  "T1 Negative News",
  "T1 Positive News",
  "Earnings in N days",
];

const TICKERS_OPTIONS = ["All", "AAPL", "MSFT", "NVDA", "GOOGL", "META", "JPM", "TSLA", "GS", "AMZN"];

type Alert = typeof INITIAL_ALERTS[0];
type Rule = typeof INITIAL_RULES[0];

const typeIcon = (type: string) => {
  if (type === "tone") return <AlertTriangle className="h-3.5 w-3.5 text-negative" />;
  if (type === "ess") return <TrendingDown className="h-3.5 w-3.5 text-caution" />;
  if (type === "news") return <Newspaper className="h-3.5 w-3.5 text-info" />;
  return <Bell className="h-3.5 w-3.5 text-text-secondary" />;
};

const AlertsPage = () => {
  const [tab, setTab] = useState<"triggered" | "rules">("triggered");
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [newRuleOpen, setNewRuleOpen] = useState(false);

  // New rule form state
  const [newRuleTicker, setNewRuleTicker] = useState("All");
  const [newRuleType, setNewRuleType] = useState(RULE_TYPES[0]);
  const [newRuleThreshold, setNewRuleThreshold] = useState("30");

  const dismissAlert = (id: number) => {
    const alert = alerts.find(a => a.id === id);
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast(`Alert dismissed`, { description: `${alert?.ticker} · ${alert?.rule}` });
  };

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, active: !r.active };
      toast(next.active ? "Rule enabled" : "Rule paused", {
        description: `${next.ticker} · ${next.rule}`,
      });
      return next;
    }));
  };

  const deleteRule = (id: number) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(r => r.id !== id));
    toast("Rule deleted", { description: `${rule?.ticker} · ${rule?.rule}` });
  };

  const saveNewRule = () => {
    const needsThreshold = !["New High-Priority Risk", "New Risk Identified", "T1 Negative News", "T1 Positive News"].includes(newRuleType);
    const ruleLabel = needsThreshold ? `${newRuleType} ${newRuleThreshold}` : newRuleType;
    const newId = Math.max(...rules.map(r => r.id), 0) + 1;
    setRules(prev => [...prev, { id: newId, ticker: newRuleTicker, rule: ruleLabel, active: true }]);
    toast.success("Alert rule created", { description: `${newRuleTicker} · ${ruleLabel}` });
    setNewRuleOpen(false);
    setNewRuleTicker("All");
    setNewRuleType(RULE_TYPES[0]);
    setNewRuleThreshold("30");
  };

  const needsThreshold = !["New High-Priority Risk", "New Risk Identified", "T1 Negative News", "T1 Positive News"].includes(newRuleType);

  const triggeredCount = alerts.filter(a => a.time.includes("ET")).length;

  // Roving focus for triggered alerts
  const { getRowProps: getAlertProps } = useRovingFocus({
    count: alerts.length,
    active: tab === "triggered" && !newRuleOpen,
    onDismiss: (i) => dismissAlert(alerts[i].id),
  });

  // Page shortcuts
  useEffect(() => {
    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      if (action === "n" && !newRuleOpen) setNewRuleOpen(true);
      if (action === "Tab") setTab(t => t === "triggered" ? "rules" : "triggered");
    };
    document.addEventListener("key-action", handler);
    return () => document.removeEventListener("key-action", handler);
  }, [newRuleOpen]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">Alerts</h1>
          <p className="text-xs text-text-tertiary mt-0.5">{triggeredCount} triggered overnight</p>
        </div>
        <KbdHint k="n">
          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setNewRuleOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> New rule
          </Button>
        </KbdHint>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-4">
        {(["triggered", "rules"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs border-b-2 capitalize transition-colors ${
              tab === t ? "border-primary text-foreground font-medium" : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            {t === "triggered" ? `Triggered (${alerts.length})` : `My Rules (${rules.length})`}
          </button>
        ))}
      </div>

      {tab === "triggered" ? (
        alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-8 w-8 text-text-tertiary mb-3" />
            <p className="text-sm text-text-secondary">No active alerts</p>
            <p className="text-xs text-text-tertiary mt-1">All caught up — alerts will appear here when triggered</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, idx) => {
              const rowProps = getAlertProps(idx);
              return (
              <div key={alert.id} {...rowProps as any} className={`flex items-start gap-3 p-3 bg-card border border-border rounded hover:border-border/80 transition-colors ${rowProps.className}`}>
                <div className="mt-0.5 shrink-0">{typeIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <Link to={`/company/${alert.ticker}`} className="ticker-badge text-primary hover:underline">
                      {alert.ticker}
                    </Link>
                    <span className="text-xs text-text-secondary">{alert.rule}</span>
                    <span className="text-xs text-text-tertiary ml-auto">{alert.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{alert.msg}</p>
                  <Link
                    to={`/company/${alert.ticker}`}
                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
                  >
                    View {alert.ticker} <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="shrink-0 text-text-tertiary hover:text-positive transition-colors mt-0.5"
                  title="Dismiss alert"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 th-label">Ticker</th>
                <th className="text-left px-3 py-2 th-label">Condition</th>
                <th className="text-center px-3 py-2 th-label">Active</th>
                <th className="px-2 py-2 th-label w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors group">
                  <td className="px-3 py-2.5">
                    <span className="ticker-badge text-primary">{rule.ticker}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground">{rule.rule}</td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="inline-flex items-center gap-1.5 group/toggle"
                      title={rule.active ? "Pause rule" : "Enable rule"}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full transition-colors ${rule.active ? "bg-positive" : "bg-border"}`} />
                      <span className={`text-xxs font-medium transition-colors ${rule.active ? "text-positive" : "text-text-tertiary"}`}>
                        {rule.active ? "On" : "Off"}
                      </span>
                    </button>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-text-tertiary hover:text-negative transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete rule"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-xs text-text-tertiary">
                    No rules configured. Click "New rule" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Rule Dialog */}
      <Dialog open={newRuleOpen} onOpenChange={setNewRuleOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create alert rule</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Get notified when a condition is met across your book
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="th-label block">Ticker</label>
              <Select value={newRuleTicker} onValueChange={setNewRuleTicker}>
                <SelectTrigger className="h-8 text-xs bg-surface-elevated border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-xs">
                  {TICKERS_OPTIONS.map(t => (
                    <SelectItem key={t} value={t} className="text-xs cursor-pointer">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="th-label block">Condition</label>
              <Select value={newRuleType} onValueChange={setNewRuleType}>
                <SelectTrigger className="h-8 text-xs bg-surface-elevated border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-xs">
                  {RULE_TYPES.map(r => (
                    <SelectItem key={r} value={r} className="text-xs cursor-pointer">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsThreshold && (
              <div className="space-y-1.5">
                <label className="th-label block">Threshold</label>
                <input
                  type="number"
                  value={newRuleThreshold}
                  onChange={e => setNewRuleThreshold(e.target.value)}
                  className="w-full h-8 px-3 rounded bg-surface-elevated border border-border text-xs text-foreground font-mono outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            )}

            <div className="p-3 rounded bg-surface-2 border border-border text-xs text-text-secondary">
              <span className="text-text-tertiary th-label mr-2">Preview</span>
              Alert when <span className="ticker-badge text-primary">{newRuleTicker}</span>{" "}
              {newRuleType}{needsThreshold ? ` ${newRuleThreshold}` : ""}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setNewRuleOpen(false)} className="h-7 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={saveNewRule}
              >
                Create rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AlertsPage;
