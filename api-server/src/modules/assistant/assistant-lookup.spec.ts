import {
  answerFromKnowledge,
  type AssistantKnowledge,
} from "./assistant-lookup";
import { AssistantService } from "./assistant.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AssistantQuestionDto } from "./assistant.controller";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

const sport = (id: string, nameVi: string, slug: string) => ({
  id,
  nameVi,
  slug,
  nameEn: nameVi,
  descVi: `Tìm hiểu ${nameVi}`,
  descEn: "",
  detailDescVi: `<p>Nội dung ${nameVi} do admin cập nhật.</p>`,
  detailDescEn: "",
});
const knowledge: AssistantKnowledge = {
  sports: [
    sport("athletics", "Điền kinh", "dien-kinh"),
    sport("boccia", "Boccia", "boccia"),
  ],
  classifications: [
    {
      id: "c1",
      sportId: "athletics",
      code: "T11",
      description: "Khuyết tật thị giác",
      medicalDesc: "Thông tin chuyên môn từ admin",
      disabilityCriteria: "Khuyết tật thị giác",
      requiresAssistant: true,
    },
    {
      id: "c2",
      sportId: "boccia",
      code: "BC1",
      description: "Bại não, vận động bằng xe lăn",
      medicalDesc: null,
      disabilityCriteria: "Bại não",
      requiresAssistant: true,
    },
  ],
  clubs: [
    {
      id: "club1",
      name: "CLB Điền kinh Hà Nội",
      sport: "Điền kinh",
      location: "Hà Nội (Miền Bắc)",
      schedule: "Thứ 3 lúc 17:00",
      contactInfo: "HLV Mẫu 0901234567",
      description: "Dữ liệu mới",
      suitableFor: "Người tập điền kinh",
      details: {},
    },
    {
      id: "club2",
      name: "CLB Boccia Đà Nẵng",
      sport: "Boccia, Điền kinh",
      location: "Đà Nẵng (Miền Trung)",
      schedule: "Thứ 7 lúc 08:00",
      contactInfo: "0907654321",
      description: "Sân tập",
      suitableFor: "Liên hệ HLV",
      details: {
        joiningInstructions: "Đăng ký tại quầy",
        contacts: [
          { name: "Người thứ hai", role: "Chủ nhiệm", phone: "0911111111" },
        ],
      },
    },
  ],
  events: [
    {
      id: "e1",
      title: "Ngày hội Boccia Đà Nẵng",
      description: "Tập luyện cộng đồng",
      location: "Đà Nẵng",
      startDate: new Date("2026-11-20T01:00:00Z"),
      endDate: null,
      status: "UPCOMING",
    },
    {
      id: "e2",
      title: "Lịch cũ vẫn ghi upcoming",
      description: "",
      location: "Hà Nội",
      startDate: new Date("2025-01-01Z"),
      endDate: null,
      status: "UPCOMING",
    },
    {
      id: "e3",
      title: "Đã hủy",
      description: "",
      location: "Hà Nội",
      startDate: new Date("2027-01-01Z"),
      endDate: null,
      status: "CANCELLED",
    },
  ],
  tournaments: [
    {
      id: "t1",
      name: "Giải Boccia mở rộng",
      location: "Đà Nẵng",
      startDate: new Date("2026-12-01T03:00Z"),
      endDate: null,
      status: "UPCOMING",
    },
  ],
  posts: [
    {
      title: "Bản tin sự kiện",
      slug: "ban-tin-su-kien",
      excerpt: "Tin đã đăng",
      content: "Hoạt động tại Hà Nội",
      publishedAt: new Date("2026-11-15Z"),
      createdAt: new Date("2026-11-15Z"),
    },
  ],
};
const now = new Date("2026-11-18T05:00:00Z");
const answer = (text: string, previous = "") =>
  answerFromKnowledge(text, "vi", knowledge, previous, now);

