import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  MaxLength,
  IsIn,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  username?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Amber', 'Blue', 'Pink', 'Rose', 'Emerald', 'Black'])
  colorMode?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
