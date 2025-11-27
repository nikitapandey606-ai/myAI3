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
import { ChatHeader, ChatHeaderBlock } from "@/app/parts/chat-header";
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

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = () => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };
    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch {
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === "undefined") return;
  const data: StorageData = { messages, durations };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef(false);

  const stored = typeof window !== "undefined" ? loadMessagesFromStorage() : { messages: [], durations: {} };
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
    if (isClient) saveMessagesToStorage(messages, durations);
  }, [messages, durations, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations(prev => ({ ...prev, [key]: duration }));
  };

  // Welcome message on first load
  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
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
    <div className="flex h-screen justify-center font-sans bg-[#FFEDD0]">
      <main className="w-full h-screen relative">

        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#FFEDD0]/70 backdrop-blur-md pb-16">
          <ChatHeader>
            <ChatHeaderBlock />
            <ChatHeaderBlock className="justify-center items-center">
              <Avatar className="size-8 ring-1 ring-orange-500">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>
                  <Image src="/logo.png" width={36} height={36} alt="logo" />
                </AvatarFallback>
              </Avatar>
              <p className="tracking-tight text-orange-700 font-semibold">Chat with {AI_NAME}</p>
            </ChatHeaderBlock>
            <ChatHeaderBlock className="justify-end">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Plus className="size-4" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        {/* MESSAGES SCROLL */}
        <div className="h-screen overflow-y-auto px-5 pt-[100px] pb-[150px]">
          <div className="flex flex-col items-center">

            <MessageWall
              messages={messages.map(m => ({
                ...m,
                className: m.role === "assistant" ? "ai-message" : "user-message",
              }))}
              status={status}
              durations={durations}
              onDurationChange={handleDurationChange}
            />

            {status === "submitted" && (
              <Loader2 className="size-4 animate-spin text-orange-600" />
            )}
          </div>
        </div>

        {/* INPUT FIELD */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFEDD0]/70 backdrop-blur-xl pt-10">
          <div className="w-full px-5 pb-2 flex justify-center">
            <form className="max-w-3xl w-full" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="message"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="sr-only">Message</FieldLabel>

                      <div className="relative h-14">
                        <Input
                          {...field}
                          placeholder="Type your message..."
                          className="h-14 pr-14 pl-5 rounded-full bg-white/80 text-orange-900 placeholder:text-orange-500"
                          disabled={status === "streaming"}
                          autoComplete="off"
                        />

                        {status === "ready" && (
                          <Button
                            type="submit"
                            size="icon"
                            disabled={!field.value.trim()}
                            className="absolute right-3 top-3 rounded-full bg-orange-600 hover:bg-orange-700"
                          >
                            <ArrowUp className="text-white" />
                          </Button>
                        )}

                        {status !== "ready" && (
                          <Button
                            size="icon"
                            className="absolute right-3 top-3 rounded-full bg-gray-400"
                            onClick={stop}
                          >
                            <Square className="text-white" />
                          </Button>
                        )}
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </div>

          <div className="w-full text-center text-xs text-orange-700 pb-4">
            © {new Date().getFullYear()} {OWNER_NAME} • <Link href="/terms" className="underline">Terms</Link> • Powered by RingelAI
          </div>
        </div>
      </main>
    </div>
  );
}
