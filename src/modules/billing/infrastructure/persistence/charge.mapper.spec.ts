import { ChargeMapper } from "./charge.mapper";
import { Charge } from "../../domain/charge.entity";
import { ChargeId } from "../../domain/value-objects/charge-id.vo";

const sampleOrm = () => ({
  id: "11111111-1111-1111-1111-111111111111",
  serviceOrderId: "order-1",
  customerId: "cust-1",
  totalCents: 9999,
  status: "PENDING" as const,
  mpPreferenceId: null,
  mpPaymentId: null,
  checkoutUrl: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
});

describe("ChargeMapper", () => {
  it("toDomain mapeia ORM → Charge preservando todos os atributos", () => {
    const orm = sampleOrm();
    const charge = ChargeMapper.toDomain(orm);

    expect(charge.id.value).toBe(orm.id);
    expect(charge.serviceOrderId).toBe("order-1");
    expect(charge.customerId).toBe("cust-1");
    expect(charge.totalCents).toBe(9999);
    expect(charge.status).toBe("PENDING");
    expect(charge.createdAt).toEqual(orm.createdAt);
    expect(charge.updatedAt).toEqual(orm.updatedAt);
  });

  it("toOrm mapeia Charge → ORM com tudo populado", () => {
    const charge = Charge.create({
      id: ChargeId.generate(),
      serviceOrderId: "order-2",
      customerId: "cust-2",
      totalCents: 4321,
    });
    charge.attachPreference("pref-1", "https://checkout/1");

    const orm = ChargeMapper.toOrm(charge);

    expect(orm.id).toBe(charge.id.value);
    expect(orm.serviceOrderId).toBe("order-2");
    expect(orm.customerId).toBe("cust-2");
    expect(orm.totalCents).toBe(4321);
    expect(orm.status).toBe("PENDING");
    expect(orm.mpPreferenceId).toBe("pref-1");
    expect(orm.checkoutUrl).toBe("https://checkout/1");
    expect(orm.createdAt).toBeInstanceOf(Date);
    expect(orm.updatedAt).toBeInstanceOf(Date);
  });

  it("roundtrip: toOrm(toDomain(x)) preserva valores", () => {
    const orm = sampleOrm();
    const back = ChargeMapper.toOrm(ChargeMapper.toDomain(orm));
    expect(back.id).toBe(orm.id);
    expect(back.serviceOrderId).toBe(orm.serviceOrderId);
    expect(back.totalCents).toBe(orm.totalCents);
    expect(back.status).toBe(orm.status);
  });
});
