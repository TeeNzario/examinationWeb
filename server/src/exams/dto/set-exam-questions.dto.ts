import { IsArray, IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ExamQuestionItemDto {
  @IsInt()
  question_id: number;

  @IsInt()
  order_index: number;
}

export class SetExamQuestionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionItemDto)
  questions: ExamQuestionItemDto[];
}
