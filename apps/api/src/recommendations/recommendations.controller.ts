import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get personalized recommendations' })
  getRecommendations(@Request() req: any) {
    return this.recommendationsService.getRecommendations(req.user.userId);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Give feedback on a recommendation' })
  feedback(@Request() req: any, @Param('id') id: string, @Body() body: { helpful: boolean }) {
    return this.recommendationsService.giveFeedback(req.user.userId, id, body.helpful);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  dismiss(@Request() req: any, @Param('id') id: string) {
    return this.recommendationsService.dismiss(req.user.userId, id);
  }
}
