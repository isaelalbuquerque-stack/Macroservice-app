/* Macroservice App V5.6 — integrações externas
   IMPORTANTE:
   - A chave publicável do Supabase pode ser usada no front-end.
   - NUNCA coloque APIBRASIL_TOKEN, service_role ou qualquer chave secreta aqui.
   - O token da APIBrasil permanece protegido em Supabase > Edge Functions > Secrets. */
window.MACROSERVICE_INTEGRATIONS = {
  google: {
    // Client ID OAuth 2.0 do tipo "Aplicativo da Web" (opcional por enquanto).
    clientId: ""
  },

  supabase: {
    // Projeto criado para o Macroservice.
    url: "https://ydimkvennwdyvizornpr.supabase.co",

    // Cole aqui SOMENTE a Publishable Key (sb_publishable_...).
    // Ela também pode ser salva pela tela Configurações do administrador.
    publishableKey: ""
  },

  plateLookup: {
    mode: "supabase-edge",
    endpoint: "https://ydimkvennwdyvizornpr.supabase.co/functions/v1/consultar-placa"
  }
};
