import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { PostStatus } from "@prisma/client";

export class CreatePostDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsDateString({ strict: true })
  createdAt?: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() excerpt?: string;
  @IsString() @IsOptional() thumbnail?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsEnum(PostStatus) @IsOptional() status?: PostStatus;
  @IsArray() @IsString({ each: true }) @IsOptional() tagIds?: string[];
  @IsString() @IsNotEmpty() @IsOptional() authorId?: string;
  @IsDateString({ strict: true }) @IsOptional() publishedAt?: string | null;
}

export class UpdatePostDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() excerpt?: string;
  @IsString() @IsOptional() thumbnail?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsEnum(PostStatus) @IsOptional() status?: PostStatus;
  @IsArray() @IsString({ each: true }) @IsOptional() tagIds?: string[];
  @IsString() @IsNotEmpty() @IsOptional() authorId?: string;
  @IsDateString({ strict: true }) @IsOptional() publishedAt?: string | null;
  @ValidateIf((_object, value) => value !== undefined)
  @IsDateString({ strict: true })
  createdAt?: string;
}

export class PostDateUpdateDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsDateString()
  createdAt!: string;
}

export class BulkUpdatePostDatesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => PostDateUpdateDto)
  updates!: PostDateUpdateDto[];
}
