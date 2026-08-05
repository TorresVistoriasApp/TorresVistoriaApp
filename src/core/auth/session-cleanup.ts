import { logger } from "@/core/observability/logger";

type CleanupTask = () => void | Promise<void>;

const tasks = new Set<CleanupTask>();

/**
 * Registra uma limpeza a executar no logout.
 *
 * Existe para inverter a dependência: o núcleo de autenticação não pode saber
 * que existe um armazenamento offline de vistorias. Cada subsistema que guarda
 * dados do usuário se inscreve aqui, e adicionar um novo produto não altera o
 * fluxo de logout.
 *
 * Devolve a função para cancelar o registro.
 */
export function registerSessionCleanup(task: CleanupTask): () => void {
  tasks.add(task);
  return () => tasks.delete(task);
}

/**
 * Executa todas as limpezas registradas.
 *
 * Uma falha isolada não impede o logout: deixar o usuário preso numa sessão
 * porque um cache não pôde ser apagado seria pior do que o resíduo.
 */
export async function runSessionCleanup(): Promise<void> {
  await Promise.all(
    [...tasks].map(async (task) => {
      try {
        await task();
      } catch (error) {
        logger.warn("Falha ao limpar dados da sessão", { error });
      }
    }),
  );
}
