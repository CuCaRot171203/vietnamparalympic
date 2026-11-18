import { ConflictException, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../../prisma/prisma.service";
import { OrganizationDetailsDto } from "./organization-details.dto";
import { organizationSlug } from "./organization-slug";
import { OrganizationsService } from "./organizations.service";

describe("club detail pages", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const organization = { id, name: "CLB Bóng đá Đà Nẵng", isApproved: true };
  const prisma = {
    $queryRaw: jest.fn().mockResolvedValue([]),
    organization: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new OrganizationsService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it("uses an accent-free public slug without a UUID", () => {
    const slug = organizationSlug(organization);
    expect(slug).toBe("clb-bong-da-da-nang");
    expect(organizationSlug({ ...organization, id: "another-id" })).toBe(slug);
  });

  it("resolves old links after renaming and queries approved records only", async () => {
    prisma.organization.findFirst.mockResolvedValue({
      ...organization,
      name: "Tên mới",
    });
    const result = await service.findBySlug(`old-name-${id}`);
    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: { id, isApproved: true },
    });
    expect(result.name).toBe("Tên mới");
  });

  it("returns 404 for pending, deleted and malformed club links", async () => {
    prisma.organization.findFirst.mockResolvedValue(null);
    await expect(service.findBySlug(`pending-${id}`)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    prisma.organization.findFirst.mockClear();
    await expect(service.findBySlug("invalid")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
  });

  it("resolves name-only URLs and never silently selects a duplicate", async () => {
    prisma.organization.findMany.mockResolvedValue([organization]);
    expect((await service.findBySlug("clb-bong-da-da-nang")).id).toBe(id);
    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      where: { isApproved: true },
    });
    prisma.organization.findMany.mockResolvedValue([
      organization,
      { ...organization, id: "other" },
    ]);
    await expect(
      service.findBySlug("clb-bong-da-da-nang"),
    ).rejects.toBeInstanceOf(ConflictException);
    prisma.organization.findMany.mockResolvedValue([]);
  });

  it("saves only the detail document and preserves basic information and approval", async () => {
    prisma.organization.findUnique.mockResolvedValue(organization);
    prisma.organization.update.mockResolvedValue({
      ...organization,
      details: { tagline: "Cùng tập luyện" },
    });
    await service.updateDetails(id, { tagline: "Cùng tập luyện" });
    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id },
      data: { details: { tagline: "Cùng tập luyện" } },
    });
  });

  it("rejects executable links and excessive galleries", async () => {
    const details = plainToInstance(OrganizationDetailsDto, {
      website: "javascript:alert(1)",
      coverImage: "//evil.example/image",
      gallery: Array(13).fill("https://example.com/image.jpg"),
    });
    const errors = await validate(details);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(["website", "coverImage", "gallery"]),
    );
  });

  it("accepts empty optional contacts and local uploaded images", async () => {
    const details = plainToInstance(OrganizationDetailsDto, {
      email: "",
      website: "",
      phone: "",
      coverImage: "/uploads/public/club.jpg",
      facilities: ["Lối đi xe lăn"],
    });
    expect(await validate(details)).toHaveLength(0);
  });

  it("validates the region and filters stored regions with a legacy-location fallback", async () => {
    const details = plainToInstance(OrganizationDetailsDto, {
      region: "Miền Trung",
    });
    expect(await validate(details)).toHaveLength(0);
    expect(
      (
        await validate(
          plainToInstance(OrganizationDetailsDto, { region: "Unknown" }),
        )
      ).length,
    ).toBeGreaterThan(0);
    await service.findAll({ region: "Miền Trung" });
    const query = prisma.$queryRaw.mock.calls[0][0];
    expect(query.sql).toContain('o."details"->>');
    expect(query.sql).toContain("CASE");
    expect(query.values).toContain("Miền Trung");
    await expect(service.findAll({ region: "Unknown" })).rejects.toThrow();
  });

  it("accepts several coordinators and rejects malformed nested contact data", async () => {
    const details = plainToInstance(OrganizationDetailsDto, {
      contacts: [
        { name: "HLV A", role: "Chủ nhiệm", phone: "0383 509 728" },
        { name: "HLV B", role: "HLV", phone: "+84 979 660 079" },
      ],
      content: "<ul><li>Nội dung cũ</li></ul>",
    });
    expect(await validate(details)).toHaveLength(0);
    const invalid = plainToInstance(OrganizationDetailsDto, {
      contacts: [{ name: "", phone: "javascript:alert(1)" }],
    });
    expect(
      (await validate(invalid)).some((error) => error.property === "contacts"),
    ).toBe(true);
  });

  it("preserves other detail content on a basic edit with several coordinators", async () => {
    const details = {
      content: '<ol start="3"><li>Giới thiệu</li></ol>',
      contacts: [
        { name: "HLV A", phone: "0901234567" },
        { name: "HLV B", phone: "0907654321" },
      ],
    };
    await service.update(id, { name: "Tên mới", details });
    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id },
      data: { name: "Tên mới", details },
    });
    prisma.organization.update.mockClear();
    await expect(
      service.update(id, {
        details: { contacts: [{ name: "", phone: "bad" }] },
      }),
    ).rejects.toThrow();
    expect(prisma.organization.update).not.toHaveBeenCalled();
  });
});
