import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, AlertTriangle, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  marketCap: number;
  sentiment: number;
  toneShift: number;
  toneGap: number;
  topRisk: string | null;
  riskPriority: number;
  lastAnalyzed: string;
  isFavorite: boolean;
}

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Apple Inc.",
    ticker: "AAPL",
    sector: "Technology",
    marketCap: 2800,
    sentiment: 82,
    toneShift: 5.2,
    toneGap: 18,
    topRisk: null,
    riskPriority: 4,
    lastAnalyzed: "2025-10-13",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Microsoft Corp.",
    ticker: "MSFT",
    sector: "Technology",
    marketCap: 2500,
    sentiment: 78,
    toneShift: 3.1,
    toneGap: 22,
    topRisk: null,
    riskPriority: 3,
    lastAnalyzed: "2025-10-13",
    isFavorite: false,
  },
  {
    id: "3",
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    sector: "Technology",
    marketCap: 1700,
    sentiment: 68,
    toneShift: -2.4,
    toneGap: 35,
    topRisk: "Regulatory",
    riskPriority: 8,
    lastAnalyzed: "2025-10-12",
    isFavorite: false,
  },
  {
    id: "4",
    name: "Tesla Inc.",
    ticker: "TSLA",
    sector: "Consumer",
    marketCap: 800,
    sentiment: 45,
    toneShift: -8.7,
    toneGap: 42,
    topRisk: "Supply Chain",
    riskPriority: 9,
    lastAnalyzed: "2025-10-13",
    isFavorite: true,
  },
  {
    id: "5",
    name: "Johnson & Johnson",
    ticker: "JNJ",
    sector: "Healthcare",
    marketCap: 450,
    sentiment: 71,
    toneShift: 1.8,
    toneGap: 15,
    topRisk: null,
    riskPriority: 5,
    lastAnalyzed: "2025-10-11",
    isFavorite: false,
  },
];

const CompaniesTable = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(mockCompanies);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleFavorite = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === companies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companies.map((c) => c.id));
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 75) return "text-positive";
    if (score < 50) return "text-negative";
    return "text-caution";
  };

  const getSentimentBg = (score: number) => {
    if (score > 75) return "bg-positive/10";
    if (score < 50) return "bg-negative/10";
    return "bg-caution/10";
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}T`;
    return `$${value}B`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface border-b border-border hover:bg-surface">
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === companies.length}
                  onCheckedChange={toggleSelectAll}
                  className="h-3.5 w-3.5"
                />
              </TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-xs font-medium text-text-secondary">
                Company Name
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary">
                Ticker
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary">
                Sector
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary text-right">
                Market Cap
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary text-right">
                Sentiment
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary text-right">
                Tone Shift
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary text-right">
                Tone Gap
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary">
                Top Risk
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary">
                Last Analyzed
              </TableHead>
              <TableHead className="text-xs font-medium text-text-secondary">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow
                key={company.id}
                className="border-b border-border hover:bg-surface-elevated transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(company.id)}
                    onCheckedChange={() => toggleSelect(company.id)}
                    className="h-3.5 w-3.5"
                  />
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleFavorite(company.id)}
                    className="text-text-tertiary hover:text-caution transition-colors"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        company.isFavorite ? "fill-caution text-caution" : ""
                      }`}
                    />
                  </button>
                </TableCell>
                <TableCell className="font-medium text-sm text-foreground">
                  {company.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-xs bg-info/10 text-info border-info/30"
                  >
                    {company.ticker}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-text-secondary">
                  {company.sector}
                </TableCell>
                <TableCell className="text-xs text-foreground text-right font-medium">
                  {formatMarketCap(company.marketCap)}
                </TableCell>
                <TableCell>
                  <div
                    className={`text-right ${getSentimentBg(
                      company.sentiment
                    )} rounded px-2 py-1`}
                  >
                    <span
                      className={`text-base font-semibold ${getSentimentColor(
                        company.sentiment
                      )}`}
                    >
                      {company.sentiment}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {company.toneShift > 0 ? (
                      <TrendingUp className="h-3 w-3 text-positive" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-negative" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        company.toneShift > 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {Math.abs(company.toneShift).toFixed(1)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {company.toneGap > 30 && (
                      <AlertTriangle className="h-3 w-3 text-caution" />
                    )}
                    <span className="text-xs text-foreground">{company.toneGap}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {company.topRisk && company.riskPriority > 7 ? (
                    <Badge
                      variant="outline"
                      className="text-xs bg-negative/10 text-negative border-negative/30"
                    >
                      {company.topRisk}
                    </Badge>
                  ) : (
                    <span className="text-xs text-text-tertiary">-</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-text-tertiary">
                  {company.lastAnalyzed}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/company/${company.ticker}`)}
                    className="h-7 text-xs hover:bg-surface-elevated"
                  >
                    View Analysis
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-text-secondary">
          Showing 1-{companies.length} of {companies.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled
            className="h-7 text-xs hover:bg-surface-elevated"
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled
            className="h-7 text-xs hover:bg-surface-elevated"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompaniesTable;
