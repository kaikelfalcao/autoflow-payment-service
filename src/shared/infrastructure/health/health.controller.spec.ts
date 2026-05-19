import { HealthController } from "./health.controller";

describe("HealthController", () => {
  const makeController = (queryImpl: () => Promise<unknown>) => {
    const dataSource = { query: queryImpl } as never;
    const health = { check: jest.fn(async () => ({ ok: true })) } as never;
    const db = { pingCheck: jest.fn() } as never;
    return new HealthController(health, db, dataSource);
  };

  it("status=ok quando Postgres responde SELECT 1", async () => {
    const ctrl = makeController(async () => [{ "?column?": 1 }]);
    const out = await ctrl.check();
    expect(out.status).toBe("ok");
    expect(out.postgres).toBe("connected");
    expect(out.service).toBe("autoflow-payment-service");
    expect(out.timestamp).toEqual(expect.any(String));
  });

  it("status=degraded quando Postgres falha", async () => {
    const ctrl = makeController(async () => {
      throw new Error("ECONNREFUSED");
    });
    const out = await ctrl.check();
    expect(out.status).toBe("degraded");
    expect(out.postgres).toBe("error");
  });

  it("liveness retorna ok", () => {
    const ctrl = makeController(async () => []);
    expect(ctrl.liveness()).toEqual({ status: "ok" });
  });

  it("readiness invoca health.check com pingCheck", async () => {
    const dataSource = { query: jest.fn() };
    const health = { check: jest.fn(async () => ({ ok: true })) };
    const db = { pingCheck: jest.fn() };
    const ctrl = new HealthController(
      health as never,
      db as never,
      dataSource as never,
    );

    await ctrl.readiness();

    expect(health.check).toHaveBeenCalled();
    const indicators = (
      health.check.mock.calls[0] as unknown as [Array<() => void>]
    )[0];
    indicators[0]();
    expect(db.pingCheck).toHaveBeenCalledWith("postgres");
  });
});
