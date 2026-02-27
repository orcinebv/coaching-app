import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Post()
  create(@Body() dto: CreateOrganizationDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  getMyOrganizations(@Request() req) {
    return this.service.getMyOrganizations(req.user.userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COACH)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/members')
  @Roles(Role.ADMIN)
  addMember(
    @Param('id') orgId: string,
    @Body() body: { userId: string; coachId?: string },
  ) {
    return this.service.addMember(orgId, body.userId, body.coachId);
  }

  @Patch(':id/members/:userId/coach')
  @Roles(Role.ADMIN)
  assignCoach(
    @Param('id') orgId: string,
    @Param('userId') coacheeId: string,
    @Body() body: { coachId: string },
  ) {
    return this.service.assignCoach(orgId, coacheeId, body.coachId);
  }

  @Delete(':id/members/:userId')
  @Roles(Role.ADMIN)
  removeMember(@Param('id') orgId: string, @Param('userId') userId: string) {
    return this.service.removeMember(orgId, userId);
  }
}
