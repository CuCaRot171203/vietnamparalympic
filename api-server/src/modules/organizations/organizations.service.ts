import { Prisma } from "@prisma/client";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { withOrganizationSlug } from "./organization-slug";
import { OrganizationDetailsDto } from "./organization-details.dto";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { sport?: string; location?: string; search?: string }) {
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
      const matches = columns.map((column) =>
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
    const id = slug.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i)?.[1];
    if (!id) throw new NotFoundException("Club not found");
    const organization = await this.prisma.organization.findFirst({ where: { id, isApproved: true } });
    if (!organization) throw new NotFoundException("Club not found");
    return withOrganizationSlug(organization);
  }

  async findOneAdmin(id: string) {
    const organization = await this.prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new NotFoundException("Club not found");
    return withOrganizationSlug(organization);
  }

  async updateDetails(id: string, details: OrganizationDetailsDto) {
    await this.findOneAdmin(id);
    const organization = await this.prisma.organization.update({
      where: { id }, data: { details: JSON.parse(JSON.stringify(details)) },
    });
    return withOrganizationSlug(organization);
  }

  async findBounded(minLat: number, maxLat: number, minLng: number, maxLng: number) {
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
  }) {
    return this.prisma.organization.create({
      data: {
        ...data,
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
  }) {
    return this.prisma.organization.create({
      data: {
        ...data,
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
