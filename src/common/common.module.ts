import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { JwtAuthGuard } from 'src/auth/Guard/jwt.guard';
import { HttpModule } from '@nestjs/axios';
import { RoadmapRepository } from './repository/common.repository';

@Module({
  controllers: [CommonController],
  providers: [CommonService, JwtAuthGuard, RoadmapRepository],
  imports: [
    HttpModule
  ]
})
export class CommonModule {}
