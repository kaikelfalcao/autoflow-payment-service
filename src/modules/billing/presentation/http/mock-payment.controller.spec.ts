import { MockPaymentController } from "./mock-payment.controller";

describe("MockPaymentController", () => {
  const makeCtrl = () => {
    const adapter = { setStatus: jest.fn() };
    const ctrl = new MockPaymentController(adapter as never);
    return { ctrl, adapter };
  };

  it("approve seta status approved e retorna {status: 'approved'}", () => {
    const { ctrl, adapter } = makeCtrl();
    const out = ctrl.approve("pay-1");
    expect(adapter.setStatus).toHaveBeenCalledWith("pay-1", "approved");
    expect(out).toEqual({ status: "approved" });
  });

  it("reject seta status rejected e retorna {status: 'rejected'}", () => {
    const { ctrl, adapter } = makeCtrl();
    const out = ctrl.reject("pay-2");
    expect(adapter.setStatus).toHaveBeenCalledWith("pay-2", "rejected");
    expect(out).toEqual({ status: "rejected" });
  });

  it("simulateWebhook propaga status do body", async () => {
    const { ctrl, adapter } = makeCtrl();
    const out = await ctrl.simulateWebhook({
      mpPaymentId: "pay-3",
      status: "approved",
    });
    expect(adapter.setStatus).toHaveBeenCalledWith("pay-3", "approved");
    expect(out).toEqual({ ok: true });
  });
});
