// components/messages/assistant-message.tsx
import React from "react";
import TextRecommendation from "../ui/TextRecommendation";

type AssistantMessageProps = {
  message: {
    id?: string;
    text?: string;
    meta?: any;
  };
};

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const { text = "", meta = {} } = message || {};
  const recs: any[] = meta?.recommendations || meta?.movies || [];

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#FF6B96] to-[#FF005C] flex items-center justify-center text-white font-bold">
          BI
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-[#0b0b0c] border border-[#151515] rounded-xl p-4">
          {recs && recs.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="text-white font-medium">Here are some picks that match your mood:</div>

              <div className="flex flex-col gap-3">
                {recs.map((r: any, idx: number) => {
                  const card = {
                    title: r.title || r.name || "Untitled",
                    type: r.type || r.kind || "movie",
                    genre: r.genre || r.genres || "",
                    synopsis: r.synopsis || r.overview || "",
                    duration: r.duration || r.runtime || "",
                    year: r.year || r.release_year || "",
                    emotionalReason: r.emotional_reason || r.emotionalReason || r.reason || "",
                  };
                  return (
                    <div key={`${card.title}-${idx}`} className="flex flex-col gap-2">
                      <div className="text-sm text-gray-400">#{idx + 1}</div>
                      <TextRecommendation {...card} />
                    </div>
                  );
                })}
              </div>

              <div className="text-gray-400 text-sm mt-2">
                Tell me if you'd like <strong>shorter</strong>, <strong>lighter</strong>, <strong>more emotional</strong>, or <strong>older classics</strong> — I can refine.
              </div>
            </div>
          ) : (
           <div className="text-gray-200 whitespace-pre-wrap">
  {text}
</div>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">BINGIO • Emotion-aware recommendations</div>
      </div>
    </div>
  );
}
