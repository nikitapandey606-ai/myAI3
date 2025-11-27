import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

export const MODEL = openai("gpt-4.1");

/* -------------------------------------------
   Date & Time (India Standard Time)
-------------------------------------------- */
function getDateAndTime(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "Asia/Kolkata",
  });
  return "The day today is " + dateStr + " and the time right now is " + timeStr + ".";
}

export const DATE_AND_TIME = getDateAndTime();

/* -------------------------------------------
   Branding
-------------------------------------------- */
export const AI_NAME = "Bingio";
export const OWNER_NAME = "Granth & Nikita";

export const WELCOME_MESSAGE =
  "Hey, I'm Bingio — your movie buddy, mood matcher, and vibe curator. Let's find something to watch!";

export const CLEAR_CHAT_TEXT = "New";

/* -------------------------------------------
   Moderation Messages (Brand Voice)
   ASCII-only, single-line, safe strings
-------------------------------------------- */

/* Sexual Content (adult explicit) */
export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I keep things clean here, so I can’t help with explicit sexual content. But I can suggest romantic or emotional movies instead.";

/* Sexual content involving minors */
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I can’t discuss anything involving minors in a sexual context. If you want, I can suggest respectful coming-of-age films.";

/* Harassment (general) */
export const MODERATION_DENIAL_MESSAGE_HARASSMENT =
  "I’m here for good vibes only, so I can’t engage with harassment. Want a feel-good movie instead?";

/* Harassment with threats */
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING =
  "I can’t help with threatening or aggressive messages. If you're upset, I can recommend calming or uplifting films.";

/* Hate speech */
export const MODERATION_DENIAL_MESSAGE_HATE =
  "I can’t assist with hateful content. If you want thoughtful films about social themes, I can suggest some.";

/* Hate speech + threats */
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING =
  "I can’t help with violent or threatening hate speech. But I can recommend impactful films that explore tough topics respectfully.";

/* Illegal activities */
export const MODERATION_DENIAL_MESSAGE_ILLICIT =
  "I can’t help with illegal activities. But I can find great movies based on any vibe you're in.";

/* Illegal + violent activities */
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT =
  "I can’t assist with violent or illegal actions. Want a safe thriller or action movie recommendation instead?";

/* Self-harm (general distress) */
export const MODERATION_DENIAL_MESSAGE_SELF_HARM =
  "I’m really sorry you're feeling this way. I can’t help with self-harm topics. Please consider reaching out to someo
