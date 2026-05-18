import { firstValueFrom, of, throwError } from "rxjs";
import { CanonicalLogInterceptor } from "./canonical-log.interceptor";
import { RequestContextService } from "./request-context.service";

const makeLogger = () => ({
  log: jest.fn(),
});

const makeHttpCtx = (
  req: Record<string, unknown>,
  res: Record<string, unknown>,
  type: "http" | "rpc" = "http",
) => ({
  getType: () => type,
  switchToHttp: () => ({
    getRequest: () => req,
    getResponse: () => res,
  }),
});

describe("CanonicalLogInterceptor", () => {
  let logger: ReturnType<typeof makeLogger>;
  let ctxSvc: RequestContextService;
  let interceptor: CanonicalLogInterceptor;

  beforeEach(() => {
    logger = makeLogger();
    ctxSvc = new RequestContextService();
    interceptor = new CanonicalLogInterceptor(logger as never, ctxSvc);
  });

  it("passa direto quando não é http", async () => {
    const next = { handle: () => of({ skipped: true }) };
    const result = await firstValueFrom(
      interceptor.intercept(makeHttpCtx({}, {}, "rpc") as never, next as never),
    );
    expect(result).toEqual({ skipped: true });
    expect(logger.log).not.toHaveBeenCalled();
  });

  it("emite log de sucesso com status do response", async () => {
    const req = {
      headers: { "x-correlation-id": "cid-1" },
      method: "GET",
      url: "/charges",
      path: "/charges",
      route: { path: "/charges" },
    };
    const res = { statusCode: 200 };
    const next = {
      handle: () => {
        ctxSvc.set("chargeId", "ch_1");
        return of({ ok: true });
      },
    };

    await firstValueFrom(
      interceptor.intercept(makeHttpCtx(req, res) as never, next as never),
    );

    const entry = logger.log.mock.calls[0][0];
    expect(entry.level).toBe("info");
    expect(entry.status_code).toBe(200);
    expect(entry.request_id).toBe("cid-1");
    expect(entry.path).toBe("/charges");
    expect(entry.chargeId).toBe("ch_1");
    expect(entry.duration_ms).toEqual(expect.any(Number));
  });

  it('usa "unknown" quando não há x-correlation-id', async () => {
    const req = { headers: {}, method: "GET", url: "/x", path: "/x" };
    const res = { statusCode: 200 };
    const next = { handle: () => of(null) };

    await firstValueFrom(
      interceptor.intercept(makeHttpCtx(req, res) as never, next as never),
    );

    expect(logger.log.mock.calls[0][0].request_id).toBe("unknown");
  });

  it("emite warn em 4xx", async () => {
    const req = { headers: {}, method: "POST", url: "/x", path: "/x" };
    const res = { statusCode: 404 };
    const next = { handle: () => of(null) };

    await firstValueFrom(
      interceptor.intercept(makeHttpCtx(req, res) as never, next as never),
    );

    expect(logger.log.mock.calls[0][0].level).toBe("warn");
  });

  it("emite error com payload error.* quando handler lança", async () => {
    const req = { headers: {}, method: "PUT", url: "/x", path: "/x" };
    const res = { statusCode: 200 };
    const err = Object.assign(new Error("boom"), { status: 500, code: "E_BOOM" });
    const next = { handle: () => throwError(() => err) };

    await expect(
      firstValueFrom(
        interceptor.intercept(makeHttpCtx(req, res) as never, next as never),
      ),
    ).rejects.toBe(err);

    const entry = logger.log.mock.calls[0][0];
    expect(entry.level).toBe("error");
    expect(entry.status_code).toBe(500);
    expect(entry.error).toEqual({
      type: "Error",
      message: "boom",
      code: "E_BOOM",
    });
  });

  it("usa req.url quando não há route.path nem req.path", async () => {
    const req = { headers: {}, method: "GET", url: "/raw" };
    const res = { statusCode: 200 };
    const next = { handle: () => of(null) };

    await firstValueFrom(
      interceptor.intercept(makeHttpCtx(req, res) as never, next as never),
    );

    expect(logger.log.mock.calls[0][0].path).toBe("/raw");
  });
});
