import { CorrelationIdMiddleware } from "./correlation-id.middleware";

describe("CorrelationIdMiddleware", () => {
  const middleware = new CorrelationIdMiddleware();
  const HEADER = "x-correlation-id";

  it("propaga o correlation-id quando já presente na request", () => {
    const req = { headers: { [HEADER]: "incoming-cid" } } as never;
    const res = { setHeader: jest.fn() } as never;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect((req as { headers: Record<string, string> }).headers[HEADER]).toBe(
      "incoming-cid",
    );
    expect((res as { setHeader: jest.Mock }).setHeader).toHaveBeenCalledWith(
      HEADER,
      "incoming-cid",
    );
    expect(next).toHaveBeenCalled();
  });

  it("gera um uuid quando não há correlation-id na request", () => {
    const req = { headers: {} } as never;
    const res = { setHeader: jest.fn() } as never;
    const next = jest.fn();

    middleware.use(req, res, next);

    const generated = (req as { headers: Record<string, string> }).headers[
      HEADER
    ];
    expect(generated).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect((res as { setHeader: jest.Mock }).setHeader).toHaveBeenCalledWith(
      HEADER,
      generated,
    );
    expect(next).toHaveBeenCalled();
  });

  it("gera novo uuid quando header está vazio (string vazia)", () => {
    const req = { headers: { [HEADER]: "" } } as never;
    const res = { setHeader: jest.fn() } as never;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(
      (req as { headers: Record<string, string> }).headers[HEADER],
    ).not.toBe("");
    expect(next).toHaveBeenCalled();
  });
});
