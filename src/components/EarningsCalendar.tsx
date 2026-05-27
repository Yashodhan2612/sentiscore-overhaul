import { useMemo, useState } from "react";
import { addDays, startOfWeek, format, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EarningsItem {
  date: string; // yyyy-MM-dd
  ticker: string;
  name: string;
  time: "BMO" | "AMC" | "TBD";
  sentiment?: number; // -1 to 1
}

function formatKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const mockEarningsSeed = (weekStart: Date): EarningsItem[] => {
  // Simple mock generator for the current week
  const d = (i: number) => formatKey(addDays(weekStart, i));
  return [
    { date: d(0), ticker: "AAPL", name: "Apple Inc.", time: "AMC", sentiment: 0.6 },
    { date: d(0), ticker: "SNOW", name: "Snowflake", time: "BMO", sentiment: -0.1 },
    { date: d(1), ticker: "MSFT", name: "Microsoft", time: "BMO", sentiment: 0.4 },
    { date: d(2), ticker: "TSLA", name: "Tesla", time: "AMC", sentiment: -0.3 },
    { date: d(3), ticker: "NVDA", name: "NVIDIA", time: "AMC", sentiment: 0.8 },
    { date: d(4), ticker: "ABNB", name: "Airbnb", time: "BMO", sentiment: 0.2 },
    { date: d(5), ticker: "SHOP", name: "Shopify", time: "TBD", sentiment: 0.1 },
    { date: d(6), ticker: "META", name: "Meta", time: "AMC", sentiment: 0.5 },
  ];
};

function sentimentBadgeClass(score?: number) {
  if (score === undefined) return "bg-muted text-muted-foreground";
  if (score > 0.25) return "bg-success/15 text-success";
  if (score < -0.25) return "bg-destructive/15 text-destructive";
  return "bg-warning/15 text-warning";
}

const DayColumn = ({
  date,
  items,
  isCurrent,
}: {
  date: Date;
  items: EarningsItem[];
  isCurrent: boolean;
}) => {
  return (
    <Card
      className={cn(
        "min-w-[220px] rounded-lg border border-border bg-surface",
        "flex flex-col overflow-hidden"
      )}
    >
      <div
        className={cn(
          "px-3 py-2 border-b border-border flex items-center justify-between",
          isCurrent && "bg-primary/10"
        )}
      >
        <div>
          <div className={cn("text-xs text-muted-foreground")}>{format(date, "EEE")}</div>
          <div className={cn("text-sm font-medium text-foreground")}>{format(date, "MMM d")}</div>
        </div>
        {isCurrent && (
          <Badge variant="secondary" className="text-[10px]">Today</Badge>
        )}
      </div>
      <div className="p-2 space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground px-1 py-6 text-center border border-dashed border-border rounded">
            No earnings
          </div>
        ) : (
          items.map((item, idx) => (
            <Card key={idx} className="p-2 bg-surface-elevated border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      {item.ticker}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground truncate">
                    {item.name}
                  </div>
                </div>
                <div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded", sentimentBadgeClass(item.sentiment))}>
                    {item.sentiment !== undefined ? `${Math.round((item.sentiment + 1) * 50)}%` : "—"}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};

function EarningsCalendarInner() {
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const data = useMemo(() => mockEarningsSeed(weekStart), [weekStart]);

  return (
    <section aria-label="Earnings calendar" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Earnings Calendar</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-surface-elevated hover:bg-surface border border-border"
            onClick={() => setAnchorDate(addDays(anchorDate, -7))}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3 bg-surface-elevated hover:bg-surface border border-border"
            onClick={() => setAnchorDate(new Date())}
          >
            <CalendarIcon className="h-4 w-4 mr-1" /> Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-surface-elevated hover:bg-surface border border-border"
            onClick={() => setAnchorDate(addDays(anchorDate, 7))}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {days.map((day) => (
            <DayColumn
              key={formatKey(day)}
              date={day}
              items={data.filter((it) => it.date === formatKey(day))}
              isCurrent={isToday(day)}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

export default function EarningsCalendar(props: { className?: string }) {
  return (
    <div className={cn("w-full", props.className)}>
      <EarningsCalendarInner />
    </div>
  );
}
