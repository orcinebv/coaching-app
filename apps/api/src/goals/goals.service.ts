import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        specific: dto.specific,
        measurable: dto.measurable,
        achievable: dto.achievable,
        relevant: dto.relevant,
        timeBound: new Date(dto.timeBound),
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.findOne(id, userId);
    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        timeBound: dto.timeBound ? new Date(dto.timeBound) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.goal.delete({ where: { id } });
  }

  async getStats(userId: string) {
    const goals = await this.prisma.goal.findMany({ where: { userId } });
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'active').length;
    const avgProgress = total > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total)
      : 0;
    return { total, completed, active, avgProgress };
  }
}
