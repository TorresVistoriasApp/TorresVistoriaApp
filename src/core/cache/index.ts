/**
 * Camada de cache do Ecossistema Torres.
 *
 * Hoje embrulha React Query. Módulos devem preferir `cacheKeys` + `cacheService`
 * a chaves literais espalhadas — assim invalidação por tenant fica previsível.
 */

export { cacheKeys, type CacheKey } from "@/core/cache/cache-keys";
export {
  cacheService,
  createCacheService,
  bindCacheClient,
  type CacheService,
} from "@/core/cache/cache-service";
