import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../../common/cache/cache.service";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { PostsService } from "./posts.service";

describe("post editorial fields and publication dates", () => {
  const now = new Date("2026-11-17T05:00:00.000Z");
  const oldDate = new Date("2026-10-01T03:00:00.123Z");
  const existing = {
    id: "post-1",
    slug: "old-slug",
    status: "PUBLISHED",
    publishedAt: oldDate,
  };
  const prisma = {
    post: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
    user: { findMany: jest.fn() },
  };
  const cache = { del: jest.fn().mockResolvedValue(undefined) };
  const service = new PostsService(
    prisma as unknown as PrismaService,
    cache as unknown as CacheService,
  );
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    jest.clearAllMocks();
    prisma.post.findUnique.mockResolvedValue(existing);
    prisma.post.create.mockImplementation(async ({ data }) => ({
      id: "post-1",
      ...data,
    }));
    prisma.post.update.mockImplementation(async ({ data }) => ({
      ...existing,
      ...data,
    }));
  });
  afterEach(() => jest.useRealTimers());
  it("creates with explicit Vietnam publication time, creation date, author and tags", async () => {
    await service.create({
      title: "Bài viết",
      status: "PUBLISHED",
      createdAt: "2026-10-20T08:30:00+07:00",
      publishedAt: "2026-10-21T09:45:00+07:00",
      authorId: "editor-2",
      tagIds: ["tag-1"],
      categoryId: "category-1",
    });
    const data = prisma.post.create.mock.calls[0][0].data;
    expect(data.createdAt.toISOString()).toBe("2026-10-20T01:30:00.000Z");
    expect(data.publishedAt.toISOString()).toBe("2026-10-21T02:45:00.000Z");
    expect(data.author).toEqual({ connect: { id: "editor-2" } });
    expect(data.tags).toEqual({ connect: [{ id: "tag-1" }] });
    expect(data).not.toHaveProperty("authorId");
  });
  it("defaults first publication to now and leaves an undated draft unpublished", async () => {
    await service.create({ title: "A", status: "PUBLISHED" });
    expect(prisma.post.create.mock.calls[0][0].data.publishedAt).toEqual(now);
    await service.create({ title: "B", status: "DRAFT", publishedAt: null });
    expect(prisma.post.create.mock.calls[1][0].data.publishedAt).toBeNull();
  });
  it("does not replace the explicitly chosen date on first publication", async () => {
    prisma.post.findUnique.mockResolvedValue({
      ...existing,
      status: "DRAFT",
      publishedAt: null,
    });
    await service.update("post-1", {
      status: "PUBLISHED",
      publishedAt: "2026-10-22T11:20:00+07:00",
    });
    expect(
      prisma.post.update.mock.calls[0][0].data.publishedAt.toISOString(),
    ).toBe("2026-10-22T04:20:00.000Z");
  });
  it("preserves existing dates and author when omitted in an update", async () => {
    await service.update("post-1", {
      title: "Đổi tiêu đề",
      status: "PUBLISHED",
    });
    const data = prisma.post.update.mock.calls[0][0].data;
    expect(data).not.toHaveProperty("publishedAt");
    expect(data).not.toHaveProperty("createdAt");
    expect(data).not.toHaveProperty("author");
  });
  it("allows clearing the draft publication date and defaults a cleared published date to now", async () => {
    await service.update("post-1", { status: "DRAFT", publishedAt: null });
    expect(prisma.post.update.mock.calls[0][0].data.publishedAt).toBeNull();
    await service.update("post-1", { status: "PUBLISHED", publishedAt: null });
    expect(prisma.post.update.mock.calls[1][0].data.publishedAt).toEqual(now);
  });
  it("updates all relationships, clears tags and invalidates both URLs on rename", async () => {
    await service.update("post-1", {
      slug: "new-slug",
      authorId: "editor-2",
      categoryId: "category-2",
      tagIds: [],
      createdAt: "2026-10-23T03:00:00Z",
    });
    const data = prisma.post.update.mock.calls[0][0].data;
    expect(data.tags).toEqual({ set: [] });
    expect(data.author).toEqual({ connect: { id: "editor-2" } });
    expect(data.category).toEqual({ connect: { id: "category-2" } });
    expect(data.createdAt.toISOString()).toBe("2026-10-23T03:00:00.000Z");
    expect(cache.del).toHaveBeenCalledWith(
      CacheService.keys.postBySlug("old-slug"),
    );
    expect(cache.del).toHaveBeenCalledWith(
      CacheService.keys.postBySlug("new-slug"),
    );
  });
  it("validates dates and statuses, and keeps updatedAt system-managed", async () => {
    expect(
      await validate(
        plainToInstance(CreatePostDto, {
          title: "A",
          status: "PENDING",
          publishedAt: "2026-11-17T09:00:00+07:00",
        }),
      ),
    ).toHaveLength(0);
    const errors = await validate(
      plainToInstance(UpdatePostDto, {
        createdAt: "invalid",
        publishedAt: "2026-02-30T09:00:00Z",
        status: "INVALID",
        tagIds: [123],
        updatedAt: "2026-11-01T00:00:00Z",
      }),
      { whitelist: true, forbidNonWhitelisted: true },
    );
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining([
        "createdAt",
        "publishedAt",
        "status",
        "tagIds",
        "updatedAt",
      ]),
    );
  });
  it("only returns author IDs and public names for the editor options", async () => {
    await service.findAuthors();
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, fullName: true } }),
    );
  });
});
