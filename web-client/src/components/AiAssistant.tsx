"use client";

import { useState, useRef, useEffect } from "react";
import { Send, UserCheck, X } from "lucide-react";
import Image from "next/image";
import styles from "./ai-assistant.module.css";
import floating from "./floating-controls.module.css";
import { useLanguage } from "@/hooks/useTranslation";
import { useSession } from "next-auth/react";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

const translations: Record<string, Record<string, string>> = {
  vi: {
    tabChatbot: "Trợ lý AI",
    tabChatbotDesc: "Gợi ý kịch bản & caption",
    quickPromptHeading: "Bắt đầu với gợi ý",
    chatbotInputPlaceholder: "Nhập câu hỏi của bạn tại đây...",
    chatbotSendBtn: "Gửi tin nhắn",
    botGreeting:
      'Xin chào! Tôi là Trợ lý AI của Creator Lab. Tôi có thể giúp bạn lên ý tưởng, viết kịch bản video, biên soạn caption và kiểm tra xem nội dung của bạn có bị mắc lỗi "thương hại hóa" hay không. Hãy chọn câu hỏi gợi ý bên dưới hoặc nhắn trực tiếp cho tôi nhé!',
    botGreetingTime: "Vừa xong",
    botResponseTime: "Vừa xong",
    botTyping: "Trợ lý AI đang soạn câu trả lời...",
    loadingResponse: "Đang gửi...",
  },
  en: {
    tabChatbot: "AI Assistant",
    tabChatbotDesc: "Script & caption suggestions",
    quickPromptHeading: "Start with a suggestion",
    chatbotInputPlaceholder: "Type your question here...",
    chatbotSendBtn: "Send Message",
    botGreeting:
      'Hello! I am your Creator Lab AI Assistant. I can help you brainstorm video ideas, write scripts, draft captions, and review whether your content contains any "pity-oriented" tone. Select a prompt below or chat with me directly!',
    botGreetingTime: "Just now",
    botResponseTime: "Just now",
    botTyping: "AI Assistant is typing...",
    loadingResponse: "Sending...",
  },
};

function getPersonalizedGreeting(
  session: any,
  language: string,
  defaultGreeting: string,
): string {
  const isVi = language === "vi";
  if (!session?.user) return defaultGreeting;
  const name = session.user.name || (isVi ? "bạn" : "there");
  const role = (session.user as any).role;

  if (role === "ATHLETE") {
    return isVi
      ? `Xin chào Vận động viên ${name}! Chúc bạn một ngày tập luyện và thi đấu tràn đầy năng lượng. Tôi là Trợ lý AI của Creator Lab, sẵn sàng đồng hành cùng bạn để chia sẻ những thành tích, kịch bản tập luyện, câu chuyện thể thao chân thực và truyền cảm hứng nhất của mình mà không bị mắc lỗi "thương hại hóa". Hãy chọn câu hỏi gợi ý bên dưới hoặc nhắn trực tiếp cho tôi nhé!`
      : `Hello Athlete ${name}! Wishing you a high-energy day of training and competition. I am your Creator Lab AI Assistant, ready to help you share your achievements, training scripts, and authentic, inspiring sports stories without pity-oriented tones. Select a prompt below or chat with me directly!`;
  }
  if (role === "COACH") {
    return isVi
      ? `Xin chào Huấn luyện viên ${name}! Cảm ơn thầy/cô đã luôn sát cánh cùng các vận động viên. Tôi là Trợ lý AI của Creator Lab, sẵn sàng hỗ trợ thầy/cô viết giáo án truyền thông, chia sẻ kinh nghiệm huấn luyện chuyên nghiệp và xây dựng hình ảnh tích cực cho đội tuyển. Hãy chọn câu hỏi gợi ý bên dưới hoặc nhắn trực tiếp cho tôi nhé!`
      : `Hello Coach ${name}! Thank you for always guiding our athletes. I am your Creator Lab AI Assistant, here to help you write media plans, share professional coaching insights, and build a positive image for the team. Select a prompt below or chat with me directly!`;
  }
  if (role === "ASSISTANT") {
    return isVi
      ? `Xin chào Người hỗ trợ ${name}! Vai trò đồng hành của bạn vô cùng quan trọng đối với các vận động viên. Tôi là Trợ lý AI của Creator Lab, sẵn sàng giúp bạn biên soạn caption đồng hành, lên ý tưởng kịch bản hậu trường ý nghĩa và tôn trọng. Hãy chọn câu hỏi gợi ý bên dưới hoặc nhắn trực tiếp cho tôi nhé!`
      : `Hello Supporter ${name}! Your companion role is crucial to our athletes. I am your Creator Lab AI Assistant, ready to help you write companion captions and brainstorm meaningful, respectful behind-the-scenes video ideas. Select a prompt below or chat with me directly!`;
  }
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return isVi
      ? `Xin chào Quản trị viên ${name}! Tôi là Trợ lý AI của Creator Lab. Tôi có thể giúp bạn soạn thông báo, viết bài hướng dẫn và kiểm duyệt nội dung theo tiêu chuẩn truyền thông không rào cản. Hãy chọn câu hỏi gợi ý bên dưới hoặc nhắn trực tiếp cho tôi nhé!`
      : `Hello Administrator ${name}! I am your Creator Lab AI Assistant. I can help you draft announcements, write guidelines, and moderate content based on barrier-free media standards. Select a prompt below or chat with me directly!`;
  }
  return isVi
    ? `Xin chào ${name}! Tôi là Trợ lý AI của Creator Lab. Tôi có thể giúp bạn tìm hiểu về thể thao khuyết tật, lên ý tưởng, viết kịch bản video và biên soạn caption theo tinh thần tôn trọng, tích cực. Hãy chọn câu hỏi gợi ý bên dưới hoặc nhắn trực tiếp cho tôi nhé!`
    : `Hello ${name}! I am your Creator Lab AI Assistant. I can help you learn about Paralympic sports, brainstorm ideas, write scripts, and draft captions in a respectful, positive spirit. Select a prompt below or chat with me directly!`;
}

