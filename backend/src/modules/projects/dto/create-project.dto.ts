import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  Length,
  MaxLength,
} from 'class-validator';

export enum ProjectPriorityDto {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateProjectDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectPriorityDto)
  priority?: ProjectPriorityDto;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lead?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
