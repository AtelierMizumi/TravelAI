import type { RecognitionResult } from "./recognition";

/**
 * The catalog landmark the server proposes when Google's evidence names one but the result is only a
 * prediction. The app pre-fills the place picker with it so the user confirms in one tap.
 */
export function suggestedPlaceQuery(
  result: Pick<RecognitionResult, "recognitionStatus" | "catalogCandidates">,
): string {
  if (result.recognitionStatus === "identified") return "";
  return result.catalogCandidates?.[0]?.name?.trim() ?? "";
}
