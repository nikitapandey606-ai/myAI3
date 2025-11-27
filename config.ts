import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

export const MODEL = openai("gpt-4.1");

/* Date & Time (India Standard Time) */
function getDateAndTime(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata"
  });
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "Asia/Kolkata"
  });
  return "The day today is " + dateStr + " and the time right now is " + timeStr + ".";
}

export const DATE_AND_TIME = getDateAndTime();

/* Branding */
export const AI_NAME = "Bingio";
export const OWNER_NAME = "Granth & Nikita";

export const WELCOME_MESSAGE =
  "Hey, I'm Bingio - your movie buddy, mood matcher, and vibe curator. Let's find something to watch!";

export const CLEAR_CHAT_TEXT = "New";

/* Moderation Messages (ASCII-only) */

/* Sexual Content (adult explicit) */
export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I keep things clean here, so I cannot help with explicit sexual content. I can suggest romantic or emotional movies instead.";

/* Sexual content involving minors */
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I cannot discuss anything involving minors in a sexual context. If you want, I can suggest respectful coming-of-age films.";

/* Harassment (g*
