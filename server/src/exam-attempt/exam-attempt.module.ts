import { Module } from '@nestjs/common';
import { ExamAttemptService } from './exam-attempt.service';
import { ExamAttemptController } from './exam-attempt.controller';

@Module({
  controllers: [ExamAttemptController],
  providers: [ExamAttemptService],
})
export class ExamAttemptModule {}
