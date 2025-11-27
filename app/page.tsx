"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import MessageWall from "@/components/messages/message-wall";
import ChatInput from "@/components/ui/chat-input"; // Check if this path matches your repo, typically standard in MyAI3
import { WELCOME_MESSAGE } from "@/config";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex flex-col h-screen max-h-screen bg-transparent">
      
      {/* --- BINGIO HEADER --- */}
      <header className="flex-none p-6 text-center border-b border-white/5 bg-black/40 backdrop-blur-sm z-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">
          🎬 BINGIO
        </h1>
        <p className="text-sm text-gray-400 mt-2 font-light tracking-wide">
          <span className="text-[#e50914]">Watch what you feel.</span> Emotionally Intelligent Recommendations.
        </p>
      </header>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-4xl mx-auto space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          // Empty State / Welcome Screen
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80">
            <div className="p-4 rounded-full bg-white/5 border border-white/10">
              <span className="text-4xl">🍿</span>
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-semibold">Ready to binge?</h2>
              <p className="text-gray-400">{WELCOME_MESSAGE}</p>
              <p className="text-xs text-gray-600 uppercase tracking-widest pt-4">
                Powered by AI & Context Awareness
              </p>
            </div>
          </div>
        ) : (
          // Message History
          <div className="pb-4">
            <MessageWall messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* --- INPUT AREA --- */}
      <div className="flex-none p-4 md:p-6 w-full max-w-4xl mx-auto bg-transparent">
        <div className="relative glass-panel rounded-2xl p-2 md:p-3 ring-1 ring-white/10 focus-within:ring-[#e50914] transition-all duration-300">
            {/* Note: Standard HTML form used here to ensure compatibility if ChatInput component varies */}
            <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none"
              placeholder="How are you feeling right now? (e.g., Sad, nostalgic, energetic...)"
              value={input}
              onChange={handleInputChange}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-[#e50914] hover:bg-[#b20710] text-white rounded-xl px-6 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
        
        {/* --- FOOTER / CREDITS --- */}
        <div className="mt-4 text-center">
            <p className="text-xs text-gray-600 font-medium">
                Built with ❤️ by <span className="text-gray-400">Granth & Nikita</span>
            </p>
        </div>
      </div>
    </main>
  );
}
