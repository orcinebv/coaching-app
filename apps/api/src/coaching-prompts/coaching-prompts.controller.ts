import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoachingPromptsService } from './coaching-prompts.service';

@ApiTags('coaching-prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coaching-prompts')
export class CoachingPromptsController {
  constructor(private promptsService: CoachingPromptsService) {}

  @Get('daily')
  @ApiOperation({ summary: "Get today's coaching prompt" })
  getDailyPrompt(@Request() req: any) {
    return this.promptsService.getDailyPrompt(req.user.userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get prompt history' })
  getHistory(@Request() req: any) {
    return this.promptsService.getPromptHistory(req.user.userId);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a prompt' })
  rate(@Request() req: any, @Param('id') id: string, @Body() body: { rating: number }) {
    return this.promptsService.ratePrompt(req.user.userId, id, body.rating);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip a prompt' })
  skip(@Request() req: any, @Param('id') id: string) {
    return this.promptsService.skipPrompt(req.user.userId, id);
  }
}
