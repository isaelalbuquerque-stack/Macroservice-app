# Macroservice V5.7 — configuração Supabase

1. Edge Functions > `consultar-placa` > **Código**:
   - Substitua o `index.ts` pelo arquivo incluído em `supabase/consultar-placa/index.ts`.
   - Faça **Deploy**.

2. Edge Functions > `consultar-placa` > **Configurações**:
   - DESATIVE **Verificar JWT com segredo legado**.
   - Salve.

3. Edge Functions > **Segredos**:
   - mantenha `APIBRASIL_TOKEN` configurado.

4. Macroservice > Administrador > Configurações:
   - URL do projeto: sua URL `https://...supabase.co`
   - Chave publicável: `sb_publishable_...`
   - Salve e use **Testar consulta ABC1234**.

A Publishable Key pode existir no front-end. Nunca coloque `APIBRASIL_TOKEN`, `sb_secret_...` ou `service_role` no GitHub.
