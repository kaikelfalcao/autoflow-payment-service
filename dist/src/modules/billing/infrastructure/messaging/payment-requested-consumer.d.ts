import { OnModuleInit } from '@nestjs/common';
import { CreateChargeUseCase } from '../../application/use-cases/create-charge/create-charge.use-case';
export declare class PaymentRequestedConsumer implements OnModuleInit {
    private readonly createCharge;
    private readonly logger;
    constructor(createCharge: CreateChargeUseCase);
    onModuleInit(): Promise<void>;
}
