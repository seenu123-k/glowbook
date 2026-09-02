import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStaffDto {
  // =====================================================
  // STAFF USER
  // =====================================================

  @IsOptional()
  @IsUUID()
  userId?: string;

  // =====================================================
  // STAFF DETAILS
  // =====================================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  specialization?: string;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;
}