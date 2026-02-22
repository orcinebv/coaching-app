import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
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
}
