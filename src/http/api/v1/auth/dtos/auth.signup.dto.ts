import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class AuthSignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  refresh_token?: string | null;

  @IsOptional()
  @IsString()
  access_token?: string | null;
}
