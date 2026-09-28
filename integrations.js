/* Macroservice App V5.5 — integrações externas
   Preencha estes dados para ativar os recursos online.
   Não coloque senhas privadas de servidor neste arquivo público do GitHub Pages. */
window.MACROSERVICE_INTEGRATIONS = {
  google: {
    // Client ID OAuth 2.0 do tipo "Aplicativo da Web".
    // Ex.: 1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
    clientId: ""
  },
  plateLookup: {
    // Endpoint de um provedor de consulta veicular autorizado.
    // Use {plate} no endereço para o app substituir pela placa.
    // Ex.: https://api.seuprovedor.com/veiculo/{plate}
    endpoint: "",
    // Opcional. Use somente tokens próprios para front-end, quando o provedor permitir.
    token: "",
    tokenHeader: "Authorization",
    tokenPrefix: "Bearer ",
    additionalHeaders: {}
  }
};
