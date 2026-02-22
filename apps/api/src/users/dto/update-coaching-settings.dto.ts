import { IsString, IsBoolean, IsInt, IsOptional, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCoachingSettingsDto {
  @ApiPropertyOptional({ enum: ['supportive', 'challenging', 'analytical'] })
  @IsString()
  @IsOptional()
  @IsIn(['supportive', 'challenging', 'analytical'])
  coachingStyle?: string;

  @ApiPropertyOptional({ description: 'JSON array of focus areas', example: '["stress","productivity"]' })
  @IsString()
  @IsOptional()
  focusAreas?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  weeklyGoal?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['daily', 'weekdays', 'weekly'] })
  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekdays', 'weekly'])
  reminderFrequency?: string;
}
