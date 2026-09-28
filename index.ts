const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return new Response(JSON.stringify({ sucesso:false, erro:"Método não permitido. Use POST." }), { status:405, headers:{...corsHeaders,"Content-Type":"application/json"} });
    const body = await req.json();
    const placaLimpa = String(body?.placa || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaLimpa)) return new Response(JSON.stringify({ sucesso:false, erro:"Placa inválida.", exemplo:"ABC1234 ou ABC1D23" }), { status:400, headers:{...corsHeaders,"Content-Type":"application/json"} });
    const token = Deno.env.get("APIBRASIL_TOKEN");
    if (!token) return new Response(JSON.stringify({ sucesso:false, erro:"APIBRASIL_TOKEN não configurado." }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"} });
    const resposta = await fetch("https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits", { method:"POST", headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}, body:JSON.stringify({tipo:"fipe",placa:placaLimpa,homolog:true}) });
    const bruto = await resposta.json();
    if (!resposta.ok || bruto?.error === true) return new Response(JSON.stringify({ sucesso:false, placa:placaLimpa, erro:bruto?.message || "Falha na consulta veicular.", status:resposta.status }), { status:resposta.status, headers:{...corsHeaders,"Content-Type":"application/json"} });
    const dados = bruto?.data?.data;
    const opcoesFipe = Array.isArray(dados?.data) ? dados.data : [];
    const veiculo = dados?.veiculo || {};
    const principal = opcoesFipe.find((item) => item.principal === true) || opcoesFipe[0] || {};
    const retorno = {
      sucesso:true, placa:placaLimpa, homologacao:bruto?.homolog === true,
      veiculo:{ marca:principal.marca||"", modelo:principal.modelo||"", anoFabricacao:principal.anoFabricacao||"", anoModelo:principal.anoModelo||"", combustivel:veiculo.combustivel||principal.combustivel||"", cilindradas:veiculo.cilindradas||"", potenciaCv:veiculo.potencia||"", cor:veiculo.cor||"", chassiParcial:veiculo.chassi||"", especie:veiculo.especie||"", tipoVeiculo:veiculo.tipo_veiculo||"", nacionalidade:veiculo.nacionalidade||"", lugares:veiculo.quantidade_lugares||"", municipio:veiculo.municipio||"", uf:veiculo.uf||"" },
      fipe:{ codigo:principal.codigoFipe||"", valor:principal.valor||null, mesReferencia:principal.mesReferencia||"", url:principal.url||"" },
      opcoesFipe:opcoesFipe.map(item=>({ principal:item.principal===true, marca:item.marca||"", modelo:item.modelo||"", anoFabricacao:item.anoFabricacao||"", anoModelo:item.anoModelo||"", combustivel:item.combustivel||"", codigoFipe:item.codigoFipe||"", valor:item.valor||null, mesReferencia:item.mesReferencia||"" }))
    };
    return new Response(JSON.stringify(retorno), { status:200, headers:{...corsHeaders,"Content-Type":"application/json"} });
  } catch (error) {
    return new Response(JSON.stringify({ sucesso:false, erro:"Erro interno na consulta.", detalhe:error instanceof Error?error.message:String(error) }), { status:500, headers:{...corsHeaders,"Content-Type":"application/json"} });
  }
});
