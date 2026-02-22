import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

@ApiTags('journal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Get('prompt')
  @ApiOperation({ summary: 'Get daily journal prompt' })
  getDailyPrompt() {
    return { prompt: this.journalService.getDailyPrompt() };
  }

  @Post()
  @ApiOperation({ summary: 'Create a journal entry' })
  create(@Request() req: any, @Body() dto: CreateJournalEntryDto) {
    return this.journalService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all journal entries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.journalService.findAllByUser(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('mood-trend')
  @ApiOperation({ summary: 'Get journal mood trend' })
  getMoodTrend(@Request() req: any) {
    return this.journalService.getMoodTrend(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific journal entry' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.journalService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a journal entry' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateJournalEntryDto) {
    return this.journalService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.journalService.remove(id, req.user.userId);
  }
}
