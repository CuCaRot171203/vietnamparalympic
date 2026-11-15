import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from "class-validator";

// Public media can be an uploaded relative path or an HTTP(S) URL.
const mediaPath = /^(?:$|\/(?!\/)[^\s]*|https?:\/\/[^\s]+)$/;

export class OrganizationDetailsDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  tagline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(mediaPath)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  joiningInstructions?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:|1\d{3}|20\d{2})$/)
  foundedYear?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  facilities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  @Matches(mediaPath, { each: true })
  gallery?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(/^(?:$|https?:\/\/[^\s]+)$/)
  website?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== "")
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[+\d\s().-]*$/)
  phone?: string;
}
