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

/* -------------------------------------------
   Branding
-------------------------------------------- */
export const AI_NAME = "Bingio";
export const OWNER_NAME_
