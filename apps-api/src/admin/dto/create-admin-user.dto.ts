import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum AdminCreateUserRole {
  CUSTOMER = 'CUSTOMER',
  SALON_OWNER = 'SALON_OWNER',
  SALON_MANAGER = 'SALON_MANAGER',
  STAFF = 'STAFF',
}

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(AdminCreateUserRole)
  role: AdminCreateUserRole;
}