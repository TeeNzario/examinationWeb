import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto, userId: number) {
    const correctCount = dto.choices.filter((c) => c.is_correct).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Each question must have exactly one correct answer');
    }

    return this.prisma.question.create({
      data: {
        question_text: dto.question_text,
        created_by: userId,
        choices: {
          create: dto.choices.map((c) => ({
            choice_text: c.choice_text,
            is_correct: c.is_correct,
          })),
        },
      },
      include: { choices: true },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: { choices: true, creator: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.question.findUnique({
      where: { id },
      include: { choices: true, creator: { select: { id: true, name: true } } },
    });
  }
}
