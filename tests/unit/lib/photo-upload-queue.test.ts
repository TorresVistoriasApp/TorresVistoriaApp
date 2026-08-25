import { describe, expect, it } from "vitest";
import { runPhotoPrepare, runPhotoUpload } from "@/modules/torres-vistoria/domain/photos/upload-queue";

async function measureConcurrency(run: <T>(task: () => Promise<T>) => Promise<T>) {
  let current = 0;
  let max = 0;

  await Promise.all(
    Array.from({ length: 6 }, async () =>
      run(async () => {
        current += 1;
        max = Math.max(max, current);
        await new Promise((resolve) => setTimeout(resolve, 20));
        current -= 1;
      }),
    ),
  );

  return max;
}

describe("photo upload queues", () => {
  it("limita compressão e upload a 2 tarefas simultâneas", async () => {
    expect(await measureConcurrency(runPhotoPrepare)).toBe(2);
    expect(await measureConcurrency(runPhotoUpload)).toBe(2);
  });

  it("permite comprimir a próxima foto enquanto o upload anterior ainda corre", async () => {
    let prepareStartedDuringUpload = false;
    let uploadRunning = false;

    const upload = runPhotoUpload(async () => {
      uploadRunning = true;
      await new Promise((resolve) => setTimeout(resolve, 40));
      uploadRunning = false;
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    await runPhotoPrepare(async () => {
      prepareStartedDuringUpload = uploadRunning;
    });

    await upload;
    expect(prepareStartedDuringUpload).toBe(true);
  });
});
