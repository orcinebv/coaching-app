import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('mood-patterns')
  @ApiOperation({ summary: 'Get mood patterns and insights' })
  getMoodPatterns(@Request() req: any) {
    return this.analyticsService.getMoodPatterns(req.user.userId);
  }

  @Get('progress-summary')
  @ApiOperation({ summary: 'Get overall progress summary' })
  getProgressSummary(@Request() req: any) {
    return this.analyticsService.getProgressSummary(req.user.userId);
  }
}
