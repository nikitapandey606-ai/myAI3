// app/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Square, Loader2, Plus } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Link from "next/link";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error("Failed to load messages from localStorage:", error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== "undefined" ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
  }

  return (
    <div className="min-h-screen font-sans bg-movie-bg text-movie-foreground">
      {/* header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="chat-header max-w-7xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {/* AvatarImage will be constrained to 40px */}
              <AvatarImage src="/logo.png" alt="Bingio logo" className="h-10 w-10 object-cover rounded-full" />
              <AvatarFallback>🎬</AvatarFallback>
            </Avatar>

            <div>
              <div className="text-lg font-semibold tracking-tight">Chat with {AI_NAME}</div>
              <div className="text-xs text-muted-foreground">Emotion-aware movie & series recommendations</div>
            </div>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Plus className="mr-2 h-4 w-4" />
              {CLEAR_CHAT_TEXT}
            </Button>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="pt-28 pb-44">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-card/70 rounded-xl p-6">
            <div className="min-h-[56vh]">
              {isClient ? (
                <>
                  <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                  {status === "submitted" && (
                    <div className="flex items-center mt-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <div className="ml-3 text-sm text-muted-foreground">Thinking...</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* input footer */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
        <div className="max-w-3xl w-full">
          <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="w-full">
                    <FieldLabel htmlFor="chat-form-message" className="sr-only">Message</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="chat-form-message"
                        className="h-14 pr-16 pl-6 rounded-full shadow-lg"
                        placeholder="Describe your mood, who you're watching with, or ask anything..."
                        disabled={status === "streaming"}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                      {(status === "ready" || status === "error") && (
                        <Button
                          className="absolute right-2 top-2 rounded-full bg-movie-accent text-white"
                          type="submit"
                          disabled={!field.value.trim()}
                          size="icon"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      )}
                      {(status === "streaming" || status === "submitted") && (
                        <Button
                          className="absolute right-2 top-2 rounded-full bg-movie-muted text-white"
                          size="icon"
                          onClick={() => {
                            stop();
                          }}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="mt-3 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {OWNER_NAME} &nbsp;
            <Link href="/terms" className="underline">Terms of Use</Link> &nbsp; Powered by Ringel.AI
          </div>
        </div>
      </div>
    </div>
  );
}
