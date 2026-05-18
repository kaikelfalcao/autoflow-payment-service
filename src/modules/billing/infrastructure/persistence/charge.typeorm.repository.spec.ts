import { ChargeTypeOrmRepository } from "./charge.typeorm.repository";
import { Charge } from "../../domain/charge.entity";
import { ChargeId } from "../../domain/value-objects/charge-id.vo";

const makeRepoMock = () => ({
  save: jest.fn(async () => undefined),
  findOneBy: jest.fn(),
});

describe("ChargeTypeOrmRepository", () => {
  let typeOrmRepo: ReturnType<typeof makeRepoMock>;
  let chargeRepo: ChargeTypeOrmRepository;

  beforeEach(() => {
    typeOrmRepo = makeRepoMock();
    chargeRepo = new ChargeTypeOrmRepository(typeOrmRepo as never);
  });

  it("save invoca repo.save com mapeamento para ORM", async () => {
    const charge = Charge.create({
      id: ChargeId.generate(),
      serviceOrderId: "order-1",
      customerId: "c-1",
      totalCents: 1000,
    });
    await chargeRepo.save(charge);
    expect(typeOrmRepo.save).toHaveBeenCalled();
    const arg = (typeOrmRepo.save.mock.calls[0] as unknown as [{ id: string }])[0];
    expect(arg.id).toBe(charge.id.value);
  });

  it("update reusa save (idempotente via repository pattern)", async () => {
    const charge = Charge.create({
      id: ChargeId.generate(),
      serviceOrderId: "order-1",
      customerId: "c-1",
      totalCents: 100,
    });
    await chargeRepo.update(charge);
    expect(typeOrmRepo.save).toHaveBeenCalled();
  });

  it("findById retorna domain quando ORM existe", async () => {
    typeOrmRepo.findOneBy.mockResolvedValue({
      id: "ch-1",
      serviceOrderId: "o-1",
      customerId: "c-1",
      totalCents: 100,
      status: "PENDING",
      mpPreferenceId: null,
      mpPaymentId: null,
      checkoutUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await chargeRepo.findById(ChargeId.fromString("ch-1"));

    expect(result).not.toBeNull();
    expect(result?.id.value).toBe("ch-1");
  });

  it("findById retorna null quando não encontrado", async () => {
    typeOrmRepo.findOneBy.mockResolvedValue(null);
    const result = await chargeRepo.findById(ChargeId.fromString("missing"));
    expect(result).toBeNull();
  });

  it("findByServiceOrderId mapeia para domain", async () => {
    typeOrmRepo.findOneBy.mockResolvedValue({
      id: "ch-2",
      serviceOrderId: "order-2",
      customerId: "c-2",
      totalCents: 200,
      status: "APPROVED",
      mpPreferenceId: "pref",
      mpPaymentId: "pay",
      checkoutUrl: "url",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await chargeRepo.findByServiceOrderId("order-2");

    expect(result?.serviceOrderId).toBe("order-2");
    expect(result?.status).toBe("APPROVED");
  });

  it("findByServiceOrderId retorna null quando não encontra", async () => {
    typeOrmRepo.findOneBy.mockResolvedValue(null);
    const result = await chargeRepo.findByServiceOrderId("none");
    expect(result).toBeNull();
  });
});
