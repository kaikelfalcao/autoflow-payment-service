import { GetChargeUseCase } from '../../application/use-cases/get-charge/get-charge.use-case';
import { ChargeResponseDto } from './dtos/charge-response.dto';
export declare class ChargeController {
    private readonly getCharge;
    constructor(getCharge: GetChargeUseCase);
    getById(chargeId: string): Promise<ChargeResponseDto>;
    getByOrder(serviceOrderId: string): Promise<ChargeResponseDto>;
}
