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

const formSchema = z.object({
  message: z.string().min(1).max(2000),
});

const STORAGE_KEY = "chat-messages";

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef(false);

  const stored =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
      : { messages: [], durations: {} };

  const [initialMessages] = useState<UIMessage[]>(stored.messages || []);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations || {});
    setMessages(stored.messages || []);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, durations })
      );
    }
  }, [messages, durations, isClient]);

  useEffect(() => {
    if (!isClient || initialMessages.length > 0 || welcomeMessageShownRef.current)
      return;

    const welcomeMessage: UIMessage = {
      id: `welcome-${Date.now()}`,
      role: "assistant",
      parts: [{ type: "text", text: WELCOME_MESSAGE }],
    };

    setMessages([welcomeMessage]);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages: [welcomeMessage], durations: {} })
    );

    welcomeMessageShownRef.current = true;
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  function onSubmit(data: any) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    setMessages([]);
    setDurations({});
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: [], durations: {} }));
    toast.success("Chat cleared");
  }

  return (
    <div className="flex h-screen justify-center font-sans">
      <main className="w-full h-screen relative">

        {/* 🔥 FIXED HEADER (ONLY CHANGED PART) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background pb-4 shadow-sm">
          <ChatHeader>
            <ChatHeaderBlock />

            <ChatHeaderBlock className="flex flex-col items-center text-center select-none">

              {/* Glow + Bigger Logo */}
              <div className="relative flex items-center justify-center mb-1">
                <div
                  className="absolute"
                  style={{
                    width: 110,
                    height: 110,
                    background:
                      "radial-gradient(circle, rgba(255,140,60,0.25), rgba(255,140,60,0) 70%)",
                    filter: "blur(12px)",
                    borderRadius: "9999px",
                  }}
                />
                <Avatar className="h-16 w-16 shadow-lg ring-1 ring-orange-300/40">
                  <AvatarImage src="/logo.png" />
                  <AvatarFallback>
                    <Image src="/logo.png" alt="logo" width={64} height={64} />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* TITLE */}
              <div className="text-xl font-bold text-orange-700">
                Chat with {AI_NAME}
              </div>

              {/* SUBTITLE */}
              <div className="text-xs text-orange-800/70 font-medium mt-1">
                Your mood-tuned movie companion
              </div>

            </ChatHeaderBlock>

            <ChatHeaderBlock className="justify-end">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Plus className="size-4" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        {/* CHAT SCROLL */}
        <div className="h-screen overflow-y-auto px-5 pt-28 pb-40">
          <MessageWall
            messages={messages}
            status={status}
            durations={durations}
            onDurationChange={(k, d) =>
              setDurations((prev) => ({ ...prev, [k]: d }))
            }
          />
          {status === "submitted" && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* FOOTER (unchanged) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background pt-4 pb-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="max-w-3xl mx-auto w-full px-5">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="message"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <div className="relative">
                        <Input
                          {...field}
                          className="h-14 rounded-2xl bg-card pr-14 pl-5"
                          placeholder="Type your message here..."
                          disabled={status === "streaming"}
                        />
                        <Button
                          className="absolute right-3 top-2 rounded-full"
                          type="submit"
                          disabled={!field.value.trim()}
                          size="icon"
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </div>

          <div className="text-center text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} {OWNER_NAME} •
            <Link href="/terms" className="underline"> Terms of Use </Link> • Powered by Ringel.AI
          </div>
        </div>
      </main>
    </div>
  );
}
