import { IsInt } from 'class-validator';

export class StartAttemptDto {
  @IsInt()
  exam_id: number;
}
