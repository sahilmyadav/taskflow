import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class GuestLoginDto {
  @IsOptional()
  @IsString()
  @Length(2, 30)
  @Matches(/^[a-zA-Z0-9_\- ]+$/, {
    message: 'username can only contain letters, numbers, spaces, _ and -',
  })
  username?: string;
}
