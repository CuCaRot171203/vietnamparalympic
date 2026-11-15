import { NotFoundException } from "@nestjs/common";
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
    organization: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  };
  const service = new OrganizationsService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it("uses an accent-free slug and disambiguates clubs with the same name", () => {
    const slug = organizationSlug(organization);
    expect(slug).toBe(`clb-bong-da-da-nang-${id}`);
    expect(organizationSlug({ ...organization, id: "another-id" })).not.toBe(slug);
  });

  it("resolves old links after renaming and queries approved records only", async () => {
    prisma.organization.findFirst.mockResolvedValue({ ...organization, name: "Tên mới" });
    const result = await service.findBySlug(organizationSlug(organization));
    expect(prisma.organization.findFirst).toHaveBeenCalledWith({ where: { id, isApproved: true } });
    expect(result.name).toBe("Tên mới");
  });

  it("returns 404 for pending, deleted and malformed club links", async () => {
    prisma.organization.findFirst.mockResolvedValue(null);
    await expect(service.findBySlug(`pending-${id}`)).rejects.toBeInstanceOf(NotFoundException);
    prisma.organization.findFirst.mockClear();
    await expect(service.findBySlug("invalid")).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
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
      expect.arrayContaining(["website", "coverImage", "gallery"])
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
});
