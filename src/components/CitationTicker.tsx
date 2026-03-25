import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatBubble from "@/components/citation-ticker/ChatBubble";
import TypingDots from "@/components/citation-ticker/TypingDots";
import {
  conversations,
  platformColors,
  type TickerConversation,
  type TickerMessage,
} from "@/components/citation-ticker/chat-data";

const START_DELAY = 180;
const THINKING_DELAY = 180;
const AFTER_AI_DELAY = 1100;
const BETWEEN_CONVOS_DELAY = 1800;
const AI_CHARS_PER_TICK = 6;
const AI_TICK_INTERVAL = 14;

interface CitationTickerProps {
  variant?: "light" | "dark";
}

interface RenderedMessage {
  message: TickerMessage;
  text: string;
  streaming?: boolean;
}

const CitationTicker = ({ variant = "light" }: CitationTickerProps) => {
  const isDark = variant === "dark";
  const [conversationIndex, setConversationIndex] = useState(0);
  const [renderedMessages, setRenderedMessages] = useState<RenderedMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const conversation: TickerConversation = conversations[conversationIndex];

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const queueNextConversation = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      setConversationIndex((current) => (current + 1) % conversations.length);
    }, BETWEEN_CONVOS_DELAY);
  }, []);

  const playMessage = useCallback(
    (messageIndex: number) => {
      const nextMessage = conversation.messages[messageIndex];

      if (!nextMessage) {
        setIsThinking(false);
        queueNextConversation();
        return;
      }

      if (nextMessage.role === "user") {
        setIsThinking(false);
        setRenderedMessages((current) => [...current, { message: nextMessage, text: nextMessage.text }]);

        const upcomingMessage = conversation.messages[messageIndex + 1];
        timeoutRef.current = window.setTimeout(() => {
          if (upcomingMessage?.role === "ai") {
            setIsThinking(true);
          }
          playMessage(messageIndex + 1);
        }, upcomingMessage?.role === "ai" ? THINKING_DELAY : AFTER_AI_DELAY);

        return;
      }

      setIsThinking(false);
      setRenderedMessages((current) => [...current, { message: nextMessage, text: "", streaming: true }]);

      let currentCharIndex = 0;
      intervalRef.current = window.setInterval(() => {
        currentCharIndex = Math.min(currentCharIndex + AI_CHARS_PER_TICK, nextMessage.text.length);
        const partialText = nextMessage.text.slice(0, currentCharIndex);
        const isComplete = currentCharIndex >= nextMessage.text.length;

        setRenderedMessages((current) => {
          if (current.length === 0) return current;
          const updated = [...current];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            text: partialText,
            streaming: !isComplete,
          };
          return updated;
        });

        if (!isComplete) return;

        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        timeoutRef.current = window.setTimeout(() => {
          playMessage(messageIndex + 1);
        }, AFTER_AI_DELAY);
      }, AI_TICK_INTERVAL);
    },
    [conversation.messages, queueNextConversation]
  );

  useEffect(() => {
    clearTimers();
    setRenderedMessages([]);
    setIsThinking(false);

    timeoutRef.current = window.setTimeout(() => {
      playMessage(0);
    }, START_DELAY);

    return clearTimers;
  }, [conversationIndex, clearTimers, playMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [renderedMessages, isThinking, scrollToBottom]);

  const platformColor = useMemo(
    () => platformColors[conversation.platform] ?? platformColors.ChatGPT,
    [conversation.platform]
  );

  const fadeBgSolid = isDark ? "hsl(var(--wd-cream))" : "hsl(var(--wd-navy))";
  const fadeBgTransparent = isDark ? "hsl(var(--wd-cream) / 0)" : "hsl(var(--wd-navy) / 0)";

  return (
    <div className="relative hidden h-[560px] w-full overflow-hidden lg:block xl:h-[620px]">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-16"
        style={{ background: `linear-gradient(to bottom, ${fadeBgSolid}, ${fadeBgTransparent})` }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16"
        style={{ background: `linear-gradient(to top, ${fadeBgSolid}, ${fadeBgTransparent})` }}
      />

      <div
        ref={scrollRef}
        className="flex h-full flex-col overflow-y-auto px-2 pb-10 pt-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div key={conversation.platform} className="mb-4 flex animate-fade-in items-center gap-2 pl-1">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: platformColor }} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: platformColor }}>
            {conversation.platform}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 pr-1">
          {renderedMessages.map((item, index) => (
            <ChatBubble
              key={`${conversation.platform}-${index}-${item.message.role}`}
              isDark={isDark}
              isStreaming={item.streaming}
              role={item.message.role}
              text={item.text}
            />
          ))}

          {isThinking && (
            <div className="flex animate-fade-in justify-start">
              <div
                className="rounded-[14px] rounded-bl-[4px] px-4 py-3"
                style={{
                  backgroundColor: isDark ? "hsl(var(--wd-midnight) / 0.9)" : "hsl(var(--wd-white) / 0.88)",
                  border: `1px solid ${isDark ? "hsl(var(--wd-white) / 0.06)" : "hsl(var(--wd-navy) / 0.08)"}`,
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitationTicker;
