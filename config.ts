import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

export const MODEL = openai('gpt-4.1');

/** Date & time — set to Asia/Kolkata for the user base */
function getDateAndTime(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { // 'en-GB' produces day-month-year which is common in India
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
    const timeStr = now.toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: 'Asia/Kolkata'
    });
    return `The day today is ${dateStr} and the time right now is ${timeStr}.`;
}

export const DATE_AND_TIME = getDateAndTime();

export const AI_NAME = "Bingio";
export const OWNER_NAME = "Granth & Nikita";

/** UX text */
export const WELCOME_MESSAGE = `Hey — I'm ${AI_NAME}. Movie buddy, mood matcher, and vibe curator. Bingio’s got your vibe 🎬`;
export const CLEAR_CHAT_TEXT = "New";

/* -----------------------------
   Moderation messages — brand voice
   Short, warm, non-judgmental, and actionable
   -----------------------------*/

/** Sexual / explicit */
export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I keep things family-friendly here. I can’t help with explicit sexual content, but I can suggest romantic or mature-rated films instead. Want something romantic or more intense?";

/** Sexual content involving minors (always strict) */
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I can’t help with anything involving minors in a sexual context. If you want, I can recommend age-appropriate movies that explore coming-of-age themes in a respectful way.";

/** Harassment / non-threatening */
export const MODERATION_DENIAL_MESSAGE_HARASSMENT =
  "I’m here for kind conversation — I can’t engage with harassing content. Let’s keep it respectful. Want a feel-good movie suggestion instead?";

/** Threatening or violent harassment */
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING =
  "I can’t help with threats or violent harassment. If you’re feeling upset, I can suggest calming films or a quick feel-better playlist.";

/** Hate speech */
export const MODERATION_DENIAL_MESSAGE_HATE =
  "I can’t engage with hateful content. If you’re looking for films that explore social themes thoughtfully, I can recommend some respectful, high-quality options.";

/** Violent hate / threats */
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING =
  "I can’t assist with violent or threatening hate speech. I can, however, help with thoughtful films that address tough topics responsibly.";

/** Illicit (general) */
export const MODERATION_DENIAL_MESSAGE_ILLICIT =
  "I can’t help with illegal activities. If you’re here for movie recs or mood lifts, tell me your vibe and I’ll find something great.";

/** Illicit + violent specifics */
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT =
  "I can’t assist with violent or illegal instructions. Want a suspenseful thriller or a safer edge-of-the-seat pick instead?";

/** Self-harm — general */
export const MODERATION_DENIAL_MESSAGE_SELF_HARM =
  "I’m really sorry you’re feeling this way. I can’t help with self-harm instructions. Please reach out to someone you trust or a local helpline — I can also suggest gentle, calming movies to help you feel a little better.";

/** Self-harm — intent */
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT =
  "I can’t help with
