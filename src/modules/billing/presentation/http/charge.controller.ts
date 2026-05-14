import { Controller, Get, Param } from '@nestjs/common';
import { GetChargeUseCase } from '../../application/use-cases/get-charge/get-charge.use-case';
import { ChargeResponseDto } from './dtos/charge-response.dto';

@Controller('billing/charges')
export class ChargeController {
  constructor(private readonly getCharge: GetChargeUseCase) {}

  @Get(':chargeId')
  async getById(@Param('chargeId') chargeId: string): Promise<ChargeResponseDto> {
    const charge = await this.getCharge.byId(chargeId);
    return ChargeResponseDto.fromDomain(charge);
  }

  @Get('order/:serviceOrderId')
  async getByOrder(
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<ChargeResponseDto> {
    const charge = await this.getCharge.byServiceOrderId(serviceOrderId);
    return ChargeResponseDto.fromDomain(charge);
  }
}
