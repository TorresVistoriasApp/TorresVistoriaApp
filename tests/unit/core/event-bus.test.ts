import { describe, expect, it, beforeEach, vi } from "vitest";
import { eventBus, EventNames } from "@/core/events";

describe("eventBus", () => {
  beforeEach(() => {
    eventBus.reset();
  });

  it("entrega o evento a todos os handlers do nome", async () => {
    const first = vi.fn();
    const second = vi.fn();
    eventBus.subscribe(EventNames.CONSULTA_COMPLETED, first);
    eventBus.subscribe(EventNames.CONSULTA_COMPLETED, second);

    await eventBus.publish(
      EventNames.CONSULTA_COMPLETED,
      { consultaId: "c-1" },
      { tenantId: "t-1" },
    );

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(first.mock.calls[0][0].payload).toEqual({ consultaId: "c-1" });
    expect(first.mock.calls[0][0].tenantId).toBe("t-1");
  });

  it("entrega também aos handlers coringa", async () => {
    const wildcard = vi.fn();
    eventBus.subscribe("*", wildcard);

    await eventBus.publish(EventNames.CONSULTA_FAILED, { reason: "x" });

    expect(wildcard).toHaveBeenCalledOnce();
    expect(wildcard.mock.calls[0][0].name).toBe(EventNames.CONSULTA_FAILED);
  });

  it("não deixa falha de um handler derrubar os demais", async () => {
    const broken = vi.fn(() => {
      throw new Error("boom");
    });
    const ok = vi.fn();
    eventBus.subscribe(EventNames.PDF_GENERATED, broken);
    eventBus.subscribe(EventNames.PDF_GENERATED, ok);

    await expect(
      eventBus.publish(EventNames.PDF_GENERATED, { path: "/a.pdf" }),
    ).resolves.toBeDefined();

    expect(ok).toHaveBeenCalledOnce();
  });

  it("unsubscribe remove o handler", async () => {
    const handler = vi.fn();
    const off = eventBus.subscribe(EventNames.EMAIL_SENT, handler);
    off();

    await eventBus.publish(EventNames.EMAIL_SENT, { to: "a@b.com" });

    expect(handler).not.toHaveBeenCalled();
  });
});
