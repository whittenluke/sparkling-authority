/**
 * Delimiter used to split/join the three sections of review_full (Taste, Carbonation, Value).
 * Unlikely to appear in normal prose.
 */
export const REVIEW_FULL_DELIMITER = '\n\n=====\n\n'

/**
 * Parse review_full into three sections: Taste & Flavor, Carbonation & Mouthfeel, Value & Context.
 * Legacy content (no delimiter) is returned entirely in the first section.
 */
export function parseReviewFullSections(reviewFull: string | null): [string, string, string] {
  if (reviewFull == null || reviewFull.trim() === '') {
    return ['', '', '']
  }
  const parts = reviewFull.split(REVIEW_FULL_DELIMITER).map((s) => s.trim())
  const taste = parts[0] ?? ''
  const carbonation = parts[1] ?? ''
  const value = parts[2] ?? ''
  return [taste, carbonation, value]
}

/**
 * Join the three section strings into one review_full value.
 * Returns empty string if all three are empty (caller can store null).
 */
export function joinReviewFullSections(
  taste: string,
  carbonation: string,
  value: string
): string {
  const t = taste.trim()
  const c = carbonation.trim()
  const v = value.trim()
  if (!t && !c && !v) return ''
  return [t, c, v].join(REVIEW_FULL_DELIMITER)
}
