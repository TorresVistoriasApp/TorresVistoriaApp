import { isSupportedImageFile } from "@/lib/compress-image";

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif";

/** Tempo extra para o evento `change` em navegadores mobile após retorno do foco. */
const MOBILE_CHANGE_GRACE_MS = 800;

export type PickImageFilesResult = {
  files: File[];
  rejectedCount: number;
};

export type PickImageFilesOptions = {
  capture?: boolean;
  multiple?: boolean;
};

export function partitionSupportedFiles(files: File[]): PickImageFilesResult {
  const supported: File[] = [];
  let rejectedCount = 0;

  for (const file of files) {
    if (isSupportedImageFile(file)) {
      supported.push(file);
    } else {
      rejectedCount += 1;
    }
  }

  return { files: supported, rejectedCount };
}

/**
 * Abre o seletor nativo de imagens (câmera ou galeria).
 * Em mobile, o evento `change` pode disparar depois do retorno de foco — evita resolver
 * cedo demais e descartar fotos válidas da galeria.
 */
export function pickImageFiles(options: PickImageFilesOptions = {}): Promise<PickImageFilesResult> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_ACCEPT;
    if (options.capture) {
      input.capture = "environment";
    }
    input.multiple = Boolean(options.multiple);
    input.style.display = "none";

    let settled = false;
    let cancelTimer: number | undefined;

    const cleanup = () => {
      input.remove();
      window.removeEventListener("focus", onWindowFocus);
      if (cancelTimer) window.clearTimeout(cancelTimer);
    };

    const finish = (files: File[]) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(partitionSupportedFiles(files));
    };

    const finishIfReady = () => {
      if (settled) return;
      if (input.files?.length) {
        finish(Array.from(input.files));
      }
    };

    input.onchange = () => finish(Array.from(input.files ?? []));

    const onWindowFocus = () => {
      if (settled) return;

      window.setTimeout(() => {
        finishIfReady();
        if (settled) return;

        cancelTimer = window.setTimeout(() => {
          if (settled) return;
          if (input.files?.length) {
            finish(Array.from(input.files));
          } else {
            finish([]);
          }
        }, MOBILE_CHANGE_GRACE_MS);
      }, 100);
    };

    const inputWithCancel = input as HTMLInputElement & { oncancel?: (() => void) | null };
    if ("oncancel" in inputWithCancel) {
      inputWithCancel.oncancel = () => finish([]);
    } else {
      window.addEventListener("focus", onWindowFocus, { once: true });
    }

    document.body.appendChild(input);
    input.click();
  });
}
