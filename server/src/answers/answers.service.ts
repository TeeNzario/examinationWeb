import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveAnswerDto } from './dto/save-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  async save(dto: SaveAnswerDto, userId: number) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attempt_id },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.user_id !== userId) throw new ForbiddenException('Not your attempt');
    if (attempt.status === 'submitted') throw new BadRequestException('Exam already submitted');

    const now = new Date();
    if (now > attempt.end_time) {
      throw new BadRequestException('Exam time has expired');
    }

    const answer = await this.prisma.answer.upsert({
      where: {
        attempt_id_question_id: {
          attempt_id: dto.attempt_id,
          question_id: dto.question_id,
        },
      },
      update: { choice_id: dto.choice_id },
      create: {
        attempt_id: dto.attempt_id,
        question_id: dto.question_id,
        choice_id: dto.choice_id,
      },
    });

    return answer;
  }
}
