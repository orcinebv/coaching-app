import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  async create(@Request() req: any, @Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(req.user.userId, createConversationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.conversationsService.findAllByUser(
      req.user.userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.conversationsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a conversation' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(id, req.user.userId, updateConversationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.conversationsService.delete(id, req.user.userId);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a conversation' })
  async archive(@Request() req: any, @Param('id') id: string) {
    return this.conversationsService.archiveConversation(id, req.user.userId);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a conversation' })
  async close(@Request() req: any, @Param('id') id: string) {
    return this.conversationsService.closeConversation(id, req.user.userId);
  }
}
