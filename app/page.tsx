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

/* ---------- same form + storage logic (unchanged) ---------- */
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

/* ---------- component ---------- */
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
    <div className="page-root">
      {/* Header (keeps same general look) */}
      <div className="site-header">
        <div className="site-header-inner">
          <div className="left-space" />
          <div className="header-center">
            <div className="logo-wrap">
              <div className="logo-bg">
                <Image src="/logo.png" alt="Bingio" width={44} height={44} />
              </div>
            </div>
            <div className="title-block">
              <div className="title">Chat with <span className="accent">{AI_NAME}</span></div>
              <div className="subtitle">Your mood-tuned movie companion</div>
            </div>
          </div>
          <div className="header-actions">
            <Button variant="outline" size="sm" onClick={clearChat} className="border-gray-200">
              <Plus className="w-4 h-4 mr-2" /> {CLEAR_CHAT_TEXT}
            </Button>
          </div>
        </div>
      </div>

      {/* Main centered column */}
      <main className="main-outer">
        <div className="main-inner">
          <div className="chat-card">
            {isClient ? (
              <>
                <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                {status === "submitted" && (
                  <div className="loader-row">
                    <Loader2 className="loader" />
                  </div>
                )}
              </>
            ) : (
              <div className="loading-row">
                <Loader2 className="loader" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Composer - centered and aligned with main-inner */}
      <div className="composer-outer">
        <div className="composer-inner">
          <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="chat-form-message" className="sr-only">Message</FieldLabel>
                    <div className="composer-row">
                      <Input
                        {...field}
                        id="chat-form-message"
                        className="composer-input"
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
                      <div className="composer-controls">
                        {(status === "ready" || status === "error") && (
                          <Button
                            className="send-button"
                            type="submit"
                            disabled={!field.value.trim()}
                            size="icon"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                        )}
                        {(status === "streaming" || status === "submitted") && (
                          <Button
                            className="stop-button"
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

          <div className="footer-line">
            © {new Date().getFullYear()} {OWNER_NAME} &nbsp;
            <Link href="/terms" className="underline">Terms of Use</Link> &nbsp;
            Powered by <Link href="https://ringel.ai/" className="underline">Ringel.AI</Link>
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        :root{
          --bg: #FFF8F3;
          --card: #ffffff;
          --accent: #FF7A3D;
          --muted: #6B7280;
          --lead: #1F2937;
          --shadow: 0 10px 30px rgba(17,24,39,0.06);
        }

        .page-root {
          min-height: 100vh;
          background: linear-gradient(90deg, rgba(255,250,248,1) 0%, rgba(255,245,240,1) 50%, rgba(255,250,248,1) 100%);
          color: var(--lead);
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }

        /* Header */
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.88);
          border-bottom: 1px solid rgba(17,24,39,0.04);
        }
        .site-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-center { display:flex; gap:12px; align-items:center; }
        .logo-bg { width:52px; height:52px; border-radius:12px; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg, var(--accent), #FFB067); box-shadow: var(--shadow); overflow:hidden; }
        .title { font-weight:600; font-size:16px; text-align:center; }
        .accent { color: var(--accent); }
        .subtitle { font-size:12px; color: var(--muted); text-align:center; margin-top:2px; }

        /* Main: center column with balanced rails */
        .main-outer {
          display: flex;
          justify-content: center;
          padding: 36px 20px 120px;
        }
        .main-inner {
          width: 100%;
          max-width: 980px;      /* center column width */
        }
        .chat-card {
          background: var(--card);
          border-radius: 14px;
          padding: 28px;
          box-shadow: var(--shadow);
          min-height: 60vh;
        }

        .loader-row, .loading-row { display:flex; justify-content:center; padding:24px; }
        .loader { width:20px; height:20px; color: #c7c7c7; }

        /* Composer */
        .composer-outer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 20px;
          pointer-events: none;
        }
        .composer-inner {
          max-width: 980px;
          margin: 0 auto;
          pointer-events: auto;
        }
        .composer-row {
          display:flex;
          gap:10px;
          align-items:center;
          background: transparent;
        }
        .composer-input {
          flex:1;
          border-radius: 999px;
          padding: 14px 18px;
          border: 1px solid rgba(17,24,39,0.06);
          box-shadow: var(--shadow);
          font-size:15px;
          outline:none;
        }
        .composer-input:focus { box-shadow: 0 12px 40px rgba(255,122,61,0.10); border-color: var(--accent); }

        .composer-controls { display:flex; gap:8px; align-items:center; margin-left: 4px; }
        .send-button, .stop-button { border-radius: 999px; padding:10px; }

        .footer-line { margin-top:10px; text-align:center; color:var(--muted); font-size:13px; padding:6px 0; }

        /* Responsive behavior */
        @media (max-width: 900px) {
          .main-inner, .composer-inner { max-width: 720px; padding:0 8px; }
          .site-header-inner { padding: 10px 12px; }
        }
        @media (max-width: 640px) {
          .main-inner, .composer-inner { max-width: 100%; padding:0 12px; }
          .chat-card { padding: 18px; }
        }
      `}</style>
    </div>
  );
}
