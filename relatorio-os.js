// Sessão da IA válida só nesta página e neste projeto Supabase.
let reportSession = null;
function forgetReportSession() { reportSession = null; }

function maintenanceFields() {
  const value = id => document.getElementById(id).value.trim();
  return {
    diagnostico: value("manDiag"),
    testes: [1, 2, 3].map(i => ({nome: value("t" + i + "n"), resultado: value("t" + i + "r")})),
    execucao: value("manExec"),
    recomendacoes: value("manRec"),
    proximaRevisao: value("manProx")
  };
}

function reportFacts(base) {
  const fields = maintenanceFields();
  const year = String(base.anoFipe || "").match(/\b(?:19|20)\d{2}\b/);
  return {
    veiculo: [base.marca, base.modelo, base.motor, year?.[0]].filter(Boolean).join(" "),
    ...fields,
    testes: fields.testes.filter(test => test.nome || test.resultado)
  };
}

function localReport(facts) {
  const tests = facts.testes.map(t => [t.nome, t.resultado].filter(Boolean).join(" — ")).join("\n");
  const sections = [
    ["Diagnóstico inicial", facts.diagnostico], ["Testes e medições", tests],
    ["Serviços executados", facts.execucao], ["Recomendações", facts.recomendacoes],
    ["Próxima revisão", facts.proximaRevisao]
  ];
  return sections.filter(([, v]) => v).map(([title, v]) => title + "\n" + v).join("\n\n");
}

function reportPanel() {
  return `<section class="report-panel form-grid" aria-labelledby="reportTitle">
    <h3 id="reportTitle">Relatório para o cliente</h3>
    <p>Use o diagnóstico, as medições e os serviços registrados acima. Confira o texto antes de salvar a OS.</p>
    <div class="actions">
      <button type="button" class="primary-btn" id="reportGenerate">Gerar relatório com IA</button>
      <button type="button" class="secondary-btn" id="reportLocal">Organizar sem IA</button>
    </div>
    <div id="reportAccess" class="form-grid" hidden>
      <p>Entre com a conta da oficina cadastrada no Supabase para gerar o relatório.</p>
      <label>E-mail da oficina<input type="email" id="reportEmail" autocomplete="username"></label>
      <label>Senha da conta da oficina<input type="password" id="reportPassword" autocomplete="current-password"></label>
      <button type="button" class="primary-btn" id="reportLogin">Entrar e gerar relatório</button>
    </div>
    <div id="reportStatus" role="status" aria-live="polite"></div>
    <label>Texto para o cliente<textarea id="reportText" rows="6" placeholder="Escreva aqui ou gere um rascunho com os dados da ficha."></textarea></label>
  </section>`;
}

function reportConfig() {
  const config = supabaseIntegration();
  let url;
  try { url = new URL(config.url); } catch { /* Validado abaixo. */ }
  if (!url || url.protocol !== "https:" || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
      url.port || url.username || url.password || !/^sb_publishable_[\w-]+$/.test(config.publishableKey || "")) {
    throw new Error("Em Configurações, salve a URL e a chave publicável do projeto Supabase da oficina. Você também pode usar Organizar sem IA.");
  }
  return { origin: url.origin, key: config.publishableKey };
}

async function generateReport(facts, config, token, signal) {
  const response = await fetch(config.origin + "/functions/v1/relatorio-os-", {
    method: "POST", signal, redirect: "error",
    headers: {"Content-Type": "application/json", apikey: config.key, Authorization: "Bearer " + token},
    body: JSON.stringify(facts)
  });
  if (response.status === 401) {
    forgetReportSession();
    throw new Error("A sessão expirou. Toque em Gerar relatório com IA e entre novamente.");
  }
  if (response.status === 403) forgetReportSession();
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.relatorio !== "string" || !data.relatorio.trim()) {
    throw new Error(data.erro || (response.status === 404
      ? "Confira a função relatorio-os- no Supabase para ativar a IA."
      : "Não foi possível gerar o relatório agora. Sua ficha continua disponível."));
  }
  return data.relatorio.trim();
}

function bindReportPanel(dadosDaOS) {
  const text = $("#reportText"), status = $("#reportStatus"), access = $("#reportAccess");
  const generate = $("#reportGenerate"), local = $("#reportLocal"), login = $("#reportLogin");
  const email = $("#reportEmail"), password = $("#reportPassword");
  let busy = false;
  async function run(mode) {
    if (busy) return;
    const facts = reportFacts(dadosDaOS());
    const localText = localReport(facts);
    if (!localText) {
      status.textContent = "Registre pelo menos um sintoma, medição, serviço ou recomendação na ficha.";
      return;
    }
    const previous = text.value;
    const startingSession = getSession();
    const visible = () => text.isConnected && moduleView.classList.contains("active") &&
      startingSession?.role === "admin" && getSession()?.role === "admin";
    busy = true;
    generate.disabled = local.disabled = login.disabled = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      let result = localText;
      if (mode !== "local") {
        const config = reportConfig();
        if (reportSession?.origin !== config.origin || !(reportSession?.expires > Date.now() + 5000)) forgetReportSession();
        if (!reportSession) {
          access.hidden = false;
          if (mode !== "login") {
            status.textContent = "Acesso da oficina necessário para usar a IA.";
            email.focus();
            return;
          }
          if (!email.value.trim() || !password.value) throw new Error("Preencha o e-mail e a senha da conta da oficina.");
          status.textContent = "Conectando à conta da oficina…";
          const response = await fetch(config.origin + "/auth/v1/token?grant_type=password", {
            method: "POST", redirect: "error", signal: controller.signal,
            headers: {apikey: config.key, "Content-Type": "application/json"},
            body: JSON.stringify({email: email.value.trim(), password: password.value})
          });
          password.value = "";
          const auth = await response.json().catch(() => ({}));
          if (!response.ok || !auth.access_token) throw new Error("Falha ao entrar na conta da oficina. Confira o e-mail, a senha e a configuração do Supabase.");
          if (!visible()) return;
          reportSession = {origin: config.origin, token: auth.access_token, expires: Date.now() + Number(auth.expires_in || 3600) * 1000};
        }
        access.hidden = true;
        status.textContent = "Gerando o relatório com a IA…";
        result = await generateReport(facts, config, reportSession.token, controller.signal);
      }
      if (!visible()) return;
      if (JSON.stringify(reportFacts(dadosDaOS())) !== JSON.stringify(facts) || text.value !== previous) {
        status.textContent = "A ficha mudou durante a geração. Confira suas alterações e gere o texto novamente.";
        return;
      }
      if (previous.trim() && !confirm("Substituir o texto para o cliente pelo novo rascunho?")) {
        status.textContent = "Texto anterior mantido.";
        return;
      }
      text.value = result;
      status.textContent = mode === "local" ? "Texto organizado no aparelho. Revise antes de salvar." : "Rascunho da IA pronto para sua revisão.";
    } catch (err) {
      if (visible()) status.textContent = err.name === "AbortError" ? "Tempo de espera esgotado. Tente novamente ou use Organizar sem IA."
        : err instanceof TypeError ? "Sem conexão com o servidor. Você pode usar Organizar sem IA." : err.message;
    } finally {
      clearTimeout(timer);
      busy = false;
      generate.disabled = local.disabled = login.disabled = false;
    }
  }
  generate.onclick = () => run("online");
  login.onclick = () => run("login");
  local.onclick = () => run("local");
}
