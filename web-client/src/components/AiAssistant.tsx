"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpRight, Send, UserCheck, X } from "lucide-react";
import Link from "next/link";
import {
  getAssistantResponse,
  type AssistantResponse,
} from "@/lib/assistant-content";
import Image from "next/image";
import styles from "./ai-assistant.module.css";
import floating from "./floating-controls.module.css";
import { useLanguage } from "@/hooks/useTranslation";
import { useSession } from "next-auth/react";

interface Message {
  sender: "user" | "bot";
  text: string;
  response?: AssistantResponse;
  time: string;
}

const translations: Record<string, Record<string, string>> = {
  vi: {
    tabChatbot: "Trợ lý AI",
    tabChatbotDesc: "Vietnam ParaSports · Hướng dẫn tự động",
    quickPromptHeading: "Bắt đầu với gợi ý",
    chatbotInputPlaceholder: "Nhập câu hỏi của bạn tại đây...",
    chatbotSendBtn: "Gửi tin nhắn",
    botGreeting:
      "Xin chào! Tôi là trợ lý hướng dẫn của Vietnam ParaSports. Bạn có thể hỏi về bộ môn, câu lạc bộ, tin tức hoặc học liệu Creator Lab. Tôi cũng có các mẫu caption và kịch bản để bạn kể câu chuyện thể thao của mình.",
    botGreetingTime: "Vừa xong",
    botResponseTime: "Vừa xong",
    botTyping: "Trợ lý AI đang soạn câu trả lời...",
    loadingResponse: "Đang gửi...",
  },
  en: {
    tabChatbot: "AI Assistant",
    tabChatbotDesc: "Vietnam ParaSports · Automated guidance",
    quickPromptHeading: "Start with a suggestion",
    chatbotInputPlaceholder: "Type your question here...",
    chatbotSendBtn: "Send Message",
    botGreeting:
      "Hello! I’m your Vietnam ParaSports guide. Explore sports, clubs, news and Creator Lab resources, or start with a caption draft or video outline for your sporting story.",
    botGreetingTime: "Just now",
    botResponseTime: "Just now",
    botTyping: "AI Assistant is typing...",
    loadingResponse: "Sending...",
  },
};

function getPersonalizedGreeting(
  session: { user?: { name?: string | null } } | null,
  language: string,
  defaultGreeting: string,
): string {
  if (!session?.user?.name) return defaultGreeting;
  return language === "vi"
    ? `Xin chào ${session.user.name}! Tôi là trợ lý hướng dẫn của Vietnam ParaSports. Tôi giúp bạn khám phá bộ môn, câu lạc bộ, tin tức và Creator Lab, đồng thời gợi ý caption và kịch bản kể chuyện thể thao. Bạn muốn bắt đầu từ đâu?`
    : `Hello ${session.user.name}! I’m your Vietnam ParaSports guide. I can help you explore sports, clubs, news and Creator Lab, and suggest captions and sporting story outlines. Where would you like to start?`;
}

const ASSISTANT_MARK = "/assets/brand/vietnam-parasports-2026-mark.png";

