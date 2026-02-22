import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateCoachingSettingsDto } from './dto/update-coaching-settings.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: { email: string; password: string; name: string }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getSettings(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return this.prisma.settings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    return this.prisma.settings.upsert({
      where: { userId },
      update: updateSettingsDto,
      create: { userId, ...updateSettingsDto },
    });
  }

  async getCoachingSettings(userId: string) {
    const settings = await this.prisma.coachingSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return this.prisma.coachingSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateCoachingSettings(userId: string, dto: UpdateCoachingSettingsDto) {
    return this.prisma.coachingSettings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
