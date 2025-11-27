"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

/* ------------------ form schema + localStorage helpers (unchanged) ------------------ */
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], durations: {} };
    const parsed = JSON.parse(raw);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (e) {
    console.error("Failed to load messages from localStorage:", e);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save messages to localStorage:", e);
  }
};

/* ------------------ Page component (logic preserved) ------------------ */
export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeShownRef = useRef(false);

  const stored = typeof window !== "undefined" ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages ?? []);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations ?? {});
    setMessages(stored.messages ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [isClient, messages, durations]);

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeShownRef.current) {
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
      welcomeShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    setMessages([]);
    setDurations({});
    saveMessagesToStorage([], {});
    toast.success("Chat cleared");
  }

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prev) => ({ ...prev, [key]: duration }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="w-12" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden shadow" style={{ background: "linear-gradient(180deg,var(--accent),var(--primary))" }}>
              <Image src="/logo.png" alt="Bingio" width={44} height={44} className="object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">Chat with {AI_NAME}</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Your mood-tuned movie companion</span>
            </div>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Plus className="w-4 h-4 mr-1" /> {CLEAR_CHAT_TEXT}
            </Button>
          </div>
        </div>
      </header>

      {/* Scrollable center column */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-center px-4 py-6">
          <div className="w-full max-w-3xl">
            {/* Message container — constrained height so composer doesn't overlap */}
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: "calc(100vh - 260px)", /* header + composer + margins */
                paddingRight: "8px",
              }}
              aria-live="polite"
            >
              {isClient ? (
                <div className="mx-auto w-full">
                  <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                </div>
              )}
            </div>

            {/* small status/loader below message area */}
            {status === "submitted" && (
              <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky composer at bottom */}
      <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-sm border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="chat-form-message" className="sr-only">Message</FieldLabel>

                    <div className="relative">
                      <Input
                        {...field}
                        id="chat-form-message"
                        className="h-14 rounded-full px-4 pr-14 bg-white shadow"
                        placeholder="Type your message here..."
                        disabled={status === "streaming"}
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
                          type="submit"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                          disabled={!field.value.trim()}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      )}

                      {(status === "streaming" || status === "submitted") && (
                        <Button
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                          onClick={() => stop()}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="mt-3 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
            © {new Date().getFullYear()} {OWNER_NAME} &nbsp;
            <Link href="/terms" className="underline">Terms of Use</Link> &nbsp;·&nbsp;
            Powered by <Link href="https://ringel.ai/" className="underline">Ringel.AI</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
