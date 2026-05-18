// Mock do SDK do Mercado Pago — chamamos createPreference e getPayment via dependência injetada.
const mockPreferenceCreate = jest.fn();
const mockPaymentGet = jest.fn();
const mockConfigCtor = jest.fn();

jest.mock("mercadopago", () => ({
  MercadoPagoConfig: jest.fn().mockImplementation((opts: unknown) => {
    mockConfigCtor(opts);
  }),
  Preference: jest.fn().mockImplementation(() => ({
    create: mockPreferenceCreate,
  })),
  Payment: jest.fn().mockImplementation(() => ({
    get: mockPaymentGet,
  })),
}));

import { MercadoPagoAdapter } from "./mercado-pago.adapter";

describe("MercadoPagoAdapter", () => {
  const makeConfig = (env: Record<string, string>) => ({
    getOrThrow: <T>(key: string): T => {
      const v = env[key];
      if (v === undefined) throw new Error(`missing ${key}`);
      return v as T;
    },
    get: (key: string) => env[key],
  });

  beforeEach(() => {
    mockPreferenceCreate.mockReset();
    mockPaymentGet.mockReset();
    mockConfigCtor.mockReset();
  });

  it("inicializa o cliente com MP_ACCESS_TOKEN", () => {
    new MercadoPagoAdapter(
      makeConfig({
        MP_ACCESS_TOKEN: "token-x",
        MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
      }) as never,
    );
    expect(mockConfigCtor).toHaveBeenCalledWith({ accessToken: "token-x" });
  });

  describe("createPreference", () => {
    it("monta body com itens e back_urls; usa sandbox_init_point em não-produção", async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: "pref-123",
        sandbox_init_point: "https://sandbox/checkout/abc",
        init_point: "https://live/checkout/abc",
      });
      const adapter = new MercadoPagoAdapter(
        makeConfig({
          MP_ACCESS_TOKEN: "t",
          MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
          NODE_ENV: "development",
        }) as never,
      );

      const out = await adapter.createPreference({
        chargeId: "ch_1",
        serviceOrderId: "order-1234567890abc",
        totalCents: 12345,
      });

      expect(mockPreferenceCreate).toHaveBeenCalled();
      const body = mockPreferenceCreate.mock.calls[0][0].body;
      expect(body.external_reference).toBe("order-1234567890abc");
      expect(body.items[0].unit_price).toBe(123.45);
      expect(body.back_urls.success).toBe("https://api/payment/success");
      expect(out).toEqual({
        preferenceId: "pref-123",
        checkoutUrl: "https://sandbox/checkout/abc",
      });
    });

    it("usa init_point em produção", async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: "pref-prod",
        init_point: "https://live/checkout/prod",
      });
      const adapter = new MercadoPagoAdapter(
        makeConfig({
          MP_ACCESS_TOKEN: "t",
          MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
          NODE_ENV: "production",
        }) as never,
      );

      const out = await adapter.createPreference({
        chargeId: "c",
        serviceOrderId: "o",
        totalCents: 100,
      });

      expect(out.checkoutUrl).toBe("https://live/checkout/prod");
    });

    it("fallback para string vazia quando sandbox/init_point ausentes", async () => {
      mockPreferenceCreate.mockResolvedValue({ id: "pref-x" });
      const adapter = new MercadoPagoAdapter(
        makeConfig({
          MP_ACCESS_TOKEN: "t",
          MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
          NODE_ENV: "development",
        }) as never,
      );

      const out = await adapter.createPreference({
        chargeId: "c",
        serviceOrderId: "o",
        totalCents: 100,
      });

      expect(out.checkoutUrl).toBe("");
    });

    it("preferenceId fallback para string vazia quando id ausente", async () => {
      mockPreferenceCreate.mockResolvedValue({ init_point: "x" });
      const adapter = new MercadoPagoAdapter(
        makeConfig({
          MP_ACCESS_TOKEN: "t",
          MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
          NODE_ENV: "production",
        }) as never,
      );

      const out = await adapter.createPreference({
        chargeId: "c",
        serviceOrderId: "o",
        totalCents: 100,
      });

      expect(out.preferenceId).toBe("");
    });
  });

  describe("getPayment", () => {
    it("mapeia o payment retornado pelo SDK", async () => {
      mockPaymentGet.mockResolvedValue({
        id: 999,
        status: "approved",
        external_reference: "order-999",
      });
      const adapter = new MercadoPagoAdapter(
        makeConfig({
          MP_ACCESS_TOKEN: "t",
          MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
        }) as never,
      );

      const out = await adapter.getPayment("999");

      expect(mockPaymentGet).toHaveBeenCalledWith({ id: "999" });
      expect(out).toEqual({
        mpPaymentId: "999",
        status: "approved",
        externalReference: "order-999",
      });
    });

    it("externalReference vazio quando ausente no SDK", async () => {
      mockPaymentGet.mockResolvedValue({ id: 1, status: "pending" });
      const adapter = new MercadoPagoAdapter(
        makeConfig({
          MP_ACCESS_TOKEN: "t",
          MP_NOTIFICATION_URL: "https://api/webhook/mercadopago",
        }) as never,
      );

      const out = await adapter.getPayment("1");
      expect(out.externalReference).toBe("");
    });
  });
});
