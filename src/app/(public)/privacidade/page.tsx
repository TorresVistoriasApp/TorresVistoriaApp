import { Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Page() {
  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Termos de Uso e LGPD
        </p>
        <CardTitle>Termos de Uso e Política de Privacidade do {APP_NAME}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-foreground">
          Este documento estabelece as condições de uso da plataforma {APP_NAME} e informa, de
          forma clara e objetiva, como dados pessoais são tratados em conformidade com a Lei Geral
          de Proteção de Dados (Lei nº 13.709/2018).
        </p>

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Última atualização: junho de 2026
        </p>

        <section>
          <h2 className="text-base font-semibold text-foreground">1. Aceitação dos termos</h2>
          <p>
            Ao acessar ou utilizar a plataforma, o usuário declara estar ciente destes Termos de
            Uso e da Política de Privacidade. Caso não concorde com alguma condição, o acesso não
            deverá ser utilizado.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">2. Finalidade da plataforma</h2>
          <p>
            O {APP_NAME} é uma solução destinada à gestão de vistorias cautelares veiculares,
            incluindo cadastro de clientes e veículos, registro fotográfico, checklist técnico,
            emissão de laudos, controles financeiros e recursos administrativos relacionados à
            operação.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">3. Acesso e responsabilidades</h2>
          <p>
            O acesso à plataforma é restrito a usuários autorizados pela empresa contratante. Cada
            usuário é responsável por manter suas credenciais em sigilo e por utilizar o sistema
            apenas para finalidades legítimas, profissionais e compatíveis com suas permissões.
          </p>
          <ul className="list-disc pl-5">
            <li>Não compartilhar login, senha ou acesso com terceiros.</li>
            <li>Inserir informações verdadeiras, completas e pertinentes à vistoria.</li>
            <li>Respeitar as permissões de acesso definidas para cada perfil.</li>
            <li>Comunicar qualquer suspeita de uso indevido ou acesso não autorizado.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">4. Dados pessoais tratados</h2>
          <p>
            Para viabilizar a prestação dos serviços, a plataforma pode tratar dados pessoais e
            informações vinculadas à vistoria, conforme a necessidade operacional:
          </p>
          <ul className="list-disc pl-5">
            <li>Dados cadastrais de usuários: nome, e-mail, função e permissões de acesso.</li>
            <li>Dados de clientes envolvidos na vistoria: nome, documento e contato, quando informado.</li>
            <li>Dados do veículo: placa, chassi, características, situação e informações técnicas.</li>
            <li>Registros da vistoria: fotos, checklist, observações, parecer técnico e laudos.</li>
            <li>Registros operacionais necessários para segurança, auditoria e rastreabilidade.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">5. Bases legais e finalidades</h2>
          <p>
            O tratamento de dados ocorre para execução de contrato, cumprimento de obrigações
            legais ou regulatórias, exercício regular de direitos, prevenção a fraudes, segurança
            da operação, legítimo interesse e, quando aplicável, consentimento do titular.
          </p>
          <p>Os dados podem ser utilizados para:</p>
          <ul className="list-disc pl-5">
            <li>Registrar, acompanhar e documentar vistorias cautelares.</li>
            <li>Emitir laudos, relatórios e evidências técnicas.</li>
            <li>Controlar acessos, permissões e atividades administrativas.</li>
            <li>Atender solicitações de suporte, auditoria, segurança e conformidade.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">6. Compartilhamento de dados</h2>
          <p>
            Os dados podem ser acessados pela empresa contratante, usuários autorizados e
            prestadores essenciais à operação da plataforma, sempre observados critérios de
            segurança, confidencialidade e necessidade. Não comercializamos dados pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">7. Segurança e confidencialidade</h2>
          <p>
            Adotamos medidas técnicas e administrativas para proteger dados contra acessos não
            autorizados, uso indevido, perda, alteração ou divulgação indevida. Entre essas medidas
            estão controle de acesso por perfil, autenticação, rastreabilidade de operações,
            políticas de permissão e boas práticas de segurança da informação.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">8. Retenção e descarte</h2>
          <p>
            Os dados são mantidos pelo período necessário para cumprir as finalidades da plataforma,
            obrigações legais, contratuais, regulatórias e exercício regular de direitos. Quando não
            forem mais necessários, poderão ser eliminados, anonimizados ou mantidos de forma segura
            quando houver base legal aplicável.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">9. Direitos dos titulares (LGPD)</h2>
          <p>
            Nos termos da LGPD, titulares de dados pessoais podem solicitar, quando aplicável:
          </p>
          <ul className="list-disc pl-5">
            <li>Confirmação da existência de tratamento e acesso aos dados.</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Anonimização, bloqueio ou eliminação, quando cabível.</li>
            <li>Portabilidade dos dados, observadas as regras aplicáveis.</li>
            <li>Informações sobre compartilhamento e critérios de tratamento.</li>
            <li>Revogação de consentimento, quando o tratamento depender dessa base legal.</li>
          </ul>
          <p>
            Solicitações podem ser realizadas pelos canais administrativos disponibilizados pela
            empresa contratante ou pela área de privacidade da plataforma, quando disponível ao
            usuário autenticado.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">10. Cookies e tecnologias similares</h2>
          <p>
            Podemos utilizar cookies e tecnologias similares necessários ao funcionamento da
            plataforma, autenticação, segurança, preferências do usuário e melhoria da experiência.
            Cookies não essenciais poderão depender de consentimento, quando aplicável.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">11. Alterações destes termos</h2>
          <p>
            Estes Termos de Uso e Política de Privacidade poderão ser atualizados para refletir
            melhorias da plataforma, mudanças operacionais ou exigências legais. A versão vigente
            estará sempre disponível nesta página.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">12. Contato</h2>
          <p>
            Em caso de dúvidas sobre estes termos, privacidade ou proteção de dados, entre em
            contato com o administrador responsável pela sua empresa ou pelo canal oficial
            disponibilizado pela operação contratante.
          </p>
        </section>

        <p className="border-t border-border pt-4">
          <Link to={ROUTES.login} className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
