import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  specific: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  measurable: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  achievable: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  relevant: string;

  @ApiProperty()
  @IsDateString()
  timeBound: string;
}
