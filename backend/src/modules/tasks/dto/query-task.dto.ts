import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PriorityDto } from './create-task.dto';

export enum QueryStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ON_HOLD = 'ON_HOLD',
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
  @IsEnum(PriorityDto)
  priority?: PriorityDto;

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

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  withRelations?: string;
}
