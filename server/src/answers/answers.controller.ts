import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  save(@Body() dto: SaveAnswerDto, @Request() req) {
    return this.answersService.save(dto, req.user.id);
  }
}
