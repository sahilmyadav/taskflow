import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';
import { TaskStatusDto } from './create-task.dto';

export class BulkStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(TaskStatusDto)
  status!: TaskStatusDto;
}
