import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckInsService } from './checkins.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@ApiTags('checkins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkins')
export class CheckInsController {
  constructor(private checkInsService: CheckInsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new check-in' })
  async create(@Request() req: any, @Body() createCheckInDto: CreateCheckInDto) {
    return this.checkInsService.create(req.user.userId, createCheckInDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all check-ins for current user' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.checkInsService.findAllByUser(req.user.userId, {
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get check-in statistics' })
  async getStats(@Request() req: any) {
    return this.checkInsService.getStats(req.user.userId);
  }

  @Get('aggregate')
  @ApiOperation({ summary: 'Get aggregate check-in statistics' })
  async getAggregateStats(@Request() req: any) {
    return this.checkInsService.getAggregateStats(req.user.userId);
  }

  @Get('trends/:period')
  @ApiOperation({ summary: 'Get check-in trends for a period' })
  async getTrends(
    @Request() req: any,
    @Param('period') period: 'week' | 'month' | 'quarter',
  ) {
    return this.checkInsService.getTrends(req.user.userId, period);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get check-ins for a conversation timeframe' })
  async getCheckInsForConversation(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.checkInsService.getCheckInsForConversation(conversationId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific check-in' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.checkInsService.findOne(id, req.user.userId);
  }
}
