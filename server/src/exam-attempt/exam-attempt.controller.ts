import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ExamAttemptService } from './exam-attempt.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exam-attempt')
@UseGuards(JwtAuthGuard)
export class ExamAttemptController {
  constructor(private readonly examAttemptService: ExamAttemptService) {}

  @Post('start')
  start(@Body() dto: StartAttemptDto, @Request() req) {
    return this.examAttemptService.start(dto, req.user.id);
  }

  @Get(':id/questions')
  getQuestions(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.examAttemptService.getQuestions(id, req.user.id);
  }

  @Post('submit')
  submit(@Body() dto: SubmitAttemptDto, @Request() req) {
    return this.examAttemptService.submit(dto, req.user.id);
  }

  @Get(':id/result')
  getResult(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.examAttemptService.getResult(id, req.user.id);
  }
}
