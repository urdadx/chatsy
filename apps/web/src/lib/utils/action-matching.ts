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

  // Extract key intent words from user input (high-value keywords)
  const intentKeywords = extractKeyIntentWords(normalizedIntent);

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
    // 3. Preferred type specific matching
    else if (preferredType) {
      if (
        description?.includes(normalizedPreferredType) ||
        name?.includes(normalizedPreferredType)
      ) {
        score = 600 + normalizedPreferredType.length;
      }
    }

    // 4. Key intent word matching (NEW - high priority for semantic matching)
    if (score === 0 && intentKeywords.length > 0) {
      const actionKeywords = extractKeyIntentWords(`${description} ${name}`);
      let keywordMatchCount = 0;

      for (const intentKeyword of intentKeywords) {
        for (const actionKeyword of actionKeywords) {
          if (areWordsSimilar(intentKeyword, actionKeyword)) {
            keywordMatchCount++;
            score += 100;
          }
        }
      }

      // Bonus if multiple keywords match
      if (keywordMatchCount > 1) {
        score += keywordMatchCount * 50;
      }
    }

    // 5. Word overlap scoring (fallback method)
    if (score === 0) {
      const descWords = tokenize(description);
      const nameWords = tokenize(name);
      const allActionWords = new Set([...descWords, ...nameWords]);

      // Count matching words
      let matchCount = 0;
      let totalMatchLength = 0;

      for (const word of allActionWords) {
        if (word.length <= 2) continue;

        for (const intentWord of allIntentWords) {
          if (intentWord.length <= 2) continue;

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

  // Return match even with low score if it's the only action available
  if (actions.length === 1 && bestScore > 0) {
    return bestMatch;
  }

  return bestScore >= 50 ? bestMatch : null;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
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
    "this",
    "when",
    "user",
    "wants",
    "me",
    "you",
    "your",
  ]);

  return text
    .split(/\s+/)
    .filter((word) => word.length > 0 && !stopWords.has(word));
}

/**
 * Extract key intent words that indicate user action intent
 * These are high-value keywords that shouldn't be filtered out
 */
export function extractKeyIntentWords(text: string): string[] {
  const keyIntentPatterns = [
    "book",
    "booking",
    "schedule",
    "scheduling",
    "appointment",
    "meeting",
    "consultation",
    "demo",
    "call",
    "session",
    "chat",
    "talk",
    "discuss",
    "reserve",
    "arrange",
    "setup",
    "set up",
    "contact",
    "reach",
    "connect",
  ];

  const words: string[] = [];
  const normalizedText = text.toLowerCase();

  for (const pattern of keyIntentPatterns) {
    if (normalizedText.includes(pattern)) {
      words.push(pattern);
    }
  }

  return words;
}

/**
 * Check if two words are semantically similar
 * Handles variations like singular/plural, different forms, etc.
 */
export function areWordsSimilar(word1: string, word2: string): boolean {
  // Exact match
  if (word1 === word2) return true;

  // One contains the other (handles variations like book/booking)
  if (word1.includes(word2) || word2.includes(word1)) return true;

  // Semantic equivalents for common action words
  const semanticGroups = [
    ["book", "booking", "reserve", "reservation", "schedule", "scheduling"],
    ["meeting", "appointment", "session", "consultation", "call"],
    ["demo", "demonstration", "presentation"],
    ["chat", "talk", "discuss", "conversation"],
    ["contact", "reach", "connect"],
  ];

  for (const group of semanticGroups) {
    if (group.includes(word1) && group.includes(word2)) {
      return true;
    }
  }

  return false;
}
