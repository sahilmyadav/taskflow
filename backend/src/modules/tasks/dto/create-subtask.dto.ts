import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  Length,
  MaxLength,
} from 'class-validator';

export enum SubtaskPriorityDto {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateSubtaskDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsOptional()
  @IsEnum(SubtaskPriorityDto)
  priority?: SubtaskPriorityDto;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  assignee?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
