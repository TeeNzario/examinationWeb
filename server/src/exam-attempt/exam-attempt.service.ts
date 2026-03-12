import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class ExamAttemptService {
  constructor(private prisma: PrismaService) {}

  async start(dto: StartAttemptDto, userId: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.exam_id },
      include: { _count: { select: { examQuestions: true } } },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    if (exam._count.examQuestions === 0) {
      throw new BadRequestException('Exam has no questions');
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + exam.duration_minutes * 60 * 1000);

    const attempt = await this.prisma.examAttempt.create({
      data: {
        exam_id: dto.exam_id,
        user_id: userId,
        start_time: now,
        end_time: endTime,
        status: 'in_progress',
      },
    });

    return attempt;
  }

  async getQuestions(attemptId: number, userId: number) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  include: {
                    choices: {
                      select: { id: true, choice_text: true, question_id: true },
                    },
                  },
                },
              },
              orderBy: { order_index: 'asc' },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.user_id !== userId) throw new ForbiddenException('Not your attempt');

    const questions = attempt.exam.examQuestions.map((eq) => ({
      id: eq.question.id,
      question_text: eq.question.question_text,
      order_index: eq.order_index,
      choices: eq.question.choices,
      selected_choice_id: attempt.answers.find((a) => a.question_id === eq.question.id)?.choice_id || null,
    }));

    return {
      attempt_id: attempt.id,
      exam_title: attempt.exam.title,
      status: attempt.status,
      start_time: attempt.start_time,
      end_time: attempt.end_time,
      questions,
    };
  }

  async submit(dto: SubmitAttemptDto, userId: number) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attempt_id },
      include: {
        exam: {
          include: {
            examQuestions: true,
          },
        },
        answers: {
          include: { choice: true },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.user_id !== userId) throw new ForbiddenException('Not your attempt');
    if (attempt.status === 'submitted') throw new BadRequestException('Already submitted');

    const totalQuestions = attempt.exam.examQuestions.length;
    const answeredQuestions = attempt.answers.length;

    if (answeredQuestions < totalQuestions) {
      throw new BadRequestException('You must answer all questions before submitting.');
    }

    const score = attempt.answers.filter((a) => a.choice.is_correct).length;

    const updated = await this.prisma.examAttempt.update({
      where: { id: dto.attempt_id },
      data: {
        status: 'submitted',
        score,
      },
    });

    if (attempt.exam.show_score_after_submit) {
      return {
        message: 'Exam submitted successfully',
        score,
        total: totalQuestions,
      };
    }

    return { message: 'Exam submitted successfully' };
  }

  async getResult(attemptId: number, userId: number) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: { _count: { select: { examQuestions: true } } },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.user_id !== userId) throw new ForbiddenException('Not your attempt');
    if (attempt.status !== 'submitted') throw new BadRequestException('Exam not yet submitted');

    if (attempt.exam.show_score_after_submit) {
      return {
        attempt_id: attempt.id,
        exam_title: attempt.exam.title,
        score: attempt.score,
        total: attempt.exam._count.examQuestions,
        status: attempt.status,
      };
    }

    return {
      attempt_id: attempt.id,
      exam_title: attempt.exam.title,
      message: 'Score is not available for this exam',
      status: attempt.status,
    };
  }
}
