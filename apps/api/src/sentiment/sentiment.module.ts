import { Module } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { SentimentController } from './sentiment.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [SentimentService],
  controllers: [SentimentController],
  exports: [SentimentService],
})
export class SentimentModule {}
