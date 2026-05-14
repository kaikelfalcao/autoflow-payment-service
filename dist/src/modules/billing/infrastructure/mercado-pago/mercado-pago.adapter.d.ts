import { ConfigService } from '@nestjs/config';
import type { IMercadoPagoPort, CreatePreferenceInput, CreatePreferenceOutput, GetPaymentOutput } from '../../domain/ports/mercado-pago.port';
export declare class MercadoPagoAdapter implements IMercadoPagoPort {
    private readonly config;
    private readonly client;
    private readonly notificationUrl;
    private readonly logger;
    constructor(config: ConfigService);
    createPreference(input: CreatePreferenceInput): Promise<CreatePreferenceOutput>;
    getPayment(mpPaymentId: string): Promise<GetPaymentOutput>;
}
