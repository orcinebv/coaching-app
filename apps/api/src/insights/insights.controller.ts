import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user insights' })
  getInsights(@Request() req: any) {
    return this.insightsService.getInsights(req.user.userId);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate new insights' })
  generate(@Request() req: any) {
    return this.insightsService.generateInsights(req.user.userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark insight as read' })
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.insightsService.markRead(req.user.userId, id);
  }
}
