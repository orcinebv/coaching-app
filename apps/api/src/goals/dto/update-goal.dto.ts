import { IsString, IsOptional, IsDateString, IsInt, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGoalDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specific?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  measurable?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  achievable?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  relevant?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  timeBound?: string;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'abandoned'] })
  @IsIn(['active', 'completed', 'abandoned'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
