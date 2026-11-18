import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Prisma } from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { organizationSlug, withOrganizationSlug } from "./organization-slug";
import { OrganizationDetailsDto } from "./organization-details.dto";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  private async validateDetails(value: unknown) {
    if (value === undefined) return undefined;
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new BadRequestException("Invalid club details");
    const details = plainToInstance(OrganizationDetailsDto, value);
    const errors = await validate(details, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length)
      throw new BadRequestException(
        "Thông tin chi tiết CLB không hợp lệ. Kiểm tra tên và số điện thoại người phụ trách.",
      );
    return JSON.parse(JSON.stringify(details));
  }

  async findAll(filters: {
    sport?: string;
    location?: string;
    search?: string;
    region?: string;
  }) {
    // Search runs as raw SQL so we can strip Vietnamese diacritics with `unaccent`
    // and match the term anywhere in the text (ILIKE '%term%').
    const conditions: Prisma.Sql[] = [Prisma.sql`o."isApproved" = true`];

    const contains = (column: string, raw: string | undefined) => {
      const term = raw?.trim();
      if (!term) return;
      conditions.push(
        Prisma.sql`unaccent(lower(coalesce(o.${Prisma.raw(`"${column}"`)}, ''))) LIKE unaccent(lower(${`%${term}%`}))`,
      );
    };

    contains("sport", filters.sport);
    contains("location", filters.location);
    if (filters.region) {
      if (!["Miền Bắc", "Miền Trung", "Miền Nam"].includes(filters.region))
        throw new BadRequestException("Khu vực không hợp lệ");
      conditions.push(Prisma.sql`(
        CASE
          WHEN o."details"->>'region' IN ('Miền Bắc', 'Miền Trung', 'Miền Nam') THEN o."details"->>'region'
          WHEN unaccent(lower(coalesce(o."location", ''))) LIKE '%mien trung%' THEN 'Miền Trung'
          WHEN unaccent(lower(coalesce(o."location", ''))) LIKE '%mien nam%' THEN 'Miền Nam'
          ELSE 'Miền Bắc'
        END
      ) = ${filters.region}`);
    }

    const searchTerm = filters.search?.trim();
    if (searchTerm) {
      const columns = [
        "name",
        "location",
        "sport",
        "schedule",
        "suitableFor",
        "contactInfo",
        "description",
      ];
      const matches = columns.map(
        (column) =>
          Prisma.sql`unaccent(lower(coalesce(o.${Prisma.raw(`"${column}"`)}, ''))) LIKE unaccent(lower(${`%${searchTerm}%`}))`,
      );
      conditions.push(Prisma.sql`(${Prisma.join(matches, " OR ")})`);
    }

    const organizations = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT o.* FROM "Organization" o
      WHERE ${Prisma.join(conditions, " AND ")}
      ORDER BY o."createdAt" DESC
    `);

    return organizations.map(withOrganizationSlug);
  }
  async findBySlug(slug: string) {
    const id = slug.match(
      /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i,
    )?.[1];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug))
      throw new NotFoundException("Club not found");
    let organization;
    if (id) {
      organization = await this.prisma.organization.findFirst({
        where: { id, isApproved: true },
      });
    } else {
      const candidates = await this.prisma.organization.findMany({
        where: { isApproved: true },
      });
      const matches = candidates.filter(
        (club) => organizationSlug(club) === slug.toLowerCase(),
      );
      if (matches.length > 1)
        throw new ConflictException(
          "Tên câu lạc bộ bị trùng. Vui lòng cập nhật tên để phân biệt các câu lạc bộ.",
        );
      organization = matches[0];
    }
    if (!organization) throw new NotFoundException("Club not found");
    return withOrganizationSlug(organization);
  }

  async findOneAdmin(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!organization) throw new NotFoundException("Club not found");
    return withOrganizationSlug(organization);
  }

  async updateDetails(id: string, details: OrganizationDetailsDto) {
    await this.findOneAdmin(id);
    const organization = await this.prisma.organization.update({
      where: { id },
      data: { details: JSON.parse(JSON.stringify(details)) },
    });
    return withOrganizationSlug(organization);
  }

  async findBounded(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) {
    if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLng) || isNaN(maxLng)) {
      return [];
    }

    return this.prisma.organization.findMany({
      where: {
        isApproved: true,
        lat: {
          gte: minLat,
          lte: maxLat,
        },
        lng: {
          gte: minLng,
          lte: maxLng,
        },
      },
    });
  }

  async findPending() {
    return this.prisma.organization.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    name: string;
    location: string;
    sport: string;
    schedule: string;
    suitableFor: string;
    contactInfo: string;
    imageUrl?: string;
    description: string;
    details?: Prisma.InputJsonValue;
  }) {
    const details = await this.validateDetails(data.details);
    return this.prisma.organization.create({
      data: {
        ...data,
        ...(details === undefined ? {} : { details }),
        isApproved: false, // Yêu cầu admin phê duyệt
      },
    });
  }

  async createAdmin(data: {
    name: string;
    location: string;
    sport: string;
    schedule: string;
    suitableFor: string;
    contactInfo: string;
    imageUrl?: string;
    description: string;
    details?: Prisma.InputJsonValue;
  }) {
    const details = await this.validateDetails(data.details);
    return this.prisma.organization.create({
      data: {
        ...data,
        ...(details === undefined ? {} : { details }),
        isApproved: true,
      },
    });
  }
  async approve(id: string) {
    return this.prisma.organization.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async findAllAdmin() {
    const organizations = await this.prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
    });
    return organizations.map(withOrganizationSlug);
  }

  async update(id: string, data: any) {
    if (data.details !== undefined)
      data = { ...data, details: await this.validateDetails(data.details) };
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
