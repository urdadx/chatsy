/**
 * Utility functions for matching user intent to available actions
 */

export interface ActionItem {
  id: string;
  name: string | null;
  description: string | null;
  actionProperties: unknown;
  showInQuickMenu: boolean | null;
}

export interface MatchingOptions {
  userIntent: string;
  preferredType?: string;
  actions: ActionItem[];
}

/**
 * Find the best matching action based on user intent and optional preferred type
 */
export function findBestActionMatch({
  userIntent,
  preferredType,
  actions,
}: MatchingOptions): ActionItem | null {
  const normalizedIntent = normalizeText(userIntent);
  const normalizedPreferredType = preferredType
    ? normalizeText(preferredType)
    : "";
  const intentWords = tokenize(normalizedIntent);
  const preferredTypeWords = tokenize(normalizedPreferredType);
  const allIntentWords = new Set([...intentWords, ...preferredTypeWords]);

  let bestMatch = null;
  let bestScore = 0;

  for (const action of actions) {
    const description = normalizeText(action.description || "");
    const name = normalizeText(action.name || "");

    // Skip actions without description or name
    if (!description && !name) continue;

    let score = 0;

    // 1. Exact phrase match in description (highest priority)
    if (description && normalizedIntent.includes(description)) {
      score = 1000 + description.length;
    } else if (description?.includes(normalizedIntent)) {
      score = 900 + normalizedIntent.length;
    }
    // 2. Exact phrase match in name
    else if (name && normalizedIntent.includes(name)) {
      score = 800 + name.length;
    } else if (name?.includes(normalizedIntent)) {
      score = 700 + name.length;
    }
    // 3. Preferred type specific matching (for calendly use case)
    else if (preferredType) {
      if (
        description?.includes(normalizedPreferredType) ||
        name?.includes(normalizedPreferredType)
      ) {
        score = 600 + normalizedPreferredType.length;
      }
    }
    // 4. Word overlap scoring
    else {
      const descWords = tokenize(description);
      const nameWords = tokenize(name);
      const allActionWords = new Set([...descWords, ...nameWords]);

      // Count matching words
      let matchCount = 0;
      let totalMatchLength = 0;

      for (const word of allActionWords) {
        if (word.length <= 3) continue; // Skip short words

        for (const intentWord of allIntentWords) {
          if (intentWord.length <= 3) continue;

          // Exact word match
          if (word === intentWord) {
            matchCount += 2;
            totalMatchLength += word.length;
          }
          // Partial word match (one contains the other)
          else if (word.includes(intentWord) || intentWord.includes(word)) {
            matchCount += 1;
            totalMatchLength += Math.min(word.length, intentWord.length);
          }
        }
      }

      if (matchCount > 0) {
        // Score based on match count and length
        score = matchCount * 10 + totalMatchLength;

        // Bonus for matching more unique words
        const uniqueMatchRatio =
          matchCount / Math.max(allActionWords.size, allIntentWords.size);
        score += uniqueMatchRatio * 50;
      }
    }

    // Update best match if this score is higher
    if (score > bestScore) {
      bestScore = score;
      bestMatch = action;
    }
  }

  // Only return match if score meets minimum threshold
  return bestScore > 0 ? bestMatch : null;
}

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Tokenize text into words, filtering out stop words
 */
export function tokenize(text: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "will",
    "with",
    "i",
    "want",
    "need",
    "would",
    "like",
    "can",
    "could",
    "should",
    "book",
    "schedule",
    "meeting",
    "appointment",
  ]);

  return text
    .split(/\s+/)
    .filter((word) => word.length > 0 && !stopWords.has(word));
}
