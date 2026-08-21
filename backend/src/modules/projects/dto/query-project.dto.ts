import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ProjectPriorityDto } from './create-project.dto';

export class QueryProjectDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProjectPriorityDto)
  priority?: ProjectPriorityDto;
}
