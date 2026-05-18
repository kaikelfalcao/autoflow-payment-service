import { MercadoPagoMockAdapter } from "./mercado-pago-mock.adapter";

describe("MercadoPagoMockAdapter", () => {
  let adapter: MercadoPagoMockAdapter;

  beforeEach(() => {
    adapter = new MercadoPagoMockAdapter();
  });

  describe("createPreference", () => {
    it("cria preferenceId + checkoutUrl com mockPaymentId", async () => {
      const out = await adapter.createPreference({
        chargeId: "ch_1",
        serviceOrderId: "order-1",
        totalCents: 10000,
      });
      expect(out.preferenceId).toMatch(/^mock-pref-/);
      expect(out.checkoutUrl).toMatch(
        /^http:\/\/localhost:3004\/billing\/mock\/checkout\/mock-pay-/,
      );
    });

    it("registra payment em status pending por padrão", async () => {
      const { checkoutUrl } = await adapter.createPreference({
        chargeId: "ch_2",
        serviceOrderId: "order-2",
        totalCents: 5000,
      });
      const paymentId = checkoutUrl.split("/").pop() as string;
      const result = await adapter.getPayment(paymentId);
      expect(result.status).toBe("pending");
      expect(result.externalReference).toBe("order-2");
      expect(result.mpPaymentId).toBe(paymentId);
    });
  });

  describe("getPayment", () => {
    it("retorna pending + externalReference vazio quando mpPaymentId desconhecido", async () => {
      const result = await adapter.getPayment("does-not-exist");
      expect(result).toEqual({
        mpPaymentId: "does-not-exist",
        status: "pending",
        externalReference: "",
      });
    });
  });

  describe("setStatus", () => {
    it("muda status do payment registrado", async () => {
      const { checkoutUrl } = await adapter.createPreference({
        chargeId: "c",
        serviceOrderId: "order-3",
        totalCents: 100,
      });
      const paymentId = checkoutUrl.split("/").pop() as string;

      adapter.setStatus(paymentId, "approved");

      const result = await adapter.getPayment(paymentId);
      expect(result.status).toBe("approved");
    });

    it("setStatus em paymentId desconhecido não cria registro", async () => {
      adapter.setStatus("nonexistent", "approved");
      const result = await adapter.getPayment("nonexistent");
      expect(result.externalReference).toBe("");
    });
  });

  describe("registerExternal", () => {
    it("registra payment manualmente com status default pending", async () => {
      adapter.registerExternal("ext-1", "order-ext");
      const result = await adapter.getPayment("ext-1");
      expect(result.status).toBe("pending");
      expect(result.externalReference).toBe("order-ext");
    });

    it("aceita status custom", async () => {
      adapter.registerExternal("ext-2", "order-ext-2", "approved");
      const result = await adapter.getPayment("ext-2");
      expect(result.status).toBe("approved");
    });
  });
});
