# Macroservice V5.11 — teste da consulta por placa

## Edge Function
No Supabase:
1. Abra **Edge Functions > consultar-placa > Código**.
2. Substitua o `index.ts` pelo arquivo `supabase/consultar-placa/index.ts` deste pacote.
3. Clique em **Deploy**.
4. Em Configurações, mantenha **Verificar JWT com segredo legado = DESATIVADO**.
5. Mantenha o Secret `APIBRASIL_TOKEN` configurado no Supabase. Não coloque esse token no GitHub.

## Como testar
No Macroservice, Administrador > Configurações:
- URL: `https://ydimkvennwdyyizornpr.supabase.co`
- Clique em **Testar consulta ABC1234**.

A V5.11 tenta POST simples e, se houver bloqueio CORS no navegador, usa automaticamente GET/JSONP.
A Edge Function deste pacote permanece com `homolog: true`.

## Segurança / produção
- Não coloque `APIBRASIL_TOKEN`, `service_role` ou `sb_secret_...` no front-end.
- A Publishable Key pode permanecer cadastrada para outras integrações, mas a consulta de homologação V5.11 não depende dela.
- **Não altere para `homolog: false` ainda.** Antes da produção, vamos ativar Supabase Auth, limitação de uso e então avaliar saldo/créditos do provedor.
