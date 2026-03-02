import { IsInt, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckInDto {
  @ApiProperty({ example: 7, minimum: 1, maximum: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  mood!: number;

  @ApiProperty({ example: 8, minimum: 1, maximum: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  energy!: number;

  @ApiPropertyOptional({ example: 'Feeling good today' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Complete the project review' })
  @IsString()
  @IsOptional()
  goals?: string;

  @ApiPropertyOptional({ example: 7.5, description: 'Slaapuren (0-12)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(12)
  sleepHours?: number;

  @ApiPropertyOptional({ example: 8, description: 'Slaapkwaliteit (1-10)' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  sleepQuality?: number;

  @ApiPropertyOptional({ example: 8, description: 'Glazen water (0-15)' })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(15)
  waterGlasses?: number;

  @ApiPropertyOptional({ example: 30, description: 'Beweging in minuten (0-180)' })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(180)
  activityMinutes?: number;

  @ApiPropertyOptional({ example: 5, description: 'Stressniveau (1-10)' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  stressLevel?: number;
}
