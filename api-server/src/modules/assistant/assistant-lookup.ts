import { organizationSlug } from "../organizations/organization-slug";

export type AssistantAnswer = {
  title: string;
  intro?: string;
  steps?: { title: string; text: string }[];
  note?: string;
  links?: { label: string; href: string }[];
  source?: string;
};
type Sport = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  detailDescVi: string;
  detailDescEn: string;
};
type Classification = {
  id: string;
  sportId: string;
  code: string;
  description: string | null;
  medicalDesc: string | null;
  disabilityCriteria: string | null;
  requiresAssistant: boolean;
};
type Club = {
  id: string;
  name: string;
  sport: string | null;
  location: string | null;
  schedule: string | null;
  suitableFor: string | null;
  contactInfo: string | null;
  description: string | null;
  details: unknown;
};
type Event = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  status: string;
};
type Tournament = {
  id: string;
  name: string;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
};
type Post = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
};
export type AssistantKnowledge = {
  sports: Sport[];
  classifications: Classification[];
  clubs: Club[];
  events: Event[];
  tournaments: Tournament[];
  posts: Post[];
};

export const plain = (value: unknown) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
export const normalize = (value: unknown) =>
  plain(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
const contains = (text: string, term: string) =>
  !!normalize(term) &&
  ` ${text.replace(/[^a-z0-9]+/g, " ")} `.includes(
    ` ${normalize(term).replace(/[^a-z0-9]+/g, " ")} `,
  );
const groups = [
  [
    "khuyet tat thi giac",
    "khiem thi",
    "thi luc",
    "nhin kem",
    "khong nhin thay",
    "mu mat",
    "visual impairment",
    "blind",
    "low vision",
  ],
  [
    "khuyet tat thinh giac",
    "khiem thinh",
    "khong nghe",
    "hearing impairment",
    "deaf",
  ],
  [
    "khuyet tat tri tue",
    "tri tue",
    "intellectual impairment",
    "intellectual disability",
  ],
  ["bai nao", "cerebral palsy", "tang truong luc", "co cung", "hypertonia"],
  ["that dieu", "mat dieu hoa", "ataxia"],
  ["mua von", "athetosis"],
  [
    "khuyet chi",
    "thieu chi",
    "cut chi",
    "cat cut",
    "mat mot chan",
    "mat mot tay",
    "amputee",
    "limb deficiency",
  ],
  [
    "chan thuong tuy song",
    "ton thuong tuy",
    "liet hai chan",
    "paraplegia",
    "spinal cord",
  ],
  ["tam voc thap", "nguoi lun", "short stature"],
  ["yeu co", "suy giam suc manh co", "impaired muscle power"],
  ["han che tam van dong", "han che van dong khop", "impaired passive range"],
  ["xe lan", "wheelchair"],
];
const negatedTerm = (text: string, term: string) =>
  ["khong", "khong bi", "khong co", "khong phai", "not", "no"].some((prefix) =>
    contains(text, prefix + " " + term),
  );
const activeGroups = (text: string) =>
  groups.filter(
    (group) =>
      group.some((term) => contains(text, term)) &&
      !group.some((term) => negatedTerm(text, term)),
  );
const generic = new Set(
  "toi minh em ban la va thi cua cho ve cac nhung nguoi the thao mon bo khuyet tat thuong hang phan goi y phu hop tap luyen thong tin tim hieu co nao gi mot duoc voi dang muon xin hay at in the a for to and sport sports club clubs classification disability information please".split(
    " ",
  ),
);
const tokens = (text: string) => [
  ...new Set(
    text.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !generic.has(t)),
  ),
];
const excerpt = (value: unknown, query: string, length = 440) => {
  const text = plain(value);
  const term = tokens(query).find((t) => normalize(text).includes(t));
  const pos = term ? normalize(text).indexOf(term) : 0;
  const start = pos > length ? Math.max(0, text.lastIndexOf(" ", pos - 70)) : 0;
  return `${start ? "…" : ""}${text.slice(start, start + length)}${start + length < text.length ? "…" : ""}`;
};
const score = (query: string, text: unknown) => {
  const normalized = normalize(text);
  return tokens(query).filter((t) => contains(normalized, t)).length;
};
const detailText = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const details = value as Record<string, unknown>;
  return ["content", "joiningInstructions", "phone", "email", "tagline"]
    .map((key) => plain(details[key]))
    .concat(
      Array.isArray(details.contacts)
        ? details.contacts.flatMap((person) =>
            person && typeof person === "object"
              ? Object.values(person).map(plain)
              : [],
          )
        : [],
    )
    .join(" · ");
};
const aliases = (text: string) =>
  text
    .replace(
      /\btphcm\b|\btp hcm\b|\bhcm\b|\bsai gon\b|\bsaigon\b/g,
      "ho chi minh",
    )
    .replace(/\bhanoi\b|\bhn\b/g, "ha noi")
    .replace(/\bdanang\b/g, "da nang");
