import { Module } from '@nestjs/common';
import { CoachingPromptsService } from './coaching-prompts.service';
import { CoachingPromptsController } from './coaching-prompts.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [CoachingPromptsService],
  controllers: [CoachingPromptsController],
  exports: [CoachingPromptsService],
})
export class CoachingPromptsModule {}