function getBotResponse(
  input: string,
  language: string,
  role?: string,
): string {
  const text = input.toLowerCase();
  const isVi = language === "vi";

  const pityWords = isVi
    ? [
        "đáng thương",
        "vượt lên số phận",
        "tội nghiệp",
        "bất hạnh",
        "dù khuyết tật",
        "mặc cảm",
      ]
    : [
        "pity",
        "poor",
        "sad story",
        "disabled but",
        "misfortune",
        "pitying",
        "suffering",
      ];
  const foundPity = pityWords.filter((word) => text.includes(word));

  if (foundPity.length > 0) {
    return isVi
      ? `⚠️ **Cảnh báo từ Creator Lab:** Caption của bạn có chứa các từ ngữ mang chiều hướng thương hại hóa: **"${foundPity.join(", ")}"**.\n\n👉 **Gợi ý chỉnh sửa:**\nThay vì dùng các cụm từ bi kịch hóa, hãy tập trung vào năng lực thể thao và sự tự tin. Ví dụ:\n- Tránh: *"Dù khuyết tật nhưng tôi vẫn cố gắng"* \n- Hãy viết: *"Tôi tập trung hết mình vào giáo án tập luyện của huấn luyện viên để cải thiện thành tích cá nhân."*\n\nBạn có muốn tôi giúp viết lại một bản nháp tôn trọng hơn không?`
      : `⚠️ **Creator Lab Warning:** Your caption contains pity-oriented words or phrases: **"${foundPity.join(", ")}"**.\n\n👉 **Suggested Edit:**\nInstead of dramatic tragedy words, focus on athletic capabilities and confidence. For example:\n- Avoid: *"Although disabled, I still try my best"*\n- Instead, write: *"I focus entirely on my coach's training regimen to improve my personal performance."*\n\nWould you like me to help you rewrite a more respectful draft?`;
  }

  if (
    text.includes("giới thiệu") ||
    text.includes("bio") ||
    text.includes("intro") ||
    text.includes("self")
  ) {
    return isVi
      ? `📝 **Gợi ý viết Caption giới thiệu bản thân:**\n\n**Cấu trúc 3 phần chuyên nghiệp:**\n1. **Lời chào & Môn thi đấu:** *"Xin chào mọi người! Mình là [Tên], vận động viên môn [Tên môn] tại [CLB/Tỉnh thành]."* \n2. **Thành tích nổi bật hoặc Động lực:** *"Bộ môn này đã mang lại cho mình nhiều trải nghiệm quý giá. Mỗi buổi tập là một cơ hội vượt qua giới hạn của bản thân."* \n3. **Lời kêu gọi và Hashtag:** *"Cùng theo dõi và cổ vũ hành trình chinh phục các giải đấu sắp tới của mình nhé! 🇻🇳 #VĐVVietnam #TheThaoKhongRaoCan #AthleteLife"*`
      : `📝 **Self Introduction Caption:**\n\n**Professional 3-Part Structure:**\n1. **Greeting & Sport:** *"Hi everyone! I am [Name], competing in [Sport Name] representing [Club/Region]."* \n2. **Achievements/Motivation:** *"This sport has given me valuable experiences. Every training session is an opportunity to push past my limits."* \n3. **Call to Action & Hashtags:** *"Follow and support my journey towards upcoming tournaments! 🇻🇳 #VietnamAthlete #SportsWithoutBarriers #AthleteLife"`;
  }

  if (
    text.includes("video") ||
    text.includes("hành trình") ||
    text.includes("journey")
  ) {
    return isVi
      ? `🎬 **Kịch bản Video ngắn (30-45s) - Một ngày tập luyện:**\n\n- **[0s - 10s] (Mở đầu cuốn hút):** Cảnh quay cận cảnh bạn khởi động, chuẩn bị dụng cụ.\n- **[10s - 30s] (Nội dung chính):** Cảnh tập các bài kỹ thuật, nỗ lực thực hiện động tác khó.\n- **[30s - 45s] (Kết thúc):** Bạn cười tươi vẫy tay chào.\n\n*Lời thoại:* "Cảm ơn các bạn đã theo dõi! Hãy bấm theo dõi để đồng hành cùng hành trình của mình nhé!"`
      : `🎬 **Short Video Script (30-45s) - Training Day:**\n\n- **[0s - 10s] (Hook):** Close-up shot of you preparing equipment.\n- **[10s - 30s] (Body):** Footage of technical exercises with focus.\n- **[30s - 45s] (Outro):** Smiling, waving at the camera.\n\n*Voiceover:* "Thanks for watching! Click follow to support my journey!"`;
  }

  if (
    text.includes("ý tưởng") ||
    text.includes("ideas") ||
    text.includes("idea")
  ) {
    return isVi
      ? `💡 **5 Ý tưởng nội dung đầy cảm hứng:**\n\n1. **Giới thiệu trang bị thi đấu:** Quay/viết về dụng cụ thể thao của bạn.\n2. **Phân tích một kỹ thuật:** Hướng dẫn cách thực hiện một động tác khó.\n3. **Trước và sau buổi tập:** So sánh trạng thái trước và sau khi hoàn thành giáo án.\n4. **Trực tiếp trả lời Q&A:** Giải đáp câu hỏi thú vị của khán giả.\n5. **Khoảnh khắc tự hào:** Chia sẻ lại một tấm ảnh nhận huy chương hoặc vượt qua kỷ lục cá nhân.`
      : `💡 **5 Inspiring Content Ideas:**\n\n1. **Introduce your gear:** Showcase your sports equipment.\n2. **Deconstruct a technique:** Show how you perform a specific technique.\n3. **Before & After workout:** Compare your state before and after training.\n4. **Q&A Session:** Answer popular questions from viewers.\n5. **Proud Milestone:** Share a photo of winning a medal or beating a personal record.`;
  }

  if (text.includes("tuần") || text.includes("week")) {
    return isVi
      ? `📅 **Lịch biên tập mẫu cho tuần này (3 bài đăng):**\n\n- **Thứ 2 (Bài viết dạng ảnh):** Chia sẻ ảnh chân dung tập luyện kèm lời nhắn khởi động tuần mới.\n- **Thứ 4 (Video ngắn):** Video ghi lại 1 động tác kỹ thuật bạn đang tối ưu hóa.\n- **Thứ 7 (Bài viết tự sự):** Chia sẻ lý do bạn yêu thích môn thể thao này.`
      : `📅 **Sample Content Calendar for This Week (3 Posts):**\n\n- **Monday (Image post):** Share a training portrait with a message to start the week.\n- **Wednesday (Short video):** A video showing 1 specific technical movement.\n- **Saturday (Written reflection):** Share why you love this sport.`;
  }

  if (text.includes("kiểm tra") || text.includes("check")) {
    return isVi
      ? `🔍 **Trình kiểm tra nội dung:** Bạn hãy gửi đoạn Caption bạn dự định đăng vào đây. Tôi sẽ rà soát kỹ lưỡng các từ ngữ để đảm bảo tinh thần tôn trọng, tích cực và không có yếu tố thương hại hóa.`
      : `🔍 **Content checker:** Please paste your planned caption here. I will carefully scan the words to ensure a respectful, positive spirit with no pity-based elements.`;
  }

  return isVi
    ? `🤖 **Trợ lý AI:** Cảm ơn bạn đã chia sẻ! Để hỗ trợ tốt nhất cho bạn về xây dựng kênh truyền thông hoặc viết kịch bản thể thao, bạn có thể mô tả chi tiết hơn về bộ môn bạn đang tập luyện và ý định truyền tải thông điệp được không? Tôi luôn sẵn sàng hỗ trợ bạn theo tinh thần "Thể thao không rào cản"!`
    : `🤖 **AI Assistant:** Thank you for sharing! To best help you build a media channel or write a sports script, could you describe in more detail the sport you are training and the message you want to convey? I am always ready to support you in the spirit of "Sports Without Barriers"!`;
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
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionName = session?.user?.name;
  const sessionEmail = session?.user?.email;
  const sessionRole = (session?.user as any)?.role;

  const quickPrompts = vi
    ? [
        "Tôi muốn viết caption giới thiệu bản thân.",
        "Tôi muốn làm video đầu tiên về hành trình thể thao của mình.",
        "Hãy gợi ý cho tôi 5 ý tưởng bài đăng.",
        "Kiểm tra giúp tôi caption này có phù hợp không.",
        "Tôi nên đăng nội dung gì trong tuần này?",
      ]
    : [
        "I want to write a self-introduction caption.",
        "I want to make my first video about my sports journey.",
        "Suggest 5 content ideas for my page.",
        "Help check if this caption is appropriate.",
        "What should I post this week?",
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
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: "instant" });
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
          text: getBotResponse(text, language, sessionRole),
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
                  <div className={styles.bubble}>{message.text}</div>
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