const locationName = (value: string) =>
  aliases(normalize(value))
    .split(/[,(]/)[0]
    .replace(/^(?:tp\.?|thanh pho|tinh)\s+/, "")
    .trim();
type Intent = "clubs" | "events" | "classes" | "sports";
const intentOf = (text: string): Intent | undefined => {
  if (/\b(clb|cau lac bo|noi tap|club|clubs|dia diem tap)\b/.test(text))
    return "clubs";
  if (
    /\b(su kien|tin tuc|giai dau|lich thi dau|event|events|tournament|thi dau sap|sap dien ra)\b/.test(
      text,
    )
  )
    return "events";
  if (
    /\b(mon nao|mon gi|bo mon nao|choi gi|choi mon|which sports|sport suggestions|goi y mon|mon the thao phu hop)\b/.test(
      text,
    )
  )
    return "sports";
  if (
    /\b(hang|phan hang|thuong tat|classification|classifications|tinh trang|thuoc nhom)\b/.test(
      text,
    ) ||
    /\b(?:t|f|s|sb|sm|bc|tt)\d{1,3}\b/.test(text)
  )
    return "classes";
  if (/\b(bo mon|mon nao|mon gi|sport|sports|choi gi|choi mon)\b/.test(text))
    return "sports";
};

/** Retrieval over published project data only; no model, diagnosis or fabricated records. */
export function answerFromKnowledge(
  question: string,
  language: string,
  knowledge: AssistantKnowledge,
  previousQuestion = "",
  now = new Date(),
): AssistantAnswer {
  const vi = language !== "en";
  const q = aliases(normalize(question));
  const previous = aliases(normalize(previousQuestion));
  const inferred = intentOf(q);
  const intent =
    inferred ||
    intentOf(previous) ||
    (activeGroups(q).length ||
    /\b(toi bi|tinh trang|han che van dong)\b/.test(q)
      ? "classes"
      : "sports");
  const query = inferred ? q : `${q} ${previous}`;
  const prefix = vi ? "/vi" : "/en";
  const link = (path: string, label: string) => ({
    href: prefix + path,
    label,
  });
  const source = vi
    ? "Nguồn: dữ liệu đang công bố trên Vietnam ParaSports."
    : "Source: currently published Vietnam ParaSports data.";
  const classNote = vi
    ? "Đây là các mô tả có từ khóa tương đồng trong dữ liệu web, không phải chẩn đoán, kết luận hạng hay xác nhận đủ điều kiện tập luyện/thi đấu. Hạng thi đấu phải được hội đồng phân hạng xác nhận theo từng môn."
    : "These are related descriptions from the website, not a diagnosis, a classification decision or confirmation of training/competition eligibility. Qualified classifiers must confirm sport-specific eligibility.";
  const namedSports = (text: string) =>
    knowledge.sports.filter(
      (s) =>
        contains(text, s.nameVi) ||
        contains(text, s.nameEn) ||
        contains(text, s.slug.replace(/-/g, " ")),
    );
  const currentSports = namedSports(q);
  const selectedSports = currentSports.length
    ? currentSports
    : !inferred
      ? namedSports(previous)
      : [];
  const selectedIds = new Set(selectedSports.map((s) => s.id));
  const sportName = (s: Sport) => (vi ? s.nameVi : s.nameEn || s.nameVi);
  const date = (value: Date) =>
    new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(value);
  const knownLocations = [
    ...new Set(
      [...knowledge.clubs, ...knowledge.events, ...knowledge.tournaments]
        .map((x) => locationName(x.location || ""))
        .filter(Boolean),
    ),
  ].sort((a, b) => b.length - a.length);
  const findLocation = (text: string) =>
    knownLocations.find((loc) => contains(text, loc)) ||
    text
      .match(
        /\b(?:o|tai|near|in)\s+(.+?)(?=\s+(?:co|cho|minh|toi|va|de|nao|khong|with)\b|[?.!]|$)/,
      )?.[1]
      ?.trim();
  const location =
    findLocation(q) || (!inferred ? findLocation(previous) : undefined);
  const locationMatches = (value: string | null) =>
    !location || contains(locationName(value || ""), location);
  const sportMatches = (value: string) =>
    !selectedSports.length ||
    selectedSports.some(
      (s) =>
        contains(normalize(value), s.nameVi) ||
        contains(normalize(value), s.nameEn),
    );

  if (intent === "clubs") {
    if (
      !location &&
      !selectedSports.length &&
      !knowledge.clubs.some((c) => contains(q, c.name))
    )
      return {
        title: vi
          ? "Bạn muốn tìm CLB ở đâu?"
          : "Where would you like to train?",
        intro: vi
          ? "Cho mình biết tỉnh/thành phố và bộ môn (nếu có), ví dụ: “Tìm CLB Boccia ở Đà Nẵng”. Mình sẽ tra địa điểm, lịch tập và liên hệ được công bố."
          : "Tell me your city/province and optionally a sport, for example: “Find a Boccia club in Da Nang”.",
        links: [link("/clubs", vi ? "Danh sách câu lạc bộ" : "Club directory")],
        source,
      };
    const named = knowledge.clubs.filter((c) => contains(q, c.name));
    const candidates = (
      named.length
        ? named
        : knowledge.clubs.filter(
            (c) => locationMatches(c.location) && sportMatches(c.sport || ""),
          )
    ).sort(
      (a, b) =>
        score(query, `${b.name} ${b.description}`) -
        score(query, `${a.name} ${a.description}`),
    );
    return {
      title: vi ? "Câu lạc bộ bạn có thể tìm hiểu" : "Clubs to explore",
      intro: candidates.length
        ? vi
          ? `Tìm thấy ${candidates.length} CLB${location ? ` tại khu vực ${location}` : ""}. Dưới đây là tối đa 4 kết quả; hãy liên hệ trước khi đến.`
          : `Found ${candidates.length} clubs. Up to four are shown; contact the club before visiting.`
        : vi
          ? "Chưa tìm thấy CLB khớp địa điểm/bộ môn trong dữ liệu đang công bố. Bạn có thể đổi khu vực hoặc cho biết tỉnh/thành rõ hơn."
          : "No published clubs match this location/sport. Try another area or specify your city/province.",
      steps: candidates.slice(0, 4).map((c) => ({
        title: c.name,
        text: [
          c.sport,
          c.location,
          c.schedule,
          c.suitableFor,
          c.contactInfo,
          excerpt(
            `${c.description || ""} ${detailText(c.details)}`,
            query,
            380,
          ),
        ]
          .filter(Boolean)
          .map(plain)
          .join(" · "),
      })),
      links: [
        ...candidates
          .slice(0, 4)
          .map((c) => link(`/clubs/detail/${organizationSlug(c)}`, c.name)),
        link("/clubs", vi ? "Xem tất cả CLB" : "All clubs"),
      ],
      source,
    };
  }

  if (intent === "events") {
    const past = /\b(da dien ra|truoc day|da ket thuc|past|completed)\b/.test(
      q,
    );
    const events = [
      ...knowledge.events.map((e) => ({
        title: e.title,
        description: e.description,
        location: e.location,
        start: e.startDate,
        end: e.endDate,
        status: e.status,
        href: `/news?q=${encodeURIComponent(e.title)}`,
        search: true,
      })),
      ...knowledge.tournaments.map((t) => ({
        title: t.name,
        description: "",
        location: t.location,
        start: t.startDate,
        end: t.endDate,
        status: t.status,
        href: `/tournaments/${t.id}`,
        search: false,
      })),
    ]
      .filter(
        (e) =>
          e.status !== "CANCELLED" &&
          e.start &&
          locationMatches(e.location) &&
          sportMatches(`${e.title} ${e.description}`) &&
          (past
            ? (e.end || e.start)!.getTime() < now.getTime()
            : e.status !== "COMPLETED" &&
              (e.end || e.start)!.getTime() >= now.getTime()),
      )
      .sort((a, b) =>
        past
          ? b.start!.getTime() - a.start!.getTime()
          : a.start!.getTime() - b.start!.getTime(),
      );
    const news = knowledge.posts
      .filter(
        (p) =>
          locationMatches(p.content) && sportMatches(`${p.title} ${p.content}`),
      )
      .sort(
        (a, b) =>
          (b.publishedAt || b.createdAt).getTime() -
          (a.publishedAt || a.createdAt).getTime(),
      )
      .slice(0, 3);
    return {
      title: vi
        ? past
          ? "Sự kiện đã diễn ra"
          : "Sự kiện và giải đấu sắp tới"
        : past
          ? "Past events"
          : "Upcoming events and tournaments",
      intro: events.length
        ? vi
          ? "Lịch được lấy từ thông tin sự kiện/giải đấu trên web. Thời gian hiển thị theo giờ Việt Nam (UTC+7)."
          : "Dates come from published events/tournaments and use Vietnam time (UTC+7)."
        : vi
          ? "Chưa có lịch sự kiện khớp yêu cầu với ngày giờ được xác nhận trong dữ liệu web. Các bài dưới đây là tin đã đăng, không phải xác nhận lịch sắp diễn ra."
          : "No matching dated events are currently published. The items below are published news, not confirmation of upcoming events.",
      steps: events.length
        ? events.slice(0, 4).map((e) => ({
            title: e.title,
            text: [
              date(e.start!),
              e.end ? `${vi ? "Đến" : "Until"} ${date(e.end)}` : "",
              e.location,
              excerpt(e.description, query, 300),
            ]
              .filter(Boolean)
              .join(" · "),
          }))
        : news.map((p) => ({
            title: p.title,
            text: excerpt(p.excerpt || p.content, query),
          })),
      links: events.length
        ? events
            .slice(0, 4)
            .map((e) =>
              link(
                e.href,
                e.search
                  ? `${vi ? "Tìm tin về" : "Find news about"} ${e.title}`
                  : e.title,
              ),
            )
        : news.map((p) => link(`/news/${p.slug}`, p.title)),
      source,
    };
  }

  const specificCode = knowledge.classifications.filter((c) =>
    contains(q, c.code),
  );
  const conditionQuery = activeGroups(q).length ? q : !inferred ? previous : q;
  const conditions = activeGroups(conditionQuery);
  const onlyNegatedCondition =
    !conditions.length &&
    groups.some((group) =>
      group.some((term) => negatedTerm(conditionQuery, term)),
    );
  const classText = (c: Classification) =>
    `${c.description || ""} ${c.medicalDesc || ""} ${c.disabilityCriteria || ""}`;
  const rankedClasses = knowledge.classifications
    .filter((c) => !selectedIds.size || selectedIds.has(c.sportId))
    .map((c) => ({
      c,
      score: specificCode.length
        ? specificCode.includes(c)
          ? 100
          : 0
        : conditions.length
          ? conditions.filter((group) =>
              group.some((term) => contains(normalize(classText(c)), term)),
            ).length * 10
          : onlyNegatedCondition
            ? 0
            : score(query, classText(c)),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.code.localeCompare(b.c.code))
    .map((x) => x.c);
  if (intent === "classes" || specificCode.length) {
    const matches = rankedClasses.slice(0, 5);
    return {
      title: vi ? "Hạng thương tật để tham khảo" : "Classifications to explore",
      intro: matches.length
        ? vi
          ? "Những mục dưới đây có nội dung liên quan tới từ khóa/mô tả bạn gửi. Cùng một mã hạng có thể mang ý nghĩa khác nhau giữa các môn."
          : "These published descriptions match your words. The meaning of a class code depends on the sport."
        : vi
          ? "Chưa có mô tả đủ khớp để gợi ý hạng. Bạn muốn tìm hiểu môn nào, và việc vận động/nhìn/nghe bị ảnh hưởng ra sao? Không cần gửi hồ sơ y tế hoặc thông tin định danh."
          : "No sufficiently related descriptions were found. Which sport interests you, and how is movement/vision/hearing affected? Do not send medical records or identity details.",
      steps: matches.map((c) => {
        const sport = knowledge.sports.find((s) => s.id === c.sportId);
        return {
          title: `${c.code} · ${sport ? sportName(sport) : ""}`,
          text: [
            plain(c.description),
            plain(c.medicalDesc),
            plain(c.disabilityCriteria),
            c.requiresAssistant
              ? vi
                ? "Dữ liệu ghi nhận cần người hỗ trợ."
                : "The record specifies an assistant."
              : "",
          ]
            .filter(Boolean)
            .join(" · "),
        };
      }),
      note: classNote,
      links: matches.map((c) => {
        const sport = knowledge.sports.find((s) => s.id === c.sportId);
        return link(
          "/sports?" +
            new URLSearchParams({
              tab: "classes",
              sportId: c.sportId,
              q: c.code,
            }).toString() +
            "#sports-directory",
          c.code + (sport ? " · " + sportName(sport) : ""),
        );
      }),
      source,
    };
  }
  const relatedSportIds = new Set(rankedClasses.map((c) => c.sportId));
  const sports = selectedSports.length
    ? selectedSports
    : conditions.length
      ? knowledge.sports.filter((s) => relatedSportIds.has(s.id))
      : knowledge.sports
          .map((s) => ({
            s,
            score: score(
              query,
              `${s.nameVi} ${s.nameEn} ${s.descVi} ${s.detailDescVi}`,
            ),
          }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((x) => x.s);
  return {
    title: vi
      ? "Khám phá bộ môn phù hợp với bạn"
      : "Explore sports for your journey",
    intro: sports.length
      ? vi
        ? "Các bộ môn dưới đây có thông tin liên quan trên web. Đây là điểm bắt đầu để tìm hiểu với HLV, không phải kết luận bạn đủ điều kiện thi đấu."
        : "These sports have related information on the website. Explore them with a coach; this does not determine competition eligibility."
      : vi
        ? "Bạn có thể mô tả nhu cầu vận động hoặc bộ môn quan tâm, ví dụ “Tôi khiếm thị, có thể tìm hiểu môn nào?”. Mình cũng có thể tìm CLB theo tỉnh/thành và tra lịch sự kiện đã công bố."
        : "Describe your interests or access needs, for example: “I have a visual impairment. Which sports can I explore?” I can also find clubs by location and published events.",
    steps: sports.slice(0, 4).map((s) => ({
      title: sportName(s),
      text: [
        excerpt(
          (vi ? s.detailDescVi : s.detailDescEn) ||
            (vi ? s.descVi : s.descEn) ||
            s.descVi,
          query,
          550,
        ),
        conditions.length
          ? `${vi ? "Mã hạng có mô tả liên quan" : "Related class descriptions"}: ${rankedClasses
              .filter((c) => c.sportId === s.id)
              .slice(0, 4)
              .map((c) => c.code)
              .join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    note: conditions.length ? classNote : undefined,
    links: sports.length
      ? sports.slice(0, 4).map((s) => link(`/sports/${s.slug}`, sportName(s)))
      : [
          link(
            "/sports",
            vi ? "Bộ môn & Thương tật" : "Sports & Classifications",
          ),
          link("/clubs", vi ? "Tìm câu lạc bộ" : "Find a club"),
          link("/news", vi ? "Tin tức & sự kiện" : "News & events"),
        ],
    source,
  };
}