describe("assistant live knowledge lookup", () => {
  it("suggests sports from published class descriptions without assigning eligibility", () => {
    const result = answer("Tôi khiếm thị, có thể tìm hiểu môn nào?");
    expect(result.steps?.map((s) => s.title)).toEqual(["Điền kinh"]);
    expect(result.steps?.[0].text).toContain("T11");
    expect(result.note).toContain("không phải chẩn đoán");
    expect(result.links?.[0].href).toBe("/vi/sports/dien-kinh");
  });
  it("recognizes sport recommendations even when the question mentions thương tật", () => {
    expect(
      answer("Gợi ý môn thể thao phù hợp theo thương tật khiếm thị").steps?.[0]
        .title,
    ).toBe("Điền kinh");
  });
  it("finds a multi-sport club by accent-free city and sport", () => {
    const result = answer("Tim CLB Boccia o Da Nang");
    expect(result.steps).toHaveLength(1);
    expect(result.steps?.[0].text).toContain("Thứ 7 lúc 08:00");
    expect(result.steps?.[0].text).toContain("0911111111");
    expect(result.steps?.[0].text).not.toContain('"joiningInstructions"');
    expect(result.links?.[0].href).toBe("/vi/clubs/detail/clb-boccia-da-nang");
  });
  it("asks for a location rather than showing unrelated clubs", () => {
    expect(answer("Tìm câu lạc bộ").title).toContain("ở đâu");
    expect(answer("Tìm CLB ở Paris").steps).toHaveLength(0);
  });
  it("keeps the club intent for a location follow-up and replaces the old location", () => {
    const result = answer("Còn ở Đà Nẵng?", "Tìm CLB Điền kinh ở Hà Nội");
    expect(result.steps?.map((s) => s.title)).toEqual(["CLB Boccia Đà Nẵng"]);
  });
  it("returns the exact class code and its sport with sourced descriptions", () => {
    const result = answer("Hạng T11 là gì?");
    expect(result.steps).toHaveLength(1);
    expect(result.steps?.[0].title).toBe("T11 · Điền kinh");
    expect(result.steps?.[0].text).toContain("Thông tin chuyên môn từ admin");
    expect(
      answer("Tôi bại não, muốn tìm hiểu hạng thương tật").steps?.[0].title,
    ).toBe("BC1 · Boccia");
  });
  it("does not invent a classification when there is no matching description", () => {
    expect(answer("Hạng XYZ999 là gì?").steps).toHaveLength(0);
    expect(answer("Hạng XYZ999 là gì?").intro).toContain("Chưa có mô tả");
  });
  it("does not turn a negated condition into a classification suggestion", () => {
    expect(
      answer("Tôi không có khuyết tật thị giác, hạng nào?").steps,
    ).toHaveLength(0);
  });
  it("sorts actual upcoming events, excludes expired dates and cancelled events", () => {
    const result = answer("Có sự kiện thể thao nào sắp diễn ra?");
    expect(result.steps?.map((s) => s.title)).toEqual([
      "Ngày hội Boccia Đà Nẵng",
      "Giải Boccia mở rộng",
    ]);
    expect(result.steps?.[0].text).toContain("08:00");
    expect(result.links?.[1].href).toBe("/vi/tournaments/t1");
  });
  it("labels news fallback as news, never as confirmed upcoming events", () => {
    const result = answerFromKnowledge(
      "Sự kiện nào sắp diễn ra?",
      "vi",
      { ...knowledge, events: [], tournaments: [] },
      "",
      now,
    );
    expect(result.intro).toContain("không phải xác nhận lịch sắp diễn ra");
    expect(result.links?.[0].href).toBe("/vi/news/ban-tin-su-kien");
  });
  it("reads changed admin content on the next lookup", () => {
    const updated = {
      ...knowledge,
      sports: knowledge.sports.map((s) => ({
        ...s,
        detailDescVi: "Thông tin mới vừa cập nhật",
      })),
    };
    expect(
      answerFromKnowledge("Điền kinh là gì?", "vi", updated).steps?.[0].text,
    ).toContain("Thông tin mới vừa cập nhật");
  });
  it("validates bounded questions and optional follow-up context", async () => {
    expect(
      await validate(
        plainToInstance(AssistantQuestionDto, {
          question: "CLB ở Hà Nội",
          language: "vi",
        }),
      ),
    ).toHaveLength(0);
    expect(
      (
        await validate(
          plainToInstance(AssistantQuestionDto, {
            question: " ",
            previousQuestion: "a".repeat(1501),
          }),
        )
      ).length,
    ).toBeGreaterThan(0);
  });
  it("only reads approved clubs, published events and published event posts", async () => {
    const mock = Object.fromEntries(
      [
        "sport",
        "sportClassification",
        "organization",
        "event",
        "tournament",
        "post",
      ].map((key) => [key, { findMany: jest.fn().mockResolvedValue([]) }]),
    );
    await new AssistantService(mock as unknown as PrismaService).answer(
      "Tìm CLB ở Hà Nội",
      "vi",
    );
    expect(mock.organization.findMany.mock.calls[0][0].where).toEqual({
      isApproved: true,
    });
    expect(mock.event.findMany.mock.calls[0][0].where).toEqual({
      isPublished: true,
    });
    expect(mock.post.findMany.mock.calls[0][0].where.status).toBe("PUBLISHED");
  });
});
