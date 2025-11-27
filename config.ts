import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

export const MODEL = openai("gpt-4.1");

// Date & Time (India Standard Time)
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

// Branding
export const AI_NAME = "Bingio";
export const OWNER_NAME = "Granth & Nikita";

export const WELCOME_MESSAGE =
  "Hey, I'm Bingio - your movie buddy, mood matcher, and vibe curator. Let's find something to watch!";

export const CLEAR_CHAT_TEXT = "New";

// Moderation Messages (ASCII-only)

// Sexual Content (adult explicit)
export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I keep things clean here, so I cannot help with explicit sexual content. I can suggest romantic or emotional movies instead.";

// Sexual content involving minors
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I cannot discuss anything involving minors in a sexual context. If you want, I can suggest respectful coming-of-age films.";

// Harassment (general)
export const MODERATION_DENIAL_MESSAGE_HARASSMENT =
  "I am here for good vibes only, so I cannot engage with harassment. Want a feel-good movie instead?";

// Harassment with threats
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING =
  "I cannot help with threatening or aggressive messages. If you are upset, I can recommend calming or uplifting films.";

// Hate speech
export const MODERATION_DENIAL_MESSAGE_HATE =
  "I cannot assist with hateful content. If you want thoughtful films about social themes, I can suggest some.";

// Hate speech + threats
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING =
  "I cannot help with violent or threatening hate speech. I can recommend impactful films that explore tough topics respectfully.";

// Illegal activities
export const MODERATION_DENIAL_MESSAGE_ILLICIT =
  "I cannot help with illegal activities. But I can find great movies based on any vibe you are in.";

// Illegal + violent activities
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT =
  "I cannot assist with violent or illegal actions. Want a safe thriller or action movie recommendation instead?";

// Self-harm (general distress)
export const MODERATION_DENIAL_MESSAGE_SELF_HARM =
  "I am really sorry you are feeling this way. I cannot help with self-harm topics. Please consider reaching out to someone you trust or a helpline. I can suggest calming movies if you would like.";

// Self-harm intent
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT =
  "I cannot help with self-harm intentions. If you are in danger, please contact emergency services or a crisis hotline. Want something comforting to watch?";

// Self-harm instructions
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS =
  "I cannot provide any instructions related to self-harm. Please reach out to someone who can support you. I am here if you want calming or grounding movie suggestions.";

// Violence (non-graphic)
export const MODERATION_DENIAL_MESSAGE_VIOLENCE =
  "I cannot discuss violent or harmful actions. But I can suggest intense, dramatic, or thrilling movies if that is the vibe.";

// Graphic violence
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC =
  "I cannot help with graphic violent content. But I can suggest suspenseful or action-packed movies with lighter intensity.";

// Default fallback
export const MODERATION_DENIAL_MESSAGE_DEFAULT =
  "I cannot help with that request. If you are here for movie or vibe suggestions, I have plenty of picks.";

// Vector DB Settings
export const PINECONE_TOP_K = 40;
export const PINECONE_INDEX_NAME = "my-ai";
