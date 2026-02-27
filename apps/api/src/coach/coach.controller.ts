import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('coach')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.COACH, Role.ADMIN)
export class CoachController {
  constructor(private readonly service: CoachService) {}

  @Get('coachees')
  getCoachees(@Request() req: any) {
    return this.service.getCoachees(req.user.userId);
  }

  @Get('coachees/:id/overview')
  getCoacheeOverview(@Param('id') coacheeId: string, @Request() req: any) {
    return this.service.getCoacheeOverview(req.user.userId, coacheeId);
  }

  @Get('coachees/:id/checkins')
  getCoacheeCheckIns(
    @Param('id') coacheeId: string,
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.service.getCoacheeCheckIns(req.user.userId, coacheeId, limit);
  }

  @Get('alerts')
  getCrisisAlerts(@Request() req: any) {
    return this.service.getCrisisAlerts(req.user.userId);
  }

  @Post('coachees/:id/notes')
  addNote(
    @Param('id') coacheeId: string,
    @Request() req: any,
    @Body() body: { content: string; isPrivate?: boolean },
  ) {
    return this.service.addNote(req.user.userId, coacheeId, body.content, body.isPrivate);
  }

  @Get('coachees/:id/notes')
  getNotes(@Param('id') coacheeId: string, @Request() req: any) {
    return this.service.getNotes(req.user.userId, coacheeId);
  }
}
