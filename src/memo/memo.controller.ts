import {
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  Body,
  Req,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/Guard/jwt.guard';
import { memo_dto, memo_get_dto } from './Dto/memo.dto';
import { MemoService } from './memo.service';
import { Memo } from './entity/memo.entity';

@UseGuards(JwtAuthGuard)
@Controller('memo')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @Post('submit')
  async gen_feedback(@Body(ValidationPipe) memoDTO: memo_dto, @Req() req) {
    const { subject, topic, concept, memo } = memoDTO;
    return await this.memoService.gen_feedback(
      subject,
      topic,
      concept,
      memo,
      req.user.googleId,
    );
  }

  @Post('save')
  async save_txt(
    @Body(ValidationPipe) memo_DTO: memo_dto,
    @Req() req,
  ): Promise<Memo> {
    const { subject, topic, concept, memo } = memo_DTO;
    return await this.memoService.save_memo(
      subject,
      topic,
      concept,
      memo,
      req.user.googleId,
    );
  }

  @Post('recall')
  async recall_txt(
    @Body(ValidationPipe) memo_get_DTO: memo_get_dto,
    @Req() req,
  ) {
    const { subject, topic, concept } = memo_get_DTO;
    return await this.memoService.get_memo(
      subject,
      topic,
      concept,
      req.user.googleId,
    );
  }
}
