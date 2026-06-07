export const tokensEqual = (a, b) => a && b && a === b;

export const tokensSoftMatch = (target, token) => {
  if (!target || !token) return false;
  if (target === token) return true;
  if (
    token.length >= 3 &&
    (target.startsWith(token) || token.startsWith(target))
  )
    return true;
  if (token.length >= 4 && (target.includes(token) || token.includes(target)))
    return true;
  return false;
};

export const normalizeWord = (input) => {
  if (!input) return "";
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ")
    .replace(/[^a-zA-Zα-ω0-9]+/g, "")
    .trim();
};

export const normalizeTranscript = (transcript) =>
  String(transcript || "").split(/\s+/).map(normalizeWord).filter(Boolean);

export function findSequentialInterimIndex({
  tokens,
  normalizedWords,
  startIndex,
  maxSequence = 5,
}) {
  const candidates = tokens.filter(Boolean).slice(-maxSequence);
  if (!candidates.length || startIndex < 0) return -1;

  const maxLen = Math.min(
    candidates.length,
    normalizedWords.length - startIndex,
    maxSequence
  );

  // Interim transcripts can arrive as short phrases. Only advance multiple
  // words when the phrase aligns exactly with the next unread script words.
  for (let n = maxLen; n >= 1; n--) {
    const seq = candidates.slice(-n);
    let ok = true;
    for (let k = 0; k < n; k++) {
      if (!tokensEqual(normalizedWords[startIndex + k], seq[k])) {
        ok = false;
        break;
      }
    }
    if (ok) return startIndex + n - 1;
  }

  // Soft match only against the immediate next word. This avoids jumping to a
  // later repeated word when Chrome returns only a partial/interim token.
  const latest = candidates[candidates.length - 1];
  if (tokensSoftMatch(normalizedWords[startIndex], latest)) return startIndex;

  return -1;
}
