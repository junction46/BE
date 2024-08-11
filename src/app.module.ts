import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'config/typeorm.config';
import { MemoModule } from './memo/memo.module';

@Module({
  imports: [AuthModule, CommonModule, TypeOrmModule.forRoot(typeORMConfig), MemoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
