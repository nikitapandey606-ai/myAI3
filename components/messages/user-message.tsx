// components/messages/user-message.tsx
import React from "react";
import { UIMessage } from "ai";

type Props = {
  message: UIMessage;
};

export const UserMessage: React.FC<Props> = ({ message }) => {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div className="user-message" aria-label="user message">
        {message.parts?.map((part, i) => (
          <span key={i} className="user-message-text">
            {part.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default UserMessage;
