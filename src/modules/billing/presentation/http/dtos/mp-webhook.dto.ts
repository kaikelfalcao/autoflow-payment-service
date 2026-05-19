import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class MpWebhookDataDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class MpWebhookDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MpWebhookDataDto)
  data!: MpWebhookDataDto;
}
