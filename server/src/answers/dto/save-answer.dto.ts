import { IsInt } from 'class-validator';

export class SaveAnswerDto {
  @IsInt()
  attempt_id: number;

  @IsInt()
  question_id: number;

  @IsInt()
  choice_id: number;
}
