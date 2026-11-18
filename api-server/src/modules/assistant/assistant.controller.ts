import { Body, Controller, Header, Post } from "@nestjs/common";
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches,
} from "class-validator";
import { AssistantService } from "./assistant.service";

export class AssistantQuestionDto {
  @IsString() @Length(1, 1500) @Matches(/\S/) question!: string;
  @IsOptional() @IsIn(["vi", "en"]) language?: string;
  @IsOptional() @IsString() @MaxLength(1500) previousQuestion?: string;
}

@Controller("assistant")
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}
  @Post("ask")
  @Header("Cache-Control", "no-store")
  ask(@Body() body: AssistantQuestionDto) {
    return this.assistant.answer(
      body.question.trim(),
      body.language || "vi",
      body.previousQuestion,
    );
  }
}
