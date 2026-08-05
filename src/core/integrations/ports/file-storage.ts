import type { IntegrationResult } from "@/core/integrations/ports/shared";

export interface StoredFile {
  /** Caminho dentro do bucket. Persistir isto, nunca a URL assinada. */
  path: string;
  bucket: string;
  sizeInBytes: number;
  contentType: string;
}

export interface UploadOptions {
  contentType?: string;
  /** Substitui um arquivo existente no mesmo caminho. */
  upsert?: boolean;
}

/**
 * Porta de armazenamento de arquivos.
 *
 * Os buckets guardam PII (fotos de veículo, laudos), então o contrato só expõe
 * URLs assinadas e temporárias — não existe operação que devolva URL pública.
 */
export interface FileStoragePort {
  upload(
    bucket: string,
    path: string,
    file: Blob,
    options?: UploadOptions,
  ): Promise<IntegrationResult<StoredFile>>;

  remove(bucket: string, paths: string[]): Promise<IntegrationResult<void>>;

  /** URL temporária de leitura. `null` quando o caminho não existe. */
  getSignedUrl(
    bucket: string,
    path: string | null | undefined,
    ttlSeconds?: number,
  ): Promise<string | null>;

  /** Assinatura em lote — uma vistoria referencia dezenas de fotos. */
  getSignedUrls(
    bucket: string,
    paths: Array<string | null | undefined>,
    ttlSeconds?: number,
  ): Promise<Map<string, string>>;
}
