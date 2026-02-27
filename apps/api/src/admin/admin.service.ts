import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isOnboarded: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              checkIns: true,
              conversations: true,
              goals: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateUserRole(targetUserId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deactivateUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isActive: true },
    });
  }

  async activateUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: true },
      select: { id: true, email: true, name: true, isActive: true },
    });
  }

  async getPlatformStats() {
    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalCheckIns,
      totalGoals,
      aiUsageStats,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.conversation.count(),
      this.prisma.checkIn.count(),
      this.prisma.goal.count(),
      this.prisma.aiUsage.aggregate({
        _sum: { tokensUsed: true, costEur: true },
        _count: true,
        _avg: { responseMs: true },
      }),
    ]);

    const roleBreakdown = await this.prisma.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: true,
    });

    return {
      totalUsers,
      activeUsers,
      totalConversations,
      totalCheckIns,
      totalGoals,
      aiUsage: {
        totalCalls: aiUsageStats._count,
        totalTokens: aiUsageStats._sum.tokensUsed || 0,
        totalCostEur: aiUsageStats._sum.costEur || 0,
        avgResponseMs: Math.round(aiUsageStats._avg.responseMs || 0),
      },
      roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: r._count })),
    };
  }

  async getAiCostsByUser(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const costs = await this.prisma.aiUsage.groupBy({
      by: ['userId'],
      _sum: { tokensUsed: true, costEur: true },
      _count: true,
      orderBy: { _sum: { costEur: 'desc' } },
      skip,
      take: limit,
    });

    const userIds = costs.map((c) => c.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return costs.map((c) => ({
      user: userMap.get(c.userId) || { id: c.userId, name: 'Unknown', email: '' },
      tokensUsed: c._sum.tokensUsed || 0,
      costEur: c._sum.costEur || 0,
      calls: c._count,
    }));
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { logs, total, page, limit };
  }
}
