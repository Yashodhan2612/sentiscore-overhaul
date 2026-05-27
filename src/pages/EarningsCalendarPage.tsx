import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { TrendingUp, Clock } from "lucide-react";

const EVENTS = [
  { date: "Oct 29", ticker: "META", name: "Meta Platforms", time: "4:00pm ET", type: "After close", inBook: true },
  { date: "Oct 29", ticker: "GOOGL", name: "Alphabet Inc.", time: "4:00pm ET", type: "After close", inBook: true },
  { date: "Oct 30", ticker: "AAPL", name: "Apple Inc.", time: "4:30pm ET", type: "After close", inBook: true },
  { date: "Oct 30", ticker: "AMZN", name: "Amazon.com", time: "4:00pm ET", type: "After close", inBook: false },
  { date: "Oct 31", ticker: "INTC", name: "Intel Corp.", time: "4:00pm ET", type: "After close", inBook: false },
  { date: "Nov 1", ticker: "EXXON", name: "ExxonMobil", time: "7:30am ET", type: "Before open", inBook: false },
  { date: "Nov 6", ticker: "TSLA", name: "Tesla Inc.", time: "5:00pm ET", type: "After close", inBook: true },
  { date: "Nov 20", ticker: "NVDA", name: "NVIDIA Corp.", time: "4:00pm ET", type: "After close", inBook: true },
];

const byDate: Record<string, typeof EVENTS> = {};
EVENTS.forEach(e => {
  if (!byDate[e.date]) byDate[e.date] = [];
  byDate[e.date].push(e);
});

const EarningsCalendarPage = () => (
  <Layout>
    <div className="mb-4">
      <h1 className="text-lg font-semibold">Earnings Calendar</h1>
      <p className="text-xs text-text-tertiary mt-0.5">Upcoming earnings calls · Book names highlighted</p>
    </div>

    <div className="space-y-4">
      {Object.entries(byDate).map(([date, events]) => (
        <div key={date}>
          <div className="th-label mb-2">{date}</div>
          <div className="space-y-1.5">
            {events.map(e => (
              <div
                key={e.ticker}
                className={`flex items-center gap-3 p-3 rounded border ${
                  e.inBook
                    ? "bg-card border-border"
                    : "bg-surface-2 border-border/50"
                }`}
              >
                {e.inBook && <div className="w-1 h-6 rounded-full bg-primary shrink-0" />}
                {!e.inBook && <div className="w-1 h-6 rounded-full bg-transparent shrink-0" />}
                <Link to={`/company/${e.ticker}`} className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="ticker-badge text-primary w-14">{e.ticker}</span>
                  <span className="text-xs text-text-secondary truncate">{e.name}</span>
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary shrink-0">
                  <Clock className="h-3 w-3" />{e.time}
                </div>
                <span className={`text-xs shrink-0 ${e.type === "Before open" ? "text-caution" : "text-info"}`}>
                  {e.type}
                </span>
                {e.inBook && (
                  <Link to={`/company/${e.ticker}`} className="shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Layout>
);

export default EarningsCalendarPage;
