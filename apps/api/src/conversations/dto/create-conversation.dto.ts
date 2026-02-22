import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ example: 'My coaching session' })
  @IsString()
  title!: string;
}
