"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Eraser, Loader2, Plus, PlusIcon, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = 'chat-messages';

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== 'undefined' ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
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
    toast.success("Chat cleared");
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#1F2937] antialiased">
      {/* Header area - polished and centered */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          {/* Left area is intentionally empty to center the header in the page */}
          <div className="w-16" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-md flex items-center justify-center bg-gradient-to-br from-[#FF7A3D] to-[#FFB067] ring-1 ring-white">
                {/* use your logo in public folder at /logo.png */}
                <Image src="/logo.png" alt="Bingio" width={44} height={44} className="object-cover" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Chat with <span className="text-[#FF7A3D]">{AI_NAME}</span></div>
                <div className="text-xs text-gray-500">Your mood-tuned movie companion</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={clearChat} className="border-gray-200">
              <Plus className="w-4 h-4 mr-2" /> {CLEAR_CHAT_TEXT}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 pt-36 pb-36">
        <div className="flex flex-col items-center">
          <div className="w-full">
            {/* Message wall and loader (keeps same component) */}
            <div className="rounded-2xl bg-white shadow-soft p-6">
              {isClient ? (
                <>
                  <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                  {status === "submitted" && (
                    <div className="flex justify-start mt-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Composer area (sticky bottom) */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-6xl px-6 pb-6">
          <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <FieldGroup>
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="relative">
                      <FieldLabel htmlFor="chat-form-message" className="sr-only">Message</FieldLabel>
                      <Input
                        {...field}
                        id="chat-form-message"
                        className="h-14 pr-20 pl-4 bg-white rounded-full shadow-md border border-gray-100 placeholder:text-gray-400"
                        placeholder="Type your message here..."
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

                      {/* Buttons */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {(status === "ready" || status === "error") && (
                          <Button
                            className="rounded-full p-2"
                            type="submit"
                            disabled={!field.value.trim()}
                            size="icon"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                        )}
                        {(status === "streaming" || status === "submitted") && (
                          <Button
                            className="rounded-full p-2"
                            size="icon"
                            onClick={() => {
                              stop();
                            }}
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          {/* footer line */}
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
            © {new Date().getFullYear()} {OWNER_NAME}&nbsp;
            <Link href="/terms" className="underline ml-1 mr-1">Terms of Use</Link>
            Powered by&nbsp;
            <Link href="https://ringel.ai/" className="underline">Ringel.AI</Link>
          </div>
        </div>
      </div>

      {/* Inline styles to polish spacing and shadows */}
      <style jsx>{`
        .shadow-soft {
          box-shadow: 0 10px 30px rgba(17,24,39,0.06);
        }
        /* slightly larger composer input on small screens */
        @media (max-width: 640px) {
          main { padding-top: 20rem; }
        }
      `}</style>
    </div>
  );
}
