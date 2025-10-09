import { db } from "@/db";
import { Action } from "@/db/schema";
import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const calendlyBookingTool = (chatbotId: string) =>
  tool({
    description:
      "Allow users to book, schedule, or arrange meetings, calls, demos, or appointments when they express intent to do so.",
    inputSchema: z.object({
      userIntent: z
        .string()
        .describe(
          "Description of what the user is trying to schedule or their meeting request",
        ),
      context: z
        .string()
        .optional()
        .describe("Additional context about the meeting request"),
      preferredMeetingType: z
        .string()
        .optional()
        .describe(
          "Type of meeting if specified (e.g., demo, consultation, sales call)",
        ),
    }),
    execute: async ({ userIntent, context, preferredMeetingType }) => {
      try {
        const calendlyActions = await db
          .select({
            id: Action.id,
            name: Action.name,
            description: Action.description,
            actionProperties: Action.actionProperties,
            showInQuickMenu: Action.showInQuickMenu,
          })
          .from(Action)
          .where(
            and(
              eq(Action.toolName, "calendly_booking"),
              eq(Action.isActive, true),
              eq(Action.chatbotId, chatbotId),
            ),
          );

        if (!calendlyActions.length) {
          return {
            error: "No Calendly booking actions configured",
            userIntent,
          };
        }

        const bestMatch = findBestCalendlyMatch(
          userIntent,
          preferredMeetingType,
          calendlyActions,
        );

        if (!bestMatch) {
          return {
            error: "No matching Calendly booking found for this request",
            userIntent,
            availableActions: calendlyActions.map((a) => ({
              name: a.name,
              description: a.description,
            })),
          };
        }

        const properties = bestMatch.actionProperties as {
          eventTypeUri: string;
          eventTypeName?: string;
          userEmail?: string;
        } | null;

        if (!properties || !properties.eventTypeUri) {
          return {
            error: "Invalid Calendly configuration - missing event type",
            actionId: bestMatch.id,
          };
        }

        // Extract the event type slug/name from the URI for the booking URL
        const eventTypeSlug = extractEventTypeSlug(
          properties.eventTypeUri,
          properties.eventTypeName,
        );

        // Generate the Calendly booking URL
        const calendlyUrl = generateCalendlyUrl(
          properties.eventTypeUri,
          eventTypeSlug,
        );

        return {
          success: true,
          actionId: bestMatch.id,
          name: bestMatch.name,
          description: bestMatch.description,
          eventTypeUri: properties.eventTypeUri,
          eventTypeName: properties.eventTypeName,
          userEmail: properties.userEmail,
          calendlyUrl,
          userIntent,
          context: context || undefined,
          meetingType: preferredMeetingType,
        };
      } catch (error) {
        console.error("Error executing Calendly booking tool:", error);
        return {
          error: "Failed to process Calendly booking request",
          userIntent,
        };
      }
    },
  });

// Find the best matching Calendly action based on user intent and meeting type
function findBestCalendlyMatch(
  userIntent: string,
  preferredMeetingType: string | undefined,
  actions: Array<{
    id: string;
    name: string | null;
    description: string | null;
    actionProperties: unknown;
    showInQuickMenu: boolean | null;
  }>,
) {
  const normalizedIntent = normalizeText(userIntent);
  const normalizedMeetingType = preferredMeetingType
    ? normalizeText(preferredMeetingType)
    : "";
  const intentWords = tokenize(normalizedIntent);
  const meetingTypeWords = tokenize(normalizedMeetingType);
  const allIntentWords = new Set([...intentWords, ...meetingTypeWords]);

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
    // 3. Meeting type specific matching
    else if (preferredMeetingType) {
      if (
        description?.includes(normalizedMeetingType) ||
        name?.includes(normalizedMeetingType)
      ) {
        score = 600 + normalizedMeetingType.length;
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

// Extract event type slug from URI or use provided name
function extractEventTypeSlug(
  eventTypeUri: string,
  eventTypeName?: string,
): string {
  if (eventTypeName) {
    return eventTypeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Extract from URI if no name provided
  // URI format: https://api.calendly.com/event_types/XXXXXXXX
  const match = eventTypeUri.match(/\/event_types\/([^\/]+)$/);
  if (match) {
    return match[1];
  }

  return "meeting";
}

// Generate Calendly booking URL
function generateCalendlyUrl(
  eventTypeUri: string,
  eventTypeSlug: string,
): string {
  // Extract user identifier from the event type URI
  // This would need to be adapted based on your actual Calendly API response structure
  // For now, we'll create a generic URL that should work with most Calendly setups

  // The URI typically contains the user's calendly username/organization
  // We need to construct the public booking URL
  const match = eventTypeUri.match(/\/event_types\/(.+)/);
  if (match) {
    // This is a simplified approach - you might need to store the actual booking URL
    // or retrieve it from your Calendly integration
    return `https://calendly.com/book/${eventTypeSlug}`;
  }

  return `https://calendly.com/book/${eventTypeSlug}`;
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " "); // Normalize whitespace
}

// Tokenize text into words, filtering out stop words
function tokenize(text: string): string[] {
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
