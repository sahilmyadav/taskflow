import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @Length(6, 72)
  password!: string;

  @IsOptional()
  @IsString()
  @Length(2, 30)
  username?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  fullName?: string;
}
