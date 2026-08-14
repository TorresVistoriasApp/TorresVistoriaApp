-- Job diário: remove contas B2C com exclusão vencida (carência de 90 dias).
-- Horário: 03:00 UTC (~00:00 horário de Brasília).

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $schedule$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
    RAISE NOTICE 'pg_cron indisponível neste ambiente — job não agendado.';
    RETURN;
  END IF;

  BEGIN
    PERFORM cron.unschedule('finalize-expired-consumer-accounts-daily');
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  PERFORM cron.schedule(
    'finalize-expired-consumer-accounts-daily',
    '0 3 * * *',
    $$SELECT public.finalize_expired_consumer_accounts()$$
  );
END;
$schedule$;
