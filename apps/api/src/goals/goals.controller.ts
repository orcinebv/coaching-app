import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a SMART goal' })
  create(@Request() req: any, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals for current user' })
  findAll(@Request() req: any) {
    return this.goalsService.findAllByUser(req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get goal statistics' })
  getStats(@Request() req: any) {
    return this.goalsService.getStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.goalsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.goalsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.goalsService.remove(id, req.user.userId);
  }
}
