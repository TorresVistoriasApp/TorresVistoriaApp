import { Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Política de Privacidade — {APP_NAME}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none space-y-4 text-sm text-muted-foreground dark:prose-invert">
        <p>Última atualização: junho de 2026</p>

        <section>
          <h2 className="text-base font-semibold text-foreground">1. Controlador</h2>
          <p>
            O {APP_NAME} trata dados pessoais no contexto de vistorias cautelares veiculares,
            em nome da empresa contratante (operador) e dos usuários autenticados da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">2. Dados coletados</h2>
          <ul className="list-disc pl-5">
            <li>Dados de cadastro: nome, e-mail, função</li>
            <li>Dados de vistoria: placa, chassi, cliente, fotos, checklist, laudos</li>
            <li>Dados técnicos: logs de auditoria, IP (quando registrado no backend)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">3. Finalidade e base legal</h2>
          <p>
            Execução de contrato (prestação do serviço de vistoria), legítimo interesse
            (segurança e auditoria) e consentimento quando aplicável (cookies não essenciais).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">4. Seus direitos (LGPD)</h2>
          <ul className="list-disc pl-5">
            <li>Confirmação e acesso aos dados</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>Portabilidade (exportação em Configurações → Privacidade)</li>
            <li>Eliminação / anonimização (solicitação na mesma área)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">5. Retenção e segurança</h2>
          <p>
            Dados são armazenados no Supabase (PostgreSQL) com RLS, criptografia em trânsito (TLS)
            e soft delete. Laudos possuem hash de integridade para verificação pública.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">6. Contato</h2>
          <p>
            Dúvidas sobre privacidade: entre em contato com o administrador da sua empresa
            ou pelo e-mail cadastrado no sistema.
          </p>
        </section>

        <p>
          <Link to="/login" className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
