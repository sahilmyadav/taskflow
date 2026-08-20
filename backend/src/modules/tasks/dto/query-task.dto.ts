import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';

export enum QueryStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class QueryTaskDto {
  @IsOptional()
  @IsEnum(QueryStatus)
  status?: QueryStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // createdAt | dueDate | priority | title

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
