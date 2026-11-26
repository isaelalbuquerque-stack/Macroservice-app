const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function javascript(callback: string, data: unknown, status = 200) {
  return new Response(
    `${callback}(${JSON.stringify(data)});`,
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

function validCallback(name: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]{0,80}$/.test(name);
}

Deno.serve(async (req) => {
  /*
    MACROSERVICE V5.11 - HOMOLOGAÇÃO

    - "Verificar JWT com segredo legado" deve ficar DESATIVADO.
    - Aceita GET/JSONP para eliminar CORS no navegador.
    - NÃO altere homolog:true para false nesta versão pública.
  */

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let placa = "";
    let callback = "";

    if (req.method === "GET") {
      const url = new URL(req.url);
      placa = url.searchParams.get("placa") || "";
      callback = url.searchParams.get("callback") || "";

      // Abrir a URL sem parâmetros continua servindo como teste de saúde.
      if (!placa) {
        return json(
          {
            sucesso: false,
            erro: "Informe ?placa=ABC1234 ou use POST.",
          },
          400,
        );
      }

      if (callback && !validCallback(callback)) {
        return json(
          {
            sucesso: false,
            erro: "Callback inválido.",
          },
          400,
        );
      }
    } else if (req.method === "POST") {
      const texto = await req.text();
      const body = texto ? JSON.parse(texto) : {};
      placa = body?.placa || "";
    } else {
      return json(
        {
          sucesso: false,
          erro: "Método não permitido. Use GET ou POST.",
        },
        405,
      );
    }

    const placaLimpa = String(placa)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaLimpa)) {
      const out = {
        sucesso: false,
        erro: "Placa inválida.",
        exemplo: "ABC1234 ou ABC1D23",
      };

      return callback
        ? javascript(callback, out, 200)
        : json(out, 400);
    }

    const token = Deno.env.get("APIBRASIL_TOKEN");

    if (!token) {
      const out = {
        sucesso: false,
        erro: "APIBRASIL_TOKEN não configurado nos Secrets do Supabase.",
      };

      return callback
        ? javascript(callback, out, 200)
        : json(out, 500);
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

    let bruto: any;

    try {
      bruto = await resposta.json();
    } catch {
      const out = {
        sucesso: false,
        erro: "A APIBrasil retornou uma resposta inválida.",
        status: resposta.status,
      };

      return callback
        ? javascript(callback, out, 200)
        : json(out, resposta.ok ? 502 : resposta.status);
    }

    if (!resposta.ok || bruto?.error === true) {
      const out = {
        sucesso: false,
        placa: placaLimpa,
        erro: bruto?.message || "Falha na consulta veicular.",
        status: resposta.status,
      };

      return callback
        ? javascript(callback, out, 200)
        : json(out, resposta.status || 502);
    }

    const dados = bruto?.data || {};
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
        combustivel:
          veiculo.combustivel ||
          principal.combustivel ||
          "",
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

    return callback
      ? javascript(callback, retorno, 200)
      : json(retorno, 200);
  } catch (error) {
    const out = {
      sucesso: false,
      erro: "Erro interno na consulta.",
      detalhe:
        error instanceof Error
          ? error.message
          : String(error),
    };

    const url = new URL(req.url);
    const callback = url.searchParams.get("callback") || "";

    return callback && validCallback(callback)
      ? javascript(callback, out, 200)
      : json(out, 500);
  }
});
