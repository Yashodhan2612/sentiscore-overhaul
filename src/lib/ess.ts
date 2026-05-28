/**
 * ESS — Extended SentiScore
 *
 * A weighted composite of three signal layers:
 *   L1  OSS  Overall Sentiment Score  (earnings-call transcript derived)  50%
 *   L2  NSS  News Sentiment Score     (tier-1/2 news aggregation)          30%
 *   L3  SSS  Social Sentiment Score   (social signal aggregation)          20%
 *
 * Weights are fixed for the current product iteration.
 * The formula is surfaced to users via the ⓘ tooltip on the ESS chip.
 */

export const ESS_WEIGHTS = {
  L1_OSS: 0.5,
  L2_NSS: 0.3,
  L3_SSS: 0.2,
} as const;

/** Weighted ESS from the three layer scores (rounds to nearest integer). */
export const computeESS = (oss: number, nss: number, sss: number): number =>
  Math.round(
    oss * ESS_WEIGHTS.L1_OSS +
    nss * ESS_WEIGHTS.L2_NSS +
    sss * ESS_WEIGHTS.L3_SSS,
  );

/** Tailwind text-colour class based on ESS value (higher = better). */
export const getESSColor = (v: number): string => {
  if (v >= 75) return "text-positive";
  if (v >= 55) return "text-caution";
  return "text-negative";
};

/** Tailwind bg + border class for card backgrounds (Book grid view). */
export const getESSBg = (v: number): string => {
  if (v >= 75) return "bg-positive/10 border-positive/20";
  if (v >= 55) return "bg-caution/10 border-caution/20";
  return "bg-negative/10 border-negative/20";
};

/** Human-readable formula string for the ⓘ tooltip. */
export const ESS_FORMULA_LABEL =
  "ESS = 50% OSS (L1) + 30% NSS (L2) + 20% SSS (L3)";
