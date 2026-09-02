import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSalonDto {
  // =====================================================
  // OWNER
  // =====================================================

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;


  // =====================================================
  // SALON DETAILS
  // =====================================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;


  @IsOptional()
  @IsString()
  phone?: string;


  @IsOptional()
  @IsEmail()
  email?: string;


  @IsString()
  @IsNotEmpty()
  address: string;


  @IsString()
  @IsNotEmpty()
  city: string;


  @IsOptional()
  @IsString()
  state?: string;


  @IsOptional()
  @IsString()
  postalCode?: string;


  // =====================================================
  // LOCATION
  // =====================================================

  @IsOptional()
  @IsNumber()
  latitude?: number;


  @IsOptional()
  @IsNumber()
  longitude?: number;


  // =====================================================
  // IMAGE
  // =====================================================

  @IsOptional()
  @IsUrl()
  image?: string;
}