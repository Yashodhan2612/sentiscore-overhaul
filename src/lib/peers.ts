/**
 * peers.ts — default peer suggestions by sector and outlier math for ComparisonPage
 */

/** All comparable companies with their ESS layer scores + metadata */
export const UNIVERSE = [
  { ticker: "AAPL",  name: "Apple Inc.",          sector: "Technology",     mktCap: "3.52T", ess: 78, oss: 78, nss: 71, sss: 68, essDelta: +2, toneGap: 27, newRisks: 0, nextEarnings: "Oct 30" },
  { ticker: "MSFT",  name: "Microsoft Corp.",      sector: "Technology",     mktCap: "3.11T", ess: 84, oss: 80, nss: 88, sss: 90, essDelta: +5, toneGap: 14, newRisks: 0, nextEarnings: "Oct 23" },
  { ticker: "NVDA",  name: "NVIDIA Corp.",         sector: "Semiconductors", mktCap: "2.15T", ess: 91, oss: 92, nss: 89, sss: 91, essDelta: +8, toneGap: 9,  newRisks: 1, nextEarnings: "Nov 20" },
  { ticker: "GOOGL", name: "Alphabet Inc.",        sector: "Technology",     mktCap: "2.04T", ess: 72, oss: 70, nss: 68, sss: 71, essDelta: -3, toneGap: 31, newRisks: 2, nextEarnings: "Oct 29" },
  { ticker: "AMZN",  name: "Amazon.com Inc.",      sector: "Consumer",       mktCap: "1.90T", ess: 75, oss: 76, nss: 72, sss: 74, essDelta: +1, toneGap: 19, newRisks: 0, nextEarnings: "Oct 30" },
  { ticker: "META",  name: "Meta Platforms",       sector: "Technology",     mktCap: "1.37T", ess: 79, oss: 78, nss: 80, sss: 82, essDelta: +1, toneGap: 18, newRisks: 0, nextEarnings: "Oct 30" },
  { ticker: "TSLA",  name: "Tesla Inc.",           sector: "Consumer",       mktCap: "0.79T", ess: 58, oss: 55, nss: 60, sss: 62, essDelta: +6, toneGap: 42, newRisks: 3, nextEarnings: "Oct 23" },
  { ticker: "JPM",   name: "JPMorgan Chase",       sector: "Financials",     mktCap: "0.62T", ess: 65, oss: 64, nss: 66, sss: 65, essDelta: -4, toneGap: 22, newRisks: 1, nextEarnings: "Oct 11" },
  { ticker: "GS",    name: "Goldman Sachs",        sector: "Financials",     mktCap: "0.17T", ess: 73, oss: 72, nss: 74, sss: 70, essDelta: +2, toneGap: 16, newRisks: 0, nextEarnings: "Oct 15" },
  { ticker: "NFLX",  name: "Netflix Inc.",         sector: "Technology",     mktCap: "0.31T", ess: 80, oss: 81, nss: 78, sss: 79, essDelta: +3, toneGap: 12, newRisks: 0, nextEarnings: "Oct 17" },
  { ticker: "V",     name: "Visa Inc.",            sector: "Financials",     mktCap: "0.55T", ess: 77, oss: 76, nss: 78, sss: 75, essDelta: +1, toneGap: 11, newRisks: 0, nextEarnings: "Oct 22" },
  { ticker: "UNH",   name: "UnitedHealth Group",   sector: "Healthcare",     mktCap: "0.43T", ess: 69, oss: 68, nss: 70, sss: 67, essDelta: -2, toneGap: 20, newRisks: 1, nextEarnings: "Oct 15" },
  { ticker: "AMD",   name: "Advanced Micro Devices",sector: "Semiconductors",mktCap: "0.25T", ess: 76, oss: 75, nss: 77, sss: 74, essDelta: +4, toneGap: 15, newRisks: 0, nextEarnings: "Oct 29" },
  { ticker: "AVGO",  name: "Broadcom Inc.",        sector: "Semiconductors", mktCap: "0.75T", ess: 82, oss: 83, nss: 80, sss: 78, essDelta: +3, toneGap: 11, newRisks: 0, nextEarnings: "Dec 12" },
  { ticker: "QCOM",  name: "Qualcomm Inc.",        sector: "Semiconductors", mktCap: "0.18T", ess: 71, oss: 70, nss: 72, sss: 68, essDelta: -1, toneGap: 18, newRisks: 1, nextEarnings: "Nov 6" },
  { ticker: "BAC",   name: "Bank of America",      sector: "Financials",     mktCap: "0.30T", ess: 61, oss: 60, nss: 63, sss: 59, essDelta: -2, toneGap: 25, newRisks: 1, nextEarnings: "Oct 15" },
];

export type UniverseItem = typeof UNIVERSE[0];

/** Default peer suggestions: up to 3 same-sector peers, excluding the anchor */
export const getDefaultPeers = (anchor: string, count = 3): string[] => {
  const anchorItem = UNIVERSE.find(c => c.ticker === anchor);
  if (!anchorItem) return [];
  return UNIVERSE
    .filter(c => c.ticker !== anchor && c.sector === anchorItem.sector)
    .slice(0, count)
    .map(c => c.ticker);
};

/** Compute mean of an array */
const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length;

/** Compute standard deviation */
const stddev = (values: number[]): number => {
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / values.length);
};

/** Returns whether a value is an outlier (>1σ from mean of the group) */
export const isOutlier = (value: number, allValues: number[]): boolean => {
  if (allValues.length < 2) return false;
  const m = mean(allValues);
  const s = stddev(allValues);
  return Math.abs(value - m) > s;
};

/** Index a value to anchor = 100 */
export const indexToAnchor = (value: number, anchorValue: number): number => {
  if (anchorValue === 0) return 0;
  return Math.round((value / anchorValue) * 100);
};
