import { IsString, Length, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(1, 2000)
  body!: string;

  @IsString()
  @Length(1, 50)
  @MaxLength(50)
  author!: string;
}
