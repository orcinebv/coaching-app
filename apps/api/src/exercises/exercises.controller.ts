import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExercisesService } from './exercises.service';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteExerciseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}

@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises' })
  @ApiQuery({ name: 'category', required: false, type: String })
  findAll(@Query('category') category?: string) {
    return this.exercisesService.findAll(category);
  }

  @Get('completions')
  @ApiOperation({ summary: 'Get exercise completions for current user' })
  getCompletions(@Request() req: any) {
    return this.exercisesService.getCompletions(req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get exercise statistics for current user' })
  getStats(@Request() req: any) {
    return this.exercisesService.getStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific exercise' })
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark exercise as completed' })
  complete(@Request() req: any, @Param('id') id: string, @Body() dto: CompleteExerciseDto) {
    return this.exercisesService.complete(req.user.userId, id, dto.notes, dto.rating);
  }
}
