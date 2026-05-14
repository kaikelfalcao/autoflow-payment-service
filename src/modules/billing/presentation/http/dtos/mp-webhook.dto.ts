import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MpWebhookDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  data: { id: string };
}
