import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestReportDto {
  @ApiProperty({ enum: ['week', 'month'] })
  @IsIn(['week', 'month'])
  type!: 'week' | 'month';
}

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a new report' })
  requestReport(@Request() req: any, @Body() dto: RequestReportDto) {
    return this.reportsService.requestReport(req.user.userId, dto.type);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports for current user' })
  getReports(@Request() req: any) {
    return this.reportsService.getReports(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report' })
  getReport(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.getReport(id, req.user.userId);
  }
}
