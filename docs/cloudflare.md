# Cloudflare na frente do Torres App

O Cloudflare protege o domínio. A Vercel continua hospedando o front. O browser fala com o Supabase direto (`*.supabase.co`) — auth, banco, storage e Edge Functions não passam pelo proxy.

```
Usuário
  → Cloudflare (DNS + SSL + WAF + DDoS + cache)
    → Vercel (React / Vite)
      → Supabase (Auth + DB + Storage + Functions)
```

Não coloque o proxy laranja na frente de `*.supabase.co`. Esse hostname não é seu; cache ou WAF aí quebra Realtime, auth e upload.

## 1. Conta e nameservers

1. Crie uma conta em [dash.cloudflare.com](https://dash.cloudflare.com) (plano Free já cobre WAF gerenciado, DDoS e SSL).
2. **Add a site** → `torresconsultas.com.br`.
3. Cloudflare mostra 2 nameservers. No registrador do domínio (Registro.br, GoDaddy, etc.), troque os NS pelos da Cloudflare.
4. Espere o status **Active** (minutos a algumas horas). O site antigo continua no ar até a troca propagar.

Na Vercel, **mantenha** `torresconsultas.com.br` e `www.torresconsultas.com.br` em Project Settings → Domains. O certificado da Vercel precisa continuar válido para o SSL Full (strict).

## 2. DNS (proxy laranja = proteção)

Em Cloudflare → DNS → Records:

| Tipo | Nome | Conteúdo | Proxy |
|------|------|----------|-------|
| CNAME | `www` | `cname.vercel-dns.com` | Laranja (Proxied) |
| CNAME | `@` (apex) | `cname.vercel-dns.com` | Laranja (CNAME flattening) |
| CNAME | `vistoria` | `cname.vercel-dns.com` | Laranja, só se esse host já existir na Vercel |

Registros de e-mail (`MX`, `TXT` SPF/DKIM) devem ficar **cinza** (DNS only). Proxy em MX quebra correio.

Confira se o redirect apex → www continua só no [`vercel.json`](../vercel.json). Não duplique o mesmo redirect no Cloudflare.

## 3. SSL/TLS

SSL/TLS → Overview:

- Modo: **Full (strict)**. Nunca use Flexible — gera loop de redirect e HTTP no trecho Cloudflare → Vercel.
- Edge Certificates: **Always Use HTTPS** ligado.
- Minimum TLS Version: **1.2**.
- TLS 1.3 ligado.

## 4. Desligar o que quebra SPA / PWA

Speed / Scrape Shield:

| Recurso | Estado | Motivo |
|---------|--------|--------|
| Rocket Loader | Off | Quebra o bundle React |
| Auto Minify JS/HTML | Off | Pode corromper o JS |
| Email Address Obfuscation | Off | Injeta script que o CSP bloqueia |
| Mirage | Off | Interferência em imagens |
| Browser Integrity Check | On | Ok |

## 5. Cache

O HTML autenticado **não** pode ser cacheado na borda. Os assets do Vite (`/assets/*`) podem: o filename já é hash.

Caching → Cache Rules (nessa ordem):

1. **Bypass HTML e SW**
   - When: URI Path starts with `/` **and** URI Path does not start with `/assets/`
   - Then: Cache eligibility = **Bypass**
2. **Cache assets hashed**
   - When: URI Path starts with `/assets/`
   - Then: Eligible for cache, Edge TTL = 1 year, Cache key = standard

O origin já envia `Cache-Control: max-age=0, must-revalidate` em `index.html` / `sw.js` e `immutable` em `/assets/` ([`vercel.json`](../vercel.json)).

Durante o cutover, ligue **Development Mode** (3h) para não servir HTML velho.

## 6. WAF e anti-bot

Security → WAF:

- **Cloudflare Managed Ruleset**: Enabled / Block.
- **OWASP Core Ruleset**: comece em **Log**, 24–48h. Se não houver falso positivo em login, upload e laudo, mude para Block.
- Security Level: **Medium**.

Security → Bots:

- **Bot Fight Mode** (Free): On. O CSP do app já libera `challenges.cloudflare.com`.

Security → WAF → Rate limiting rules (se o plano permitir):

| Caminho | Limite sugerido |
|---------|-----------------|
| `/login` | 10 req / 1 min / IP |
| `/consulta/login` | 10 req / 1 min / IP |
| `/recuperar-senha` | 5 req / 1 min / IP |

Não rate-limite `/assets/*`.

## 7. Testar depois do DNS Active

1. `https://www.torresconsultas.com.br` abre (cadeado válido).
2. `http://` redireciona para `https://`.
3. `https://torresconsultas.com.br` redireciona para `www`.
4. Login empresa e login consumidor.
5. Recuperar senha (e-mail + redirect).
6. Uma vistoria com foto (upload no Storage).
7. Dashboard (Realtime WebSocket no `*.supabase.co`).
8. Hard refresh duas vezes: o PWA não pode ficar preso em `index.html` antigo.
9. Em Cloudflare → Security → Events, confirme que o tráfego passa pelo proxy (não só DNS).

Se a tela ficar em branco: Rocket Loader ou Auto Minify ainda ligados, ou CSP bloqueando o challenge (veja o console).

Se login/auth falhar: SSL não está em Full (strict), ou o Host chegou na Vercel diferente do domínio cadastrado.

## 8. Turnstile (Camada 4) — ligar de verdade

O código do widget e a verificação nas Edges já existem. Ligar de verdade:

1. Cloudflare → Turnstile → **Add widget** (domínios `torresconsultas.com.br` + `vistoria.torresconsultas.com.br`).
2. Vercel → `VITE_TURNSTILE_SITE_KEY` = site key do widget (rebuild).
3. Supabase → `npx supabase secrets set TURNSTILE_SECRET_KEY=<secret>`.
4. Dashboard Supabase → Authentication → Attack Protection / Captcha: provider **Turnstile**, mesmo secret.
5. Só então: `npx supabase secrets set TURNSTILE_REQUIRED=true` e republicar as Edges.
   Sem esse flag, as Edges **não** derrubam cadastro/validação se o secret ainda não existir.
6. **Não** use `npx supabase config push` neste projeto (`config.toml` tem `env(SECRET)`).

Sem as duas chaves, o widget não aparece e o GoTrue não deve exigir captcha.

## 9. Fora deste desenho (depois)

- Domínio próprio na API (`api.torresconsultas.com.br` → Supabase) — exige plano Pro no Supabase, cache bypass total e cuidado com Realtime.
- Cloudflare Access só na área admin.
- Migrar o front da Vercel para Cloudflare Pages.

Nada disso é necessário para ter WAF/DDoS/SSL no domínio agora.
