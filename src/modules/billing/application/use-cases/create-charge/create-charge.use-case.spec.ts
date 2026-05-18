import { CreateChargeUseCase } from "./create-charge.use-case";
import type { IChargeRepository } from "../../../domain/charge.repository";
import type { IMercadoPagoPort } from "../../../domain/ports/mercado-pago.port";

const mockRepo = (): jest.Mocked<IChargeRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByServiceOrderId: jest.fn(),
});

const mockMp = (): jest.Mocked<IMercadoPagoPort> => ({
  createPreference: jest.fn(),
  getPayment: jest.fn(),
});

describe("CreateChargeUseCase", () => {
  let useCase: CreateChargeUseCase;
  let repo: jest.Mocked<IChargeRepository>;
  let mp: jest.Mocked<IMercadoPagoPort>;

  const input = {
    serviceOrderId: "order-1",
    customerId: "customer-1",
    totalCents: 15000,
  };

  beforeEach(() => {
    repo = mockRepo();
    mp = mockMp();
    useCase = new CreateChargeUseCase(repo, mp);
  });

  it("creates charge and returns checkout URL", async () => {
    repo.findByServiceOrderId.mockResolvedValue(null);
    mp.createPreference.mockResolvedValue({
      preferenceId: "pref-abc",
      checkoutUrl: "https://mp.com/checkout/pref-abc",
    });

    const result = await useCase.execute(input);

    expect(mp.createPreference).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceOrderId: "order-1",
        totalCents: 15000,
      }),
    );
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.checkoutUrl).toBe("https://mp.com/checkout/pref-abc");
    expect(result.chargeId).toBeDefined();
  });

  it("returns existing charge without creating a new one", async () => {
    const { Charge } = await import("../../../domain/charge.entity");
    const { ChargeId } =
      await import("../../../domain/value-objects/charge-id.vo");
    const existing = Charge.restore({
      id: ChargeId.fromString("existing-id"),
      serviceOrderId: "order-1",
      customerId: "customer-1",
      totalCents: 15000,
      status: "PENDING",
      mpPreferenceId: "pref-old",
      mpPaymentId: null,
      checkoutUrl: "https://mp.com/existing",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo.findByServiceOrderId.mockResolvedValue(existing);

    const result = await useCase.execute(input);

    expect(repo.save).not.toHaveBeenCalled();
    expect(mp.createPreference).not.toHaveBeenCalled();
    expect(result.chargeId).toBe("existing-id");
  });

  it("does not save if Mercado Pago throws", async () => {
    repo.findByServiceOrderId.mockResolvedValue(null);
    mp.createPreference.mockRejectedValue(new Error("MP timeout"));

    await expect(useCase.execute(input)).rejects.toThrow("MP timeout");
    expect(repo.save).not.toHaveBeenCalled();
  });
});
