import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { JwtAuthGuard } from 'src/auth/Guard/jwt.guard';
import { HttpModule } from '@nestjs/axios';
import { MemoRepository } from './repository/memo.repository';

@Module({
  controllers: [MemoController],
  providers: [MemoService, JwtAuthGuard, MemoRepository],
  imports: [HttpModule]
})
export class MemoModule {}
