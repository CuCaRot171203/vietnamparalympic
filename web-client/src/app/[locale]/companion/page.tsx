"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Gift,
  Handshake,
  Heart,
  Loader2,
  Megaphone,
  Send,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLanguage } from "@/hooks/useTranslation";
import styles from "./companion.module.css";

const partnershipTypes = [
  {
    value: "Tài trợ tài chính",
    vi: "Tài trợ tài chính",
    en: "Financial sponsorship",
  },
  {
    value: "Tài trợ hiện vật",
    vi: "Tài trợ hiện vật",
    en: "In-kind sponsorship",
  },
  {
    value: "Hỗ trợ truyền thông",
    vi: "Hỗ trợ truyền thông",
    en: "Media support",
  },
  {
    value: "Hỗ trợ chuyên môn",
    vi: "Hỗ trợ chuyên môn",
    en: "Professional support",
  },
  { value: "Hỗ trợ địa điểm", vi: "Hỗ trợ địa điểm", en: "Venue support" },
  {
    value: "Hỗ trợ học liệu / công cụ",
    vi: "Hỗ trợ học liệu / công cụ",
    en: "Learning materials / tools",
  },
  {
    value: "Đồng hành cùng Creator Lab",
    vi: "Đồng hành cùng Creator Lab",
    en: "Partner with Creator Lab",
  },
  {
    value: "Đăng ký làm CTV (Cộng tác viên)",
    vi: "Đăng ký làm CTV (Cộng tác viên)",
    en: "Become a collaborator",
  },
];
const initialForm = {
  fullName: "",
  unit: "",
  phone: "",
  email: "",
  type: partnershipTypes[0].value,
  message: "",
};
export default function CompanionPage() {
  const { language } = useLanguage();
  const vi = language === "vi";
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const feedback = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  useEffect(() => {
    if (status !== "idle") feedback.current?.focus();
  }, [status]);
  const change = (key: keyof typeof form, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const payload = {
      fullName: form.fullName.trim(),
      unit: form.unit.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      type: form.type,
      message: form.message.trim(),
    };
    if (!payload.fullName || !payload.message) {
      setErrorMessage(
        vi
          ? "Vui lòng nhập họ tên và nội dung đề xuất, không chỉ để khoảng trắng."
          : "Please enter your name and proposal, not only spaces.",
      );
      setStatus("error");
      return;
    }
    submitting.current = true;
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");
    try {
      const response = await apiClient.request("/companion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(
          vi
            ? "Chưa thể gửi đề xuất. Vui lòng thử lại sau ít phút."
            : "Your proposal could not be sent. Please try again in a moment.",
        );
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : vi
            ? "Không thể kết nối máy chủ. Vui lòng thử lại."
            : "Unable to connect. Please try again.",
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };
  const ways = [
    {
      icon: Heart,
      type: "Tài trợ tài chính",
      title: vi ? "Góp nguồn lực" : "Fund opportunities",
      description: vi
        ? "Hỗ trợ phát triển giải đấu, hoạt động cộng đồng và học liệu."
        : "Support tournaments, community activities and learning resources.",
    },
    {
      icon: Gift,
      type: "Tài trợ hiện vật",
      title: vi ? "Trao công cụ" : "Equip the journey",
      description: vi
        ? "Đồng hành bằng dụng cụ thể thao, xe lăn tập luyện và thiết bị trợ năng."
        : "Contribute sports equipment, training wheelchairs and assistive tools.",
    },
    {
      icon: Handshake,
      type: "Hỗ trợ chuyên môn",
      title: vi ? "Chia sẻ chuyên môn" : "Share your expertise",
      description: vi
        ? "Góp sức bằng huấn luyện, dinh dưỡng và các kỹ năng chuyên môn."
        : "Offer coaching, nutrition guidance and professional skills.",
    },
    {
      icon: Megaphone,
      type: "Hỗ trợ truyền thông",
      title: vi ? "Lan tỏa câu chuyện" : "Amplify their voices",
      description: vi
        ? "Hỗ trợ truyền thông, sáng tạo nội dung và kết nối cộng đồng."
        : "Help with storytelling, content creation and community connections.",
    },
  ];
  const benefits = vi
    ? [
        "Vinh danh logo trên trang chủ và chuyên trang đồng hành.",
        "Ưu tiên đồng hành truyền thông trong các dự án Creator Lab.",
        "Nhận báo cáo tác động xã hội định kỳ từ Ban quản trị.",
      ]
    : [
        "Recognition on the homepage and partnership pages.",
        "Priority media collaboration in Creator Lab projects.",
        "Periodic social impact reports from the administration.",
      ];
  const required = (
    <span className={styles.required} aria-hidden="true">
      *
    </span>
  );
  const field = (
    key: "fullName" | "unit" | "phone" | "email",
    label: string,
    placeholder: string,
    type = "text",
    isRequired = false,
    autoComplete?: string,
  ) => (
    <div className={styles.field}>
      <label htmlFor={`companion-${key}`}>
        {label}
        {isRequired && required}
      </label>
      <input
        id={`companion-${key}`}
        name={key}
        type={type}
        autoComplete={autoComplete}
        required={isRequired}
        value={form[key]}
        onChange={(event) => change(key, event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={vi ? "Điều hướng trang" : "Breadcrumb"}
        >
          <Link href={`/${language}`}>{vi ? "Trang chủ" : "Home"}</Link>
          <span>/</span>
          <span aria-current="page">
            {vi ? "Đồng hành" : "Partner with us"}
          </span>
        </nav>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span />
              Vietnam ParaSports · Together
            </p>
            <h1>
              {vi ? (
                <>
                  Cùng mở rộng
                  <br />
                  <span>những cơ hội.</span>
                </>
              ) : (
                <>
                  Together, we create
                  <br />
                  <span>more possibilities.</span>
                </>
              )}
            </h1>
            <p className={styles.heroDescription}>
              {vi
                ? "Mỗi sự đồng hành đều có thể mở ra một cơ hội tập luyện, một sân chơi và một câu chuyện được lắng nghe. Cùng tiếp sức cho cộng đồng thể thao người khuyết tật Việt Nam."
                : "Every partnership can open a door to training, competition and stories worth hearing. Join us in supporting Vietnam’s para sports community."}
            </p>
            <a href="#partnership-form" className={styles.primary}>
              {vi ? "Gửi đề xuất đồng hành" : "Start a partnership"}
              <ArrowUpRight size={18} />
            </a>
            <p className={styles.heroNote}>
              {vi
                ? "Dành cho cá nhân, tổ chức và doanh nghiệp."
                : "For individuals, organizations and businesses."}
            </p>
          </div>
          <figure className={styles.heroVisual}>
            <div className={styles.heroImage}>
              <Image
                src="/assets/homepage/creator-lab-summit.jpg"
                alt={
                  vi
                    ? "Các đại biểu và đối tác tại sự kiện Vietnam ParaSports Creator Lab Summit"
                    : "Delegates and partners at Vietnam ParaSports Creator Lab Summit"
                }
                fill
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
                className={styles.photo}
              />
              <span className={styles.photoTag}>
                <Handshake size={14} />
                {vi ? "Kết nối để cùng tiến xa" : "Connect. Support. Grow."}
              </span>
            </div>
            <figcaption>
              {vi
                ? "Cùng tạo nên những kết nối có ý nghĩa cho cộng đồng."
                : "Building meaningful connections for the community."}
            </figcaption>
          </figure>
        </header>
        <section className={styles.ways} aria-labelledby="ways-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                {vi ? "Đồng hành theo cách của bạn" : "Make your contribution"}
              </p>
              <h2 id="ways-heading">
                {vi
                  ? "Mỗi đóng góp, một giá trị."
                  : "Every contribution matters."}
              </h2>
            </div>
            <p>
              {vi
                ? "Bắt đầu từ nguồn lực và thế mạnh bạn có."
                : "Start with the resources and strengths you have."}
            </p>
          </div>
          <div className={styles.waysGrid}>
            {ways.map((way, index) => (
              <a
                href="#partnership-form"
                key={way.type}
                className={styles.way}
                onClick={() => change("type", way.type)}
              >
                <div className={styles.wayTop}>
                  <way.icon size={25} strokeWidth={1.4} />
                  <span>0{index + 1}</span>
                </div>
                <h3>{way.title}</h3>
                <p>{way.description}</p>
                <span className={styles.wayAction}>
                  {vi ? "Chọn hình thức này" : "Explore this option"}
                  <ArrowUpRight size={15} />
                </span>
              </a>
            ))}
          </div>
        </section>
        <section
          className={styles.registration}
          id="partnership-form"
          aria-labelledby="partnership-heading"
        >
          <aside className={styles.aside}>
            <p className={styles.eyebrow}>
              {vi ? "Kết nối để tạo tác động" : "Create impact together"}
            </p>
            <h2 id="partnership-heading">
              {vi
                ? "Một lời ngỏ.\nMột hành trình mới."
                : "One conversation.\nA new journey."}
            </h2>
            <p className={styles.asideDescription}>
              {vi
                ? "Chia sẻ ý tưởng hoặc nguồn lực bạn muốn đóng góp. Ban quản trị sẽ kết nối để cùng trao đổi phương án đồng hành phù hợp."
                : "Tell us about your ideas or what you would like to contribute. Our team will get in touch to explore a suitable partnership."}
            </p>
            <div className={styles.benefits}>
              <h3>{vi ? "Giá trị khi đồng hành" : "Partnership benefits"}</h3>
              <ul>
                {benefits.map((benefit) => (
                  <li key={benefit}>
                    <Check size={16} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.process}>
              <h3>{vi ? "Chúng ta bắt đầu thế nào?" : "How does it work?"}</h3>
              {(vi
                ? [
                    "Gửi thông tin & ý tưởng",
                    "Kết nối và trao đổi",
                    "Thống nhất hoạt động đồng hành",
                  ]
                : [
                    "Share your ideas",
                    "Connect and discuss",
                    "Agree on a partnership plan",
                  ]
              ).map((step, index) => (
                <div key={step}>
                  <span>0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </aside>
          <div className={styles.formPanel}>
            {status === "success" ? (
              <div
                ref={feedback}
                tabIndex={-1}
                role="status"
                className={styles.success}
              >
                <span className={styles.successIcon}>
                  <CheckCircle2 size={34} strokeWidth={1.4} />
                </span>
                <p className={styles.eyebrow}>
                  {vi ? "Đã tiếp nhận đề xuất" : "Proposal received"}
                </p>
                <h3>
                  {vi
                    ? "Cảm ơn bạn đã sẵn lòng đồng hành."
                    : "Thank you for joining the journey."}
                </h3>
                <p>
                  {vi
                    ? "Thông tin đã được gửi tới Ban quản trị Vietnam ParaSports. Chúng tôi sẽ liên hệ để trao đổi thêm về đề xuất của bạn."
                    : "Your proposal has been sent to Vietnam ParaSports. Our team will contact you to discuss it further."}
                </p>
                <button
                  className={styles.secondary}
                  onClick={() => setStatus("idle")}
                >
                  {vi ? "Gửi đề xuất khác" : "Send another proposal"}
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className={styles.formHeading}>
                  <span className={styles.formIcon}>
                    <Send size={20} strokeWidth={1.4} />
                  </span>
                  <div>
                    <h3>{vi ? "Đề xuất đồng hành" : "Partnership proposal"}</h3>
                    <p>
                      {vi
                        ? "Những thông tin đầu tiên để chúng ta kết nối."
                        : "A few details to help us connect."}
                    </p>
                  </div>
                </div>
                {status === "error" && (
                  <div
                    ref={feedback}
                    tabIndex={-1}
                    role="alert"
                    className={styles.error}
                  >
                    <CircleAlert size={18} />
                    <div>
                      <strong>
                        {vi ? "Chưa gửi được đề xuất" : "Proposal not sent"}
                      </strong>
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} aria-busy={loading}>
                  <fieldset disabled={loading} className={styles.fieldset}>
                    <legend>
                      <span>01</span>
                      {vi ? "Thông tin liên hệ" : "Contact details"}
                    </legend>
                    <div className={styles.fieldGrid}>
                      {field(
                        "fullName",
                        vi ? "Họ và tên" : "Full name",
                        vi ? "Tên của bạn" : "Your full name",
                        "text",
                        true,
                        "name",
                      )}
                      {field(
                        "unit",
                        vi ? "Đơn vị / Tổ chức" : "Organization",
                        vi
                          ? "Công ty, câu lạc bộ hoặc tổ chức"
                          : "Company, club or organization",
                        "text",
                        false,
                        "organization",
                      )}
                      {field(
                        "email",
                        vi ? "Email" : "Email",
                        "name@example.com",
                        "email",
                        true,
                        "email",
                      )}
                      {field(
                        "phone",
                        vi ? "Số điện thoại" : "Phone number",
                        vi ? "Số điện thoại liên hệ" : "Contact phone number",
                        "tel",
                        false,
                        "tel",
                      )}
                    </div>
                  </fieldset>
                  <fieldset disabled={loading} className={styles.fieldset}>
                    <legend>
                      <span>02</span>
                      {vi ? "Ý tưởng đồng hành" : "Your partnership idea"}
                    </legend>
                    <div className={styles.field}>
                      <label htmlFor="companion-type">
                        {vi ? "Hình thức đồng hành" : "Partnership type"}
                        {required}
                      </label>
                      <select
                        id="companion-type"
                        name="type"
                        required
                        value={form.type}
                        onChange={(event) => change("type", event.target.value)}
                      >
                        {partnershipTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {vi ? type.vi : type.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="companion-message">
                        {vi ? "Nội dung đề xuất" : "Your proposal"}
                        {required}
                      </label>
                      <textarea
                        id="companion-message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(event) =>
                          change("message", event.target.value)
                        }
                        placeholder={
                          vi
                            ? "Bạn muốn đồng hành như thế nào? Hãy chia sẻ ý tưởng, nguồn lực hoặc kế hoạch của bạn…"
                            : "How would you like to contribute? Share your ideas, resources or plans…"
                        }
                      />
                    </div>
                  </fieldset>
                  <div className={styles.formFooter}>
                    <p>
                      {vi
                        ? "Thông tin được sử dụng để liên hệ và trao đổi về đề xuất của bạn."
                        : "We use these details to contact you about your proposal."}
                    </p>
                    <button
                      type="submit"
                      className={styles.submit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className={styles.spinner} />
                          {vi ? "Đang gửi đề xuất…" : "Sending proposal…"}
                        </>
                      ) : (
                        <>
                          {vi
                            ? "Gửi đề xuất đồng hành"
                            : "Send partnership proposal"}
                          <ArrowUpRight size={18} />
                        </>
                      )}
                    </button>
                    <span className={styles.requiredNote}>
                      {required}{" "}
                      {vi ? "Thông tin bắt buộc" : "Required information"}
                    </span>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
        <div className={styles.closing}>
          <Sparkles size={19} strokeWidth={1.4} />
          <p>
            {vi
              ? "Vietnam ParaSports trân trọng từng sự đồng hành trên hành trình xây dựng một cộng đồng thể thao rộng mở."
              : "Vietnam ParaSports values every partnership on the journey towards a more inclusive sporting community."}
          </p>
        </div>
      </div>
    </main>
  );
}
