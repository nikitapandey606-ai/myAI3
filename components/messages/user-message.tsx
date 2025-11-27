import { UIMessage } from "ai";
import { Response } from "@/components/ai-elements/response";
import React from "react";

export function UserMessage({ message }: { message: UIMessage }) {
  return (
    <div className="whitespace-pre-wrap w-full flex justify-end">
      {/* keep sizing classes but replace bg-neutral-100 with our brand class 'user-message' */}
      <div className="max-w-lg w-fit px-4 py-3 rounded-[20px] user-message">
        <div className="text-sm">
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return (
                <Response key={`${message.id}-${i}`}>
                  {part.text}
                </Response>
              );
            }
            // if other part types are ever added, safely ignore them
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default UserMessage;
