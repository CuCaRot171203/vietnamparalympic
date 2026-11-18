import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { answerFromKnowledge } from "./assistant-lookup";

@Injectable()
export class AssistantService {
  constructor(private readonly prisma: PrismaService) {}

  async answer(question: string, language: string, previousQuestion?: string) {
    // Read current public records; no chat history or personal condition is persisted.
    const [sports, classifications, clubs, events, tournaments, posts] =
      await Promise.all([
        this.prisma.sport.findMany({
          select: {
            id: true,
            slug: true,
            nameVi: true,
            nameEn: true,
            descVi: true,
            descEn: true,
            detailDescVi: true,
            detailDescEn: true,
          },
        }),
        this.prisma.sportClassification.findMany({
          select: {
            id: true,
            sportId: true,
            code: true,
            description: true,
            medicalDesc: true,
            disabilityCriteria: true,
            requiresAssistant: true,
          },
        }),
        this.prisma.organization.findMany({
          where: { isApproved: true },
          select: {
            id: true,
            name: true,
            sport: true,
            location: true,
            schedule: true,
            suitableFor: true,
            contactInfo: true,
            description: true,
            details: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
        this.prisma.event.findMany({
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        }),
        this.prisma.tournament.findMany({
          select: {
            id: true,
            name: true,
            location: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        }),
        this.prisma.post.findMany({
          where: {
            status: "PUBLISHED",
            category: {
              OR: [
                { slug: { in: ["su-kien", "events", "event"] } },
                { name: { contains: "kiện", mode: "insensitive" } },
              ],
            },
          },
          select: {
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            publishedAt: true,
            createdAt: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
      ]);
    return answerFromKnowledge(
      question,
      language,
      { sports, classifications, clubs, events, tournaments, posts },
      previousQuestion,
    );
  }
}
