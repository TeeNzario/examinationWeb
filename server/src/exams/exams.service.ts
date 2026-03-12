import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SetExamQuestionsDto } from './dto/set-exam-questions.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExamDto, userId: number) {
    return this.prisma.exam.create({
      data: {
        title: dto.title,
        duration_minutes: dto.duration_minutes,
        show_score_after_submit: dto.show_score_after_submit,
        created_by: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.exam.findMany({
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { examQuestions: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        examQuestions: {
          include: {
            question: { include: { choices: true } },
          },
          orderBy: { order_index: 'asc' },
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async setQuestions(examId: number, dto: SetExamQuestionsDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');

    await this.prisma.examQuestion.deleteMany({ where: { exam_id: examId } });

    await this.prisma.examQuestion.createMany({
      data: dto.questions.map((q) => ({
        exam_id: examId,
        question_id: q.question_id,
        order_index: q.order_index,
      })),
    });

    return this.findOne(examId);
  }
}
