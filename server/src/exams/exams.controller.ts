import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SetExamQuestionsDto } from './dto/set-exam-questions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() dto: CreateExamDto, @Request() req) {
    return this.examsService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.findOne(id);
  }

  @Post(':id/questions')
  setQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetExamQuestionsDto,
  ) {
    return this.examsService.setQuestions(id, dto);
  }
}
