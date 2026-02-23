import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SentimentService } from './sentiment.service';

@ApiTags('sentiment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sentiment')
export class SentimentController {
  constructor(private sentimentService: SentimentService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze sentiment of a text' })
  analyze(
    @Request() req: any,
    @Body() body: { text: string; sourceType: 'journal' | 'message'; sourceId: string },
  ) {
    return this.sentimentService.analyzeText(req.user.userId, body.text, body.sourceType, body.sourceId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get sentiment history' })
  getHistory(@Request() req: any, @Query('days') days?: string) {
    return this.sentimentService.getSentimentHistory(req.user.userId, days ? parseInt(days) : 30);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get sentiment summary' })
  getSummary(@Request() req: any) {
    return this.sentimentService.getSentimentSummary(req.user.userId);
  }
}
