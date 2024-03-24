import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class AuthSignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
