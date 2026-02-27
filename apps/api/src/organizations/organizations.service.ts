import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto, userId: string) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already in use');
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        members: {
          create: {
            userId,
          },
        },
      },
    });

    // Make creator admin of the org
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    return org;
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
              },
            },
            coach: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async addMember(orgId: string, userId: string, coachId?: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { members: true } } },
    });

    if (!org) throw new NotFoundException('Organization not found');

    if (org._count.members >= org.maxUsers) {
      throw new ForbiddenException('Organization has reached its user limit');
    }

    const existing = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.organizationUser.create({
      data: { organizationId: orgId, userId, coachId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        coach: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async assignCoach(orgId: string, coacheeId: string, coachId: string) {
    const membership = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: coacheeId } },
    });

    if (!membership) throw new NotFoundException('Coachee is not a member of this organization');

    return this.prisma.organizationUser.update({
      where: { organizationId_userId: { organizationId: orgId, userId: coacheeId } },
      data: { coachId },
    });
  }

  async removeMember(orgId: string, userId: string) {
    const membership = await this.prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });

    if (!membership) throw new NotFoundException('User is not a member of this organization');

    return this.prisma.organizationUser.delete({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
  }

  async getMyOrganizations(userId: string) {
    return this.prisma.organizationUser.findMany({
      where: { userId },
      include: {
        organization: true,
        coach: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }
}
