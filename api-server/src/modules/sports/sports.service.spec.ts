import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../../prisma/prisma.service";
import { SportsController } from "./sports.controller";
import { SportsService } from "./sports.service";
import { CreateSportDto } from "./dto/sport.dto";

describe("sport article and media updates", () => {
  const base = {
    nameVi: "Điền kinh",
    slug: "dien-kinh",
    descVi: "Mô tả",
    detailDescVi: "<h2>Giới thiệu</h2><p>Nội dung dài</p>",
  };
  const prisma = {
    sport: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
  };
  const service = new SportsService(prisma as unknown as PrismaService);
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.sport.findUnique.mockResolvedValue({
      id: "sport-1",
      icon: "/uploads/public/existing.png",
    });
  });
  it("creates a Vietnamese-only article and preserves rich text and uploaded media URLs", async () => {
    await service.create({
      ...base,
      icon: "/uploads/public/icon.webp",
      thumbnail: "/uploads/public/cover.webp",
    });
    expect(prisma.sport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        icon: "/uploads/public/icon.webp",
        thumbnail: "/uploads/public/cover.webp",
        detailDescVi: base.detailDescVi,
        nameEn: "",
        descEn: "",
        detailDescEn: "",
      }),
    });
  });
  it("updates text without clearing an omitted icon or thumbnail", async () => {
    await service.update("sport-1", { detailDescVi: "<h2>Mới</h2>" });
    const data = prisma.sport.update.mock.calls[0][0].data;
    expect(data.icon).toBeUndefined();
    expect(data.thumbnail).toBeUndefined();
    expect(data.detailDescVi).toBe("<h2>Mới</h2>");
  });
  it("supports replacing and clearing the thumbnail without changing old content", async () => {
    await service.update("sport-1", { thumbnail: "/uploads/public/new.webp" });
    expect(prisma.sport.update.mock.calls[0][0].data.thumbnail).toBe(
      "/uploads/public/new.webp",
    );
    await service.update("sport-1", { thumbnail: "" });
    expect(prisma.sport.update.mock.calls[1][0].data.thumbnail).toBe("");
    expect(
      prisma.sport.update.mock.calls[1][0].data.detailDescVi,
    ).toBeUndefined();
  });
  it("accepts the old banner alias without writing a non-existent Prisma field", async () => {
    await service.create({ ...base, bannerUrl: "/uploads/public/banner.webp" });
    const data = prisma.sport.create.mock.calls[0][0].data;
    expect(data.thumbnail).toBe("/uploads/public/banner.webp");
    expect(data).not.toHaveProperty("bannerUrl");
  });
  it("does not overwrite an icon URL with an empty value when no multipart file is sent", () => {
    const mockedService = { create: jest.fn(), update: jest.fn() };
    const controller = new SportsController(
      mockedService as unknown as SportsService,
    );
    controller.create(undefined as unknown as Express.Multer.File, {
      ...base,
      icon: "/uploads/public/icon.webp",
    });
    expect(mockedService.create).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "/uploads/public/icon.webp" }),
    );
    controller.update("sport-1", undefined as unknown as Express.Multer.File, {
      icon: "/uploads/public/replaced.webp",
    });
    expect(mockedService.update).toHaveBeenCalledWith("sport-1", {
      icon: "/uploads/public/replaced.webp",
    });
  });
  it("accepts thumbnail and optional English fields while keeping Vietnamese name required", async () => {
    expect(
      await validate(
        plainToInstance(CreateSportDto, {
          ...base,
          thumbnail: "/uploads/public/cover.webp",
        }),
        { whitelist: true, forbidNonWhitelisted: true },
      ),
    ).toHaveLength(0);
    expect(
      (
        await validate(plainToInstance(CreateSportDto, { ...base, nameVi: "" }))
      ).some((error) => error.property === "nameVi"),
    ).toBe(true);
  });
});
