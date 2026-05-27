import { useState } from "react";
import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Star, Download, ChevronDown, ArrowUpRight, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExportModal from "@/components/ExportModal";

const COMPANY_DATA: Record<string, { name: string; sector: string; price: string; chg: string; up: boolean; cci: number; cciDelta: number; toneGap: number; nextEarnings: string; lastAnalyzed: string }> = {
  AAPL: { name: "Apple Inc.", sector: "Technology", price: "232.14", chg: "+0.8%", up: true, cci: 78, cciDelta: 2, toneGap: 27, nextEarnings: "Oct 30, 4:30pm ET", lastAnalyzed: "Oct 13, 2025" },
  MSFT: { name: "Microsoft Corp.", sector: "Technology", price: "418.92", chg: "+1.2%", up: true, cci: 84, cciDelta: 5, toneGap: 14, nextEarnings: "Oct 23, 4:00pm ET", lastAnalyzed: "Oct 13, 2025" },
  GOOGL: { name: "Alphabet Inc.", sector: "Technology", price: "164.52", chg: "-0.4%", up: false, cci: 72, cciDelta: -3, toneGap: 31, nextEarnings: "Oct 29, 4:00pm ET", lastAnalyzed: "Oct 12, 2025" },
  NVDA: { name: "NVIDIA Corp.", sector: "Semiconductors", price: "875.40", chg: "+2.1%", up: true, cci: 91, cciDelta: 8, toneGap: 9, nextEarnings: "Nov 20, 4:00pm ET", lastAnalyzed: "Oct 11, 2025" },
  TSLA: { name: "Tesla Inc.", sector: "Cons. Discretionary", price: "245.18", chg: "+3.2%", up: true, cci: 58, cciDelta: 6, toneGap: 42, nextEarnings: "Oct 23, 4:00pm ET", lastAnalyzed: "Oct 10, 2025" },
  JPM: { name: "JPMorgan Chase", sector: "Financials", price: "211.80", chg: "-0.6%", up: false, cci: 65, cciDelta: -4, toneGap: 22, nextEarnings: "Oct 11, 7:00am ET", lastAnalyzed: "Oct 9, 2025" },
  META: { name: "Meta Platforms", sector: "Technology", price: "536.30", chg: "+0.3%", up: true, cci: 79, cciDelta: 1, toneGap: 18, nextEarnings: "Oct 30, 4:00pm ET", lastAnalyzed: "Oct 13, 2025" },
  GS: { name: "Goldman Sachs", sector: "Financials", price: "488.44", chg: "+0.9%", up: true, cci: 73, cciDelta: 2, toneGap: 16, nextEarnings: "Oct 15, 7:00am ET", lastAnalyzed: "Oct 8, 2025" },
};

const getCCIColor = (v: number) => v >= 75 ? "text-positive" : v >= 55 ? "text-caution" : "text-negative";

const CompanyAnalysis = () => {
  const { ticker } = useParams();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | "excel" | "csv">("pdf");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedQuarter, setSelectedQuarter] = useState("Q3");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 }, (_, i) => (2021 + i).toString());
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  const company = COMPANY_DATA[ticker as string] || {
    name: ticker || "Unknown", sector: "—", price: "—", chg: "—", up: true,
    cci: 0, cciDelta: 0, toneGap: 0, nextEarnings: "—", lastAnalyzed: "—",
  };

  const tabs = [
    { label: "Overview", path: `/company/${ticker}`, shortcut: "1" },
    { label: "Scores", path: `/company/${ticker}/scores`, shortcut: "2" },
    { label: "Mgmt Tone", path: `/company/${ticker}/tone`, shortcut: "3" },
    { label: "Products", path: `/company/${ticker}/products`, shortcut: "4" },
    { label: "Risks", path: `/company/${ticker}/risks`, shortcut: "5" },
    { label: "Transcript", path: `/company/${ticker}/transcripts`, shortcut: "6" },
    { label: "Calibration", path: `/company/${ticker}/playground`, shortcut: "7" },
  ];

  const isActiveTab = (path: string) =>
    path === `/company/${ticker}` ? location.pathname === path : location.pathname.startsWith(path);

  const highToneGap = company.toneGap >= 30;

  return (
    <Layout noPadding>
      {/* Persistent ticker header */}
      <div className={`border-b px-4 py-2 flex items-center gap-4 flex-wrap shrink-0 ${highToneGap ? "bg-negative/5 border-negative/20" : "bg-card border-border"}`}>
        {/* Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="ticker-badge text-primary text-sm">{ticker}</span>
          <span className="text-sm font-medium text-foreground truncate">{company.name}</span>
          <span className="text-xs text-text-tertiary hidden sm:inline">{company.sector}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 border-l border-border pl-4">
          <span className="font-mono text-sm text-foreground">${company.price}</span>
          <span className={`font-mono text-xs flex items-center gap-0.5 ${company.up ? "text-positive" : "text-negative"}`}>
            <ArrowUpRight className="h-3 w-3" />{company.chg}
          </span>
        </div>

        {/* CCI */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <span className="th-label">CCI</span>
          <span className={`score-num text-lg ${getCCIColor(company.cci)}`}>{company.cci}</span>
          <span className={`font-mono text-xs ${company.cciDelta >= 0 ? "delta-pos" : "delta-neg"}`}>
            {company.cciDelta >= 0 ? "+" : ""}{company.cciDelta}
          </span>
        </div>

        {/* Tone Gap */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <span className="th-label">Tone Gap</span>
          <span className={`font-mono text-sm font-semibold ${highToneGap ? "text-negative" : "text-text-secondary"}`}>
            {highToneGap && <AlertTriangle className="h-3 w-3 inline mr-1 text-negative" />}
            {company.toneGap}
          </span>
        </div>

        {/* Next earnings */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <span className="th-label">Next Earnings</span>
          <span className="font-mono text-xs text-text-secondary">{company.nextEarnings}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-20 h-7 text-xs bg-surface-elevated border-border/50 hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-xs">
                {years.map(y => <SelectItem key={y} value={y} className="hover:bg-surface-elevated cursor-pointer text-xs">{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-16 h-7 text-xs bg-surface-elevated border-border/50 hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-xs">
                {quarters.map(q => <SelectItem key={q} value={q} className="hover:bg-surface-elevated cursor-pointer text-xs">{q}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2 hover:bg-surface-elevated gap-1">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border text-xs">
              <DropdownMenuItem className="hover:bg-surface-elevated cursor-pointer" onClick={() => { setExportType("pdf"); setExportModalOpen(true); }}>PDF Report</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-surface-elevated cursor-pointer" onClick={() => { setExportType("excel"); setExportModalOpen(true); }}>Excel Workbook</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-surface-elevated cursor-pointer" onClick={() => { setExportType("csv"); setExportModalOpen(true); }}>CSV Data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-7 text-xs px-2 hover:bg-surface-elevated gap-1"
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-caution text-caution" : ""}`} />
            <span className="hidden sm:inline">{isFavorite ? "Watching" : "Watch"}</span>
          </Button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-border bg-card flex items-center px-4 overflow-x-auto shrink-0">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 whitespace-nowrap transition-colors shrink-0 ${
              isActiveTab(tab.path)
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
            <kbd className="hidden xl:inline px-1 rounded bg-surface-elevated border border-border text-text-tertiary font-mono" style={{fontSize:"9px"}}>
              {tab.shortcut}
            </kbd>
          </Link>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        exportType={exportType}
        companyName={company.name}
        ticker={ticker || ""}
      />
    </Layout>
  );
};

export default CompanyAnalysis;
