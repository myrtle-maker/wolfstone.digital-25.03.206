import type { TickerMessage } from "./chat-data";

interface ChatBubbleProps {
  isDark: boolean;
  isStreaming?: boolean;
  text: string;
  role: TickerMessage["role"];
}

const BRAND_PLACEHOLDER = "[Your Brand]";

/** Split text around every occurrence of [Your Brand] */
function renderWithBrandHighlight(text: string, isUser: boolean) {
  if (isUser || !text.includes(BRAND_PLACEHOLDER)) {
    return <>{text}</>;
  }

  const parts = text.split(BRAND_PLACEHOLDER);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    elements.push(<span key={`t-${i}`}>{part}</span>);
    if (i < parts.length - 1) {
      elements.push(
        <span
          key={`b-${i}`}
          className="brand-highlight"
        >
          {BRAND_PLACEHOLDER}
        </span>
      );
    }
  });

  return <>{elements}</>;
}

const ChatBubble = ({ isDark, isStreaming = false, text, role }: ChatBubbleProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] px-3.5 py-2.5 ${
          isUser ? "rounded-[14px] rounded-br-[4px]" : "rounded-[14px] rounded-bl-[4px]"
        }`}
        style={{
          backgroundColor: isUser
            ? "hsl(190 100% 45% / 0.15)"
            : isDark
              ? "hsl(0 0% 100% / 0.06)"
              : "hsl(var(--wd-white) / 0.88)",
          border: isUser
            ? "1px solid hsl(190 100% 45% / 0.2)"
            : `1px solid ${isDark ? "hsl(0 0% 100% / 0.08)" : "hsl(var(--wd-navy) / 0.08)"}`,
          boxShadow: "0 4px 20px hsl(0 0% 0% / 0.15)",
        }}
      >
        <p
          className={`text-[11px] leading-relaxed ${isUser ? "" : "font-mono"}`}
          style={{
            color: isUser
              ? "hsl(var(--wd-white) / 0.92)"
              : isDark
                ? "hsl(var(--wd-white) / 0.78)"
                : "hsl(var(--wd-navy-text) / 0.78)",
          }}
        >
          {renderWithBrandHighlight(text, isUser)}
          {isStreaming && (
            <span
              className="ml-0.5 inline-block h-[11px] w-[2px] animate-pulse align-middle"
              style={{ backgroundColor: "hsl(var(--wd-white) / 0.5)" }}
            />
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
