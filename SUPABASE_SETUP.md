# Macroservice V5.10 — teste da consulta por placa

## Edge Function
No Supabase:
1. Edge Functions > `consultar-placa` > Código
2. Substitua o `index.ts` pelo arquivo deste pacote
3. Clique em Deploy
4. Em Configurações, mantenha **Verificar JWT com segredo legado = DESATIVADO**

## Macroservice
Em Configurações:
- URL: https://ydimkvennwdyyizornpr.supabase.co
- A Publishable Key pode ficar salva, mas a V5.10 não a usa na consulta de homologação.
- Teste `ABC1234`.

## Segurança
Esta versão é somente para homologação (`homolog: true`).
Não altere para `homolog: false` ainda.
Antes da produção, a consulta será protegida com Supabase Auth e limite de uso.
