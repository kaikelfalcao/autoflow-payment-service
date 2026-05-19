import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type {
  IMercadoPagoPort,
  CreatePreferenceInput,
  CreatePreferenceOutput,
  GetPaymentOutput,
} from "../../domain/ports/mercado-pago.port";

@Injectable()
export class MercadoPagoAdapter implements IMercadoPagoPort {
  private readonly client: MercadoPagoConfig;
  private readonly notificationUrl: string;
  private readonly logger = new Logger(MercadoPagoAdapter.name);

  constructor(private readonly config: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: config.getOrThrow<string>("MP_ACCESS_TOKEN"),
    });
    this.notificationUrl = config.getOrThrow<string>("MP_NOTIFICATION_URL");
  }

  async createPreference(
    input: CreatePreferenceInput,
  ): Promise<CreatePreferenceOutput> {
    const preference = new Preference(this.client);
    const isTest = this.config.get("NODE_ENV") !== "production";

    const response = await preference.create({
      body: {
        external_reference: input.serviceOrderId,
        notification_url: `${this.notificationUrl}?source_news=webhooks`,
        items: [
          {
            id: input.chargeId,
            title: `Ordem de Serviço #${input.serviceOrderId.slice(0, 8)}`,
            quantity: 1,
            unit_price: input.totalCents / 100,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${this.notificationUrl.replace("/webhook/mercadopago", "/payment/success")}`,
          failure: `${this.notificationUrl.replace("/webhook/mercadopago", "/payment/failure")}`,
          pending: `${this.notificationUrl.replace("/webhook/mercadopago", "/payment/pending")}`,
        },
        auto_return: "approved",
      },
    });

    const checkoutUrl = isTest
      ? (response.sandbox_init_point ?? response.init_point ?? "")
      : (response.init_point ?? "");

    this.logger.log(
      `Preference ${response.id} created for order ${input.serviceOrderId}`,
    );

    return {
      preferenceId: response.id ?? "",
      checkoutUrl,
    };
  }

  async getPayment(mpPaymentId: string): Promise<GetPaymentOutput> {
    const paymentApi = new Payment(this.client);
    const payment = await paymentApi.get({ id: mpPaymentId });

    return {
      mpPaymentId: String(payment.id),
      status: payment.status as GetPaymentOutput["status"],
      externalReference: payment.external_reference ?? "",
    };
  }
}
