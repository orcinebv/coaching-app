import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello, I need help with my goals' })
  @IsString()
  content!: string;

  @ApiProperty({ example: 'uuid-of-conversation' })
  @IsString()
  conversationId!: string;
}
