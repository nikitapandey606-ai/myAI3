"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css"; // optional: if your project uses CSS modules; if not, global.css handles it

type Role = "assistant" | "user";
type Msg = {
  id: string;
  role: Role;
  text: string;
  time?: string | null;
  streaming?: boolean;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "seed-1",
      role: "assistant",
      text: "Hello! I'm Bingio — tell me how you feel and who you're watching with, and I'll recommend a film or series for your vibe.",
      time: nowTime(),
      streaming: false,
    },
  ]);

  const [value, setValue] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortControllers = useRef<Record<string, AbortController>>({});

  // scroll-to-bottom after new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight + 9999;
  }, [messages]);

  function pushMessage(m: Msg) {
    setMessages((s) => [...s, m]);
  }

  function replaceMessage(id: string, patch: Partial<Msg>) {
    setMessages((s) => s.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  // send user message and call backend streaming endpoint
  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = {
      id: "u-" + crypto.randomUUID(),
      role: "user",
      text,
      time: nowTime(),
      streaming: false,
    };
    pushMessage(userMsg);
    setValue("");

    // create assistant placeholder that will be streamed into
    const assistantId = "a-" + crypto.randomUUID();
    const assistantPlaceholder: Msg = {
      id: assistantId,
      role: "assistant",
      text: "",
      time: null,
      streaming: true,
    };
    pushMessage(assistantPlaceholder);

    // prepare abort controller so user can start new convo or cancel
    const ac = new AbortController();
    abortControllers.current[assistantId] = ac;

    try {
      // POST to your existing route. The API in this repo expects streaming responses.
      // If your route expects a different shape, adjust the JSON payload accordingly.
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            // you can send whole session for better context — minimal example sends only user message
            { role: "user", content: text },
          ],
          // include any flags your backend expects:
          stream: true,
        }),
        signal: ac.signal,
      });

      if (!resp.ok || !resp.body) {
        // non-streaming fallback: show error text or try to parse json
        const txt = await resp.text();
        replaceMessage(assistantId, { text: txt || "Error: model did not return a response", time: nowTime(), streaming: false });
        return;
      }

      // Stream the response (works for endpoints that return plain text chunks)
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value: chunk, done: readerDone } = await reader.read();
        if (readerDone) {
          done = true;
          break;
        }
        const str = decoder.decode(chunk, { stream: true });
        // some streaming endpoints send JSON events (like SSE). If so, you may need to parse.
        // This generic logic appends any plain text to the assistant bubble.
        buffer += str;
        // update assistant bubble with buffer
        replaceMessage(assistantId, { text: buffer, streaming: true });
      }

      // finalize
      replaceMessage(assistantId, { text: buffer, streaming: false, time: nowTime() });
    } catch (err: any) {
      if (err.name === "AbortError") {
        replaceMessage(assistantId, { text: "[Generation cancelled]", streaming: false, time: nowTime() });
      } else {
        replaceMessage(assistantId, { text: `[Error: ${err?.message || "unknown"}]`, streaming: false, time: nowTime() });
      }
    } finally {
      // cleanup controller
      delete abortControllers.current[assistantId];
    }
  }

  // keyboard handler
  async function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
  }

  // optional: cancel active streams (if user taps New)
  function cancelActive() {
    Object.values(abortControllers.current).forEach((ac) => ac.abort());
    abortControllers.current = {};
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-avatar movie-avatar" title="Bingio">
              <span className="logo-film">🎞️</span>
            </div>
            <div>
              <div className="header-title">Chat with Bingio</div>
              <div className="header-sub">Emotion-aware movie & series recommendations</div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="btn-new"
              onClick={() => {
                cancelActive();
                // reset conversation
                setMessages([
                  {
                    id: "seed-1",
                    role: "assistant",
                    text: "Hello! I'm Bingio — tell me how you feel and who you're watching with, and I'll recommend a film or series for your vibe.",
                    time: nowTime(),
                    streaming: false,
                  },
                ]);
                setValue("");
              }}
            >
              + New
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="chat-column">
          <div className="message-wall" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`message-row ${m.role === "assistant" ? "assistant" : "user"}`}>
                <div className="message-avatar">{m.role === "assistant" ? "B" : "Y"}</div>
                <div className={`bubble ${m.role === "user" ? "bubble-user" : ""}`}>
                  <div className="bubble-text">
                    {/* Preserve line breaks from model */}
                    {m.text.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                    {/* while streaming, show subtle dots */}
                    {m.streaming ? (
                      <span className="typing-dots" aria-hidden>
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </span>
                    ) : null}
                  </div>
                  <div className="meta">{m.time ?? ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="input-sticky">
        <form className="input-bar" onSubmit={onSubmit}>
          <input
            placeholder="Describe your mood, who you're watching with, or ask anything..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Type your message"
            autoFocus
          />
          <button type="submit" className="send-btn" aria-label="Send">
            <span>🎬</span>
          </button>
        </form>
      </div>

      <footer className="footer-note">© 2025 Granth & Nikita · Terms of Use · Powered by Ringel.AI</footer>

      <style jsx>{`
        /* small scoped styles to avoid dependency changes — global.css will also apply */
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--background, #fff);
        }
        .app-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 16px 28px;
          position: sticky;
          top: 0;
          background: var(--card, #fff);
          z-index: 30;
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-avatar {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent, #ef6f58);
          color: white;
          font-weight: 700;
        }
        .header-title {
          font-weight: 700;
          color: var(--foreground, #0f172a);
        }
        .header-sub {
          font-size: 13px;
          color: var(--muted-foreground, #667085);
        }
        .btn-new {
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .main {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 22px;
        }
        .chat-column {
          width: 100%;
          max-width: 1100px;
        }
        .message-wall {
          height: calc(100vh - 240px);
          overflow: auto;
          padding: 6px 12px;
        }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin: 18px 6px;
        }
        .message-row.user {
          justify-content: flex-end;
        }
        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: #eef2ff;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .bubble {
          max-width: 820px;
          background: #f3f7fb;
          padding: 14px 18px;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 1px 0 rgba(16,24,40,0.03);
        }
        .bubble-user {
          background: linear-gradient(135deg, #ef8a6a, #e26a4d);
          color: white;
        }
        .bubble-text {
          white-space: pre-wrap;
          font-size: 16px;
          line-height: 1.45;
        }
        .meta {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 8px;
        }

        .input-sticky {
          position: sticky;
          bottom: 18px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          padding: 0 24px 18px;
        }
        .input-bar {
          width: 100%;
          max-width: 1100px;
          display: flex;
          gap: 12px;
          align-items: center;
          background: rgba(255,255,255,0.9);
          padding: 12px;
          border-radius: 999px;
          box-shadow: 0 8px 30px rgba(15,23,42,0.08);
        }
        .input-bar input {
          width: 100%;
          border: none;
          outline: none;
          padding: 12px 16px;
          font-size: 16px;
        }
        .send-btn {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ef8a6a, #e26a4d);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        /* typing dots animation */
        .typing-dots {
          display: inline-flex;
          gap: 6px;
          margin-left: 8px;
          align-items: center;
        }
        .typing-dots .dot {
          width: 6px;
          height: 6px;
          background: #9aa4b2;
          border-radius: 50%;
          opacity: 0.9;
          animation: blink 1s infinite ease-in-out;
        }
        .typing-dots .dot:nth-child(2) {
          animation-delay: 0.12s;
        }
        .typing-dots .dot:nth-child(3) {
          animation-delay: 0.24s;
        }
        @keyframes blink {
          0% {
            transform: translateY(0);
            opacity: 0.18;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0.18;
          }
        }

        .footer-note {
          padding: 18px;
          text-align: center;
          color: #6b7280;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