export default function AiAssistant() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const tStr = translations[language] || translations.vi;
  const vi = language === "vi";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionName = session?.user?.name;
  const sessionEmail = session?.user?.email;
  const sessionRole = (session?.user as any)?.role;

  const quickPrompts = vi
    ? [
        "Viết caption giới thiệu vận động viên.",
        "Tìm câu lạc bộ để tập luyện.",
        "Tìm hiểu bộ môn và hạng thương tật.",
        "Khám phá khóa học Creator Lab.",
        "Gợi ý kịch bản video tập luyện.",
        "Xem tin tức và sự kiện ParaSports.",
      ]
    : [
        "Write an athlete introduction caption.",
        "Find a club to train with.",
        "Explore sports and classifications.",
        "Explore Creator Lab courses.",
        "Suggest a training video script.",
        "Find ParaSports news and events.",
      ];

  useEffect(() => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    setBotLoading(false);
    setMessages([
      {
        sender: "bot",
        text: getPersonalizedGreeting(session, language, tStr.botGreeting),
        time: tStr.botGreetingTime,
      },
    ]);
    return () => {
      if (responseTimer.current) clearTimeout(responseTimer.current);
    };
    // Reset on an actual language/account change, rather than every session refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, sessionName, sessionEmail, sessionRole]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.isComposing) {
        setIsOpen(false);
        launcherRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const body = chatBodyRef.current;
    if (!body) return;
    const lastMessage = lastMessageRef.current;
    const showAnswerStart =
      messages.at(-1)?.sender === "bot" && !botLoading && lastMessage;
    body.scrollTo({
      top: showAnswerStart
        ? body.scrollTop +
          lastMessage.getBoundingClientRect().top -
          body.getBoundingClientRect().top -
          18
        : body.scrollHeight,
      behavior: "instant",
    });
  }, [isOpen, messages, botLoading]);

  const closeChat = () => {
    setIsOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  };
  const handleSendMessage = (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || botLoading) return;
    const time = () =>
      new Date().toLocaleTimeString(vi ? "vi-VN" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    setMessages((previous) => [
      ...previous,
      { sender: "user", text, time: time() },
    ]);
    setUserInput("");
    setBotLoading(true);
    responseTimer.current = setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "",
          response: getAssistantResponse(text, language),
          time: time(),
        },
      ]);
      setBotLoading(false);
      responseTimer.current = null;
      inputRef.current?.focus({ preventScroll: true });
    }, 800);
  };

  return (
    <div className={styles.assistant}>
      <div className={`${floating.anchor} ${styles.launcherWrap}`}>
        <span
          id="ai-assistant-tooltip"
          className={styles.tooltip}
          role="tooltip"
        >
          {tStr.tabChatbot}
        </span>
        <button
          ref={launcherRef}
          type="button"
          className={`${floating.button} ${styles.launcher}`}
          onClick={() => (isOpen ? closeChat() : setIsOpen(true))}
          aria-label={tStr.tabChatbot}
          aria-describedby="ai-assistant-tooltip"
          aria-expanded={isOpen}
          aria-controls="ai-assistant-chat"
        >
          <Image src={ASSISTANT_MARK} width={32} height={44} alt="" />
        </button>
      </div>
      {isOpen && (
        <section
          id="ai-assistant-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-assistant-title"
          className={styles.chat}
        >
          <header className={styles.header}>
            <span className={styles.headerLogo}>
              <Image src={ASSISTANT_MARK} width={22} height={32} alt="" />
            </span>
            <div className={styles.heading}>
              <h2 id="ai-assistant-title">{tStr.tabChatbot}</h2>
              <p>{tStr.tabChatbotDesc}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={closeChat}
              aria-label={vi ? "Thu nhỏ Trợ lý AI" : "Minimize AI Assistant"}
            >
              <X size={18} />
            </button>
          </header>
          <div
            ref={chatBodyRef}
            className={styles.messages}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label={vi ? "Tin nhắn trò chuyện" : "Chat messages"}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? lastMessageRef : undefined}
                className={styles.message}
                data-sender={message.sender}
              >
                <span className={styles.avatar} aria-hidden="true">
                  {message.sender === "bot" ? (
                    <Image src={ASSISTANT_MARK} width={17} height={24} alt="" />
                  ) : (
                    <UserCheck size={16} />
                  )}
                </span>
                <div className={styles.messageContent}>
                  <div className={styles.bubble}>
                    {message.response ? (
                      <div className={styles.answer}>
                        <h3>{message.response.title}</h3>
                        {message.response.intro && (
                          <p>{message.response.intro}</p>
                        )}
                        {message.response.steps && (
                          <ol>
                            {message.response.steps.map((step) => (
                              <li key={step.title}>
                                <strong>{step.title}</strong>
                                <p>{step.text}</p>
                              </li>
                            ))}
                          </ol>
                        )}
                        {message.response.sample && (
                          <div className={styles.sample}>
                            <span>
                              {vi ? "Bản nháp tham khảo" : "Sample draft"}
                            </span>
                            <blockquote>{message.response.sample}</blockquote>
                          </div>
                        )}
                        {message.response.note && (
                          <p className={styles.answerNote}>
                            {message.response.note}
                          </p>
                        )}
                        {message.response.links && (
                          <div className={styles.answerLinks}>
                            {message.response.links.map((link) => (
                              <Link key={link.href} href={link.href}>
                                {link.label}
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  <time className={styles.time}>{message.time}</time>
                </div>
              </div>
            ))}
            {botLoading && (
              <div className={styles.typing} role="status">
                <span />
                <span />
                <span />
                <span className={styles.srOnly}>{tStr.botTyping}</span>
              </div>
            )}
          </div>
          <div className={styles.suggestions}>
            <span className={styles.suggestionLabel}>
              {tStr.quickPromptHeading}
            </span>
            <div className={styles.promptList}>
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  disabled={botLoading}
                  onClick={() => handleSendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <form
            className={styles.composer}
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage(userInput);
            }}
          >
            <input
              ref={inputRef}
              value={userInput}
              disabled={botLoading}
              onChange={(event) => setUserInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.nativeEvent.isComposing)
                  event.preventDefault();
              }}
              placeholder={tStr.chatbotInputPlaceholder}
              aria-label={tStr.chatbotInputPlaceholder}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={botLoading || !userInput.trim()}
              aria-label={tStr.chatbotSendBtn}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
