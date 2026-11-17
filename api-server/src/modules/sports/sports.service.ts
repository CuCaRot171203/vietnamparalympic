import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSportDto, UpdateSportDto } from "./dto/sport.dto";

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.sport.findMany({ orderBy: { createdAt: "asc" } });
  }
  async findOne(id: string) {
    const sport = await this.prisma.sport.findUnique({ where: { id } });
    if (!sport) throw new NotFoundException("Sport not found");
    return sport;
  }
  async findBySlug(slug: string) {
    const sport = await this.prisma.sport.findUnique({ where: { slug } });
    if (!sport) throw new NotFoundException("Sport not found");
    return sport;
  }
  async create(data: CreateSportDto) {
    return this.prisma.sport.create({
      data: {
        nameVi: data.nameVi,
        nameEn: data.nameEn ?? "",
        slug: data.slug,
        icon: data.icon ?? "",
        thumbnail: data.thumbnail ?? data.bannerUrl ?? null,
        descVi: data.descVi ?? data.desc ?? "",
        descEn: data.descEn ?? "",
        detailDescVi: data.detailDescVi ?? "",
        detailDescEn: data.detailDescEn ?? "",
      },
    });
  }
  async update(id: string, data: UpdateSportDto) {
    await this.findOne(id);
    return this.prisma.sport.update({
      where: { id },
      data: {
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        slug: data.slug,
        icon: data.icon,
        thumbnail: data.thumbnail ?? data.bannerUrl,
        descVi: data.descVi ?? data.desc,
        descEn: data.descEn,
        detailDescVi: data.detailDescVi,
        detailDescEn: data.detailDescEn,
      },
    });
  }
  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.sport.delete({ where: { id } });
  }
}
