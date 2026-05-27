import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell, ChevronDown, Search, BarChart2, BookMarked,
  AlarmClock, FileText, LayoutGrid, Calendar, User, LogOut, Settings,
  Sun, Moon, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommandPalette from "./CommandPalette";
import { useTheme } from "@/contexts/ThemeContext";

const TICKERS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "GS", name: "Goldman Sachs" },
  { ticker: "BAC", name: "Bank of America" },
];

const NAV_ITEMS = [
  { label: "Morning Brief", href: "/brief", icon: BarChart2 },
  { label: "Book", href: "/book", icon: BookMarked },
  { label: "Screener", href: "/companies", icon: LayoutGrid },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Alerts", href: "/alerts", icon: AlarmClock },
  { label: "Reports", href: "/reports", icon: FileText },
];

const TopNavigation = () => {
  const [tickerSearch, setTickerSearch] = useState("");
  const [tickerOpen, setTickerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const filteredTickers = tickerSearch.length > 0
    ? TICKERS.filter(t =>
        t.ticker.toLowerCase().includes(tickerSearch.toLowerCase()) ||
        t.name.toLowerCase().includes(tickerSearch.toLowerCase())
      )
    : TICKERS.slice(0, 6);

  const handleTickerSelect = (ticker: string) => {
    setTickerOpen(false);
    setTickerSearch("");
    navigate(`/company/${ticker}`);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tickerRef.current && !tickerRef.current.contains(e.target as Node))
        setTickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "/" && !(e.target as HTMLElement).matches("input,textarea")) {
        e.preventDefault();
        setTickerOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <>
      <nav className="h-11 bg-card border-b border-border flex items-center sticky top-0 z-50 shrink-0">
        {/* Logo */}
        <Link
          to="/brief"
          className="flex items-center gap-2 px-4 h-full border-r border-border hover:bg-surface-elevated transition-colors shrink-0"
        >
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-tight">SentiScore</span>
        </Link>

        {/* Ticker Switcher */}
        <div ref={tickerRef} className="relative px-3 border-r border-border h-full flex items-center shrink-0">
          <button
            onClick={() => setTickerOpen(!tickerOpen)}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-foreground transition-colors"
          >
            <span className="font-mono text-primary font-bold">/</span>
            <span className="hidden sm:inline text-text-tertiary">Jump to ticker</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-text-tertiary font-mono" style={{fontSize:"10px"}}>
              /
            </kbd>
          </button>
          {tickerOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded shadow-2xl z-50">
              <div className="p-2 border-b border-border">
                <input
                  autoFocus
                  type="text"
                  value={tickerSearch}
                  onChange={e => setTickerSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && filteredTickers.length > 0)
                      handleTickerSelect(filteredTickers[0].ticker);
                    if (e.key === "Escape") setTickerOpen(false);
                  }}
                  placeholder="AAPL, MSFT, GOOGL..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-text-tertiary outline-none font-mono"
                />
              </div>
              <div className="py-1 max-h-52 overflow-y-auto">
                {filteredTickers.map(t => (
                  <button
                    key={t.ticker}
                    onClick={() => handleTickerSelect(t.ticker)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-elevated transition-colors"
                  >
                    <span className="ticker-badge text-primary">{t.ticker}</span>
                    <span className="text-xs text-text-secondary truncate ml-3">{t.name}</span>
                  </button>
                ))}
                {filteredTickers.length === 0 && (
                  <div className="px-3 py-3 text-xs text-text-tertiary text-center">No matches</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary nav */}
        <div className="flex items-center h-full overflow-x-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 whitespace-nowrap shrink-0 ${
                isActive(item.href)
                  ? "border-primary text-foreground"
                  : "border-transparent text-text-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-0.5 pr-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="h-7 px-2 gap-1.5 text-text-tertiary hover:text-foreground text-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="hidden sm:inline-flex items-center px-1.5 rounded bg-surface-elevated border border-border text-text-tertiary font-mono" style={{fontSize:"10px"}}>
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-7 w-7 relative text-text-secondary hover:text-foreground"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="h-7 w-7 relative text-text-secondary hover:text-foreground">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-negative rounded-full border border-background" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 px-1.5 gap-1 hover:bg-surface-elevated">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-primary text-primary-foreground font-mono font-bold" style={{fontSize:"9px"}}>
                    YB
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-text-tertiary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-popover border-border text-xs">
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-elevated gap-2 text-xs">
                <Link to="/profile"><User className="h-3.5 w-3.5" /> Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-surface-elevated gap-2 text-xs">
                <Settings className="h-3.5 w-3.5" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer hover:bg-surface-elevated gap-2 text-xs text-negative">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
};

export default TopNavigation;
