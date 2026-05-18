import { ChargeController } from "./charge.controller";
import { Charge } from "../../domain/charge.entity";
import { ChargeId } from "../../domain/value-objects/charge-id.vo";

describe("ChargeController", () => {
  const makeCharge = () =>
    Charge.create({
      id: ChargeId.generate(),
      serviceOrderId: "order-1",
      customerId: "c-1",
      totalCents: 1000,
    });

  it("getById delega para useCase.byId e mapeia para DTO", async () => {
    const charge = makeCharge();
    const useCase = {
      byId: jest.fn(async () => charge),
      byServiceOrderId: jest.fn(),
    };
    const ctrl = new ChargeController(useCase as never);

    const result = await ctrl.getById(charge.id.value);

    expect(useCase.byId).toHaveBeenCalledWith(charge.id.value);
    expect(result.id).toBe(charge.id.value);
    expect(result.serviceOrderId).toBe("order-1");
  });

  it("getByOrder delega para useCase.byServiceOrderId", async () => {
    const charge = makeCharge();
    const useCase = {
      byId: jest.fn(),
      byServiceOrderId: jest.fn(async () => charge),
    };
    const ctrl = new ChargeController(useCase as never);

    const result = await ctrl.getByOrder("order-1");

    expect(useCase.byServiceOrderId).toHaveBeenCalledWith("order-1");
    expect(result.serviceOrderId).toBe("order-1");
  });
});
