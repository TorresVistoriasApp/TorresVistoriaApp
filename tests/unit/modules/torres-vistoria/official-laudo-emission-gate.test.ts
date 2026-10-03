import { describe, expect, it } from "vitest";
import { createExclusiveGate, runExclusive } from "@/modules/torres-vistoria/services/official-laudo-emission-gate";

describe("P.5 — lock síncrono da emissão oficial", () => {
  it("primeiro acquire obtém o lock", () => {
    const gate = createExclusiveGate();
    expect(gate.tryAcquire()).toBe(true);
    expect(gate.isHeld()).toBe(true);
  });

  it("segundo acquire enquanto o primeiro está ativo falha", () => {
    const gate = createExclusiveGate();
    expect(gate.tryAcquire()).toBe(true);
    expect(gate.tryAcquire()).toBe(false);
  });

  it("dois cliques no mesmo tick resultam em um único fluxo", async () => {
    const gate = createExclusiveGate();
    let runs = 0;
    const task = async () => {
      runs += 1;
      await Promise.resolve();
      return runs;
    };
    const [a, b] = await Promise.all([runExclusive(gate, task), runExclusive(gate, task)]);
    const ran = [a, b].filter((result) => result.ran);
    expect(ran).toHaveLength(1);
    expect(runs).toBe(1);
  });

  it("segundo clique enquanto o primeiro está em execução não inicia nova emissão", async () => {
    const gate = createExclusiveGate();
    let releaseFirst!: () => void;
    const first = runExclusive(
      gate,
      () =>
        new Promise<string>((resolve) => {
          releaseFirst = () => resolve("ok");
        }),
    );
    const second = await runExclusive(gate, async () => "nope");
    expect(second).toEqual({ ran: false });
    releaseFirst();
    await expect(first).resolves.toEqual({ ran: true, value: "ok" });
  });

  it("lock é liberado após sucesso", async () => {
    const gate = createExclusiveGate();
    await runExclusive(gate, async () => 1);
    expect(gate.isHeld()).toBe(false);
    expect(gate.tryAcquire()).toBe(true);
  });

  it("lock é liberado após erro", async () => {
    const gate = createExclusiveGate();
    await expect(
      runExclusive(gate, async () => {
        throw new Error("falha");
      }),
    ).rejects.toThrow("falha");
    expect(gate.isHeld()).toBe(false);
    expect(gate.tryAcquire()).toBe(true);
  });

  it("erro no PREPARE, na geração do PDF e no SEAL liberam o lock", async () => {
    for (const label of ["PREPARE", "PDF", "SEAL"] as const) {
      const gate = createExclusiveGate();
      await expect(
        runExclusive(gate, async () => {
          throw new Error(label);
        }),
      ).rejects.toThrow(label);
      expect(gate.isHeld()).toBe(false);
    }
  });
});
