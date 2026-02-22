import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from '../messages/messages.service';
import { MessagesGateway } from '../messages/messages.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // ─── n8n Data Endpoints ────────────────────────────────────────────

  @Get('checkin-reminder')
  @ApiOperation({ summary: 'Get users that need a check-in reminder (for n8n)' })
  async getUsersForCheckinReminder() {
    const users = await this.prisma.user.findMany({
      where: {
        settings: { notifications: true },
      },
      select: {
        id: true,
        name: true,
        email: true,
        settings: { select: { checkInTime: true } },
      },
    });

    return { users };
  }

  @Get('weekly-report/users')
  @ApiOperation({ summary: 'Get all active users for weekly report (for n8n)' })
  async getUsersForWeeklyReport() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return { users };
  }

  // ─── n8n Callback Endpoints ────────────────────────────────────────

  @Post('ai-response')
  @ApiOperation({ summary: 'Receive AI response from n8n' })
  async handleAiResponse(
    @Body() body: { conversationId: string; content: string; userId: string },
  ) {
    const message = await this.messagesService.create(
      body.conversationId,
      body.userId,
      body.content,
      'assistant',
    );

    this.messagesGateway.emitNewMessage(body.conversationId, message);

    return { success: true, messageId: message.id };
  }

  @Post('checkin-reminder')
  @ApiOperation({ summary: 'Trigger check-in reminder from n8n' })
  async handleCheckInReminder(
    @Body() body: { userId: string; userName?: string; message?: string },
  ) {
    this.messagesGateway.server.emit(`reminder:${body.userId}`, {
      type: 'checkin-reminder',
      message: body.message || 'Tijd voor je dagelijkse check-in!',
    });

    return { success: true };
  }

  @Post('weekly-report')
  @ApiOperation({ summary: 'Receive generated weekly report from n8n' })
  async handleWeeklyReport(
    @Body() body: { userId: string; report: any; conversationId?: string },
  ) {
    if (body.conversationId) {
      const message = await this.messagesService.create(
        body.conversationId,
        body.userId,
        JSON.stringify(body.report),
        'assistant',
      );

      this.messagesGateway.emitNewMessage(body.conversationId, message);

      return { success: true, messageId: message.id };
    }

    this.messagesGateway.server.emit(`report:${body.userId}`, {
      type: 'weekly-report',
      report: body.report,
    });

    return { success: true };
  }

  @Post('send-notification')
  @ApiOperation({ summary: 'Send email notification via n8n' })
  async handleSendNotification(
    @Body() body: { type: 'checkin-reminder' | 'weekly-report'; userId: string; report?: any },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: body.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (body.type === 'checkin-reminder') {
      await this.notificationService.sendCheckinReminder(user.email, user.name);
    } else if (body.type === 'weekly-report' && body.report) {
      await this.notificationService.sendWeeklyReport(user.email, user.name, body.report);
    }

    return { success: true };
  }
}
