# LGPD — Torres Vistoria

## Conformidade implementada

| Requisito | Como atendemos |
|-----------|----------------|
| **Transparência** | Política em `/privacidade` + banner de consentimento |
| **Consentimento** | Banner LGPD (`LgpdConsentBanner`) — cookies essenciais vs todos |
| **Acesso** | Usuário autenticado vê perfil e dados no app |
| **Portabilidade** | Configurações → Privacidade → Exportar JSON |
| **Eliminação** | Configurações → Privacidade → Solicitar exclusão (anonimização) |
| **Auditoria** | Tabela `audit_logs` + trigger em alterações sensíveis |
| **Minimização** | Soft delete (`deleted_at`), RLS por `company_id` |

## Fluxo de exclusão

1. Usuário confirma em Configurações → Privacidade
2. RPC `anonymize_user_account` anonimiza `profiles.full_name`
3. Sessão encerrada via `signOut`
4. Evento registrado em `audit_logs`

> Vistorias, laudos e registros financeiros **não são apagados** — retidos por obrigação legal/contratual. Apenas o perfil do usuário é anonimizado.

## Dados pessoais tratados

- Titulares: usuários do sistema e clientes das vistorias (nome, documento, contato)
- Operador: empresa contratante (`companies`)
- Suboperador: provedor de infraestrutura em nuvem (ver DPA do contrato)

## Contato DPO

Definir e-mail do encarregado no contrato com cada empresa cliente.
