import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJournalEntryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  mood?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emotion?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  sliderValue?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  factors?: string[];
}
