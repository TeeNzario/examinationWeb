import { IsInt } from 'class-validator';

export class SubmitAttemptDto {
  @IsInt()
  attempt_id: number;
}
