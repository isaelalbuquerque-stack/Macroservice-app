const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getAcceptedPublishableKeys(): string[] {
  const keys: string[] = [];

  try {
    const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}";
    const parsed = JSON.parse(raw);
    for (const value of Object.values(parsed)) {
      if (typeof value === "string" && value) keys.push(value);
    }
  } catch {
    // continua para compatibilidade com a chave legada
  }

  const legacyAnon = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnon) keys.push(legacyAnon);

  return keys;
}

Deno.serve(async (req) => {
  // IMPORTANTE:
  // No Dashboard da função, deixe "Verificar JWT com segredo legado" DESATIVADO.
  // Esta função valida a chave publicável pelo header "apikey".
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json(
        { sucesso: false, erro: "Método não permitido. Use POST." },
        405,
      );
    }

    const apiKey = req.headers.get("apikey") || "";
    const acceptedKeys = getAcceptedPublishableKeys();

    if (!apiKey || !acceptedKeys.includes(apiKey)) {
      return json(
        { sucesso: false, erro: "Chave publicável do Supabase inválida ou ausente." },
        401,
      );
    }

    const body = await req.json();

    const placaLimpa = String(body?.placa || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaLimpa)) {
      return json(
        {
          sucesso: false,
          erro: "Placa inválida.",
          exemplo: "ABC1234 ou ABC1D23",
        },
        400,
      );
    }

    const token = Deno.env.get("APIBRASIL_TOKEN");

    if (!token) {
      return json(
        {
          sucesso: false,
          erro: "APIBRASIL_TOKEN não configurado nos Secrets do Supabase.",
        },
        500,
      );
    }

    const resposta = await fetch(
      "https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "fipe",
          placa: placaLimpa,
          homolog: true,
        }),
      },
    );

    let bruto: any = null;

    try {
      bruto = await resposta.json();
    } catch {
      return json(
        {
          sucesso: false,
          erro: "A APIBrasil retornou uma resposta inválida.",
          status: resposta.status,
        },
        resposta.ok ? 502 : resposta.status,
      );
    }

    if (!resposta.ok || bruto?.error === true) {
      return json(
        {
          sucesso: false,
          placa: placaLimpa,
          erro: bruto?.message || "Falha na consulta veicular.",
          status: resposta.status,
        },
        resposta.status || 502,
      );
    }

    const dados = bruto?.data?.data;
    const opcoesFipe = Array.isArray(dados?.data) ? dados.data : [];
    const veiculo = dados?.veiculo || {};
    const principal =
      opcoesFipe.find((item: any) => item?.principal === true) ||
      opcoesFipe[0] ||
      {};

    const retorno = {
      sucesso: true,
      placa: placaLimpa,
      homologacao: bruto?.homolog === true,
      veiculo: {
        marca: principal.marca || "",
        modelo: principal.modelo || "",
        anoFabricacao: principal.anoFabricacao || "",
        anoModelo: principal.anoModelo || "",
        combustivel: veiculo.combustivel || principal.combustivel || "",
        cilindradas: veiculo.cilindradas || "",
        potenciaCv: veiculo.potencia || "",
        cor: veiculo.cor || "",
        chassiParcial: veiculo.chassi || "",
        especie: veiculo.especie || "",
        tipoVeiculo: veiculo.tipo_veiculo || "",
        nacionalidade: veiculo.nacionalidade || "",
        lugares: veiculo.quantidade_lugares || "",
        municipio: veiculo.municipio || "",
        uf: veiculo.uf || "",
      },
      fipe: {
        codigo: principal.codigoFipe || "",
        valor: principal.valor || null,
        mesReferencia: principal.mesReferencia || "",
        url: principal.url || "",
      },
      opcoesFipe: opcoesFipe.map((item: any) => ({
        principal: item?.principal === true,
        marca: item?.marca || "",
        modelo: item?.modelo || "",
        anoFabricacao: item?.anoFabricacao || "",
        anoModelo: item?.anoModelo || "",
        combustivel: item?.combustivel || "",
        codigoFipe: item?.codigoFipe || "",
        valor: item?.valor || null,
        mesReferencia: item?.mesReferencia || "",
      })),
    };

    return json(retorno);
  } catch (error) {
    return json(
      {
        sucesso: false,
        erro: "Erro interno na consulta.",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
