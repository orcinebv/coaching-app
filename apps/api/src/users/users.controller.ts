import { Controller, Get, Patch, Delete, Body, UseGuards, Request, Res, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateCoachingSettingsDto } from './dto/update-coaching-settings.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Get('me/settings')
  @ApiOperation({ summary: 'Get current user settings' })
  async getSettings(@Request() req: any) {
    return this.usersService.getSettings(req.user.userId);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update current user settings' })
  async updateSettings(@Request() req: any, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.usersService.updateSettings(req.user.userId, updateSettingsDto);
  }

  @Get('me/coaching-settings')
  @ApiOperation({ summary: 'Get coaching settings' })
  async getCoachingSettings(@Request() req: any) {
    return this.usersService.getCoachingSettings(req.user.userId);
  }

  @Patch('me/coaching-settings')
  @ApiOperation({ summary: 'Update coaching settings' })
  async updateCoachingSettings(@Request() req: any, @Body() dto: UpdateCoachingSettingsDto) {
    return this.usersService.updateCoachingSettings(req.user.userId, dto);
  }

  @Patch('me/onboarding-complete')
  @ApiOperation({ summary: 'Mark onboarding as completed' })
  async completeOnboarding(@Request() req: any) {
    return this.usersService.completeOnboarding(req.user.userId);
  }

  @Get('me/export')
  @ApiOperation({ summary: 'Export all personal data (GDPR)' })
  async exportData(@Request() req: any, @Res() res: Response) {
    const data = await this.usersService.exportMyData(req.user.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mijn-data-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(data, null, 2));
  }

  @Delete('me/account')
  @ApiOperation({ summary: 'Delete account and anonymize data (GDPR)' })
  async deleteAccount(@Request() req: any) {
    return this.usersService.deleteMyAccount(req.user.userId);
  }

  @Get('me/audit-log')
  @ApiOperation({ summary: 'Get personal activity audit log' })
  async getAuditLog(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getMyAuditLog(req.user.userId, limit);
  }
}
