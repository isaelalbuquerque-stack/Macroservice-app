const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const homeView = $("#homeView");
const moduleView = $("#moduleView");
const moduleTitle = $("#moduleTitle");
const moduleSubtitle = $("#moduleSubtitle");
const moduleContent = $("#moduleContent");

const store = {
  get(key){ try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]} },
  set(key,val){ localStorage.setItem(key,JSON.stringify(val)) }
};

const money = v => Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function showModule(view){
  homeView.classList.remove("active");
  moduleView.classList.add("active");
  render(view);
}

function goHome(){
  moduleView.classList.remove("active");
  homeView.classList.add("active");
}

$$(".menu-card").forEach(btn=>btn.addEventListener("click",()=>showModule(btn.dataset.view)));
$("#backBtn").addEventListener("click",goHome);

function render(view){
  const map = {
    clientes: ["Clientes","Cadastro e consulta de clientes", renderClientes],
    veiculos: ["Veículos","Cadastro dos veículos atendidos", renderVeiculos],
    servicos: ["Serviços","Mão de obra e tempo estimado", renderServicos],
    pecas: ["Peças","Peças e valores estimados", renderPecas],
    orcamento: ["Orçamento Rápido","Cliente, veículo, serviços e peças", renderOrcamento],
    agendamento: ["Novo Agendamento","Organize data, horário e serviço", renderAgendamento],
    historico: ["Histórico / OS","Orçamentos e atendimentos salvos", renderHistorico],
    relatorios: ["Relatórios","Visão geral da oficina", renderRelatorios],
    configuracoes: ["Configurações","Dados da Macroservice", renderConfig]
  };
  const item = map[view] || map.clientes;
  moduleTitle.textContent=item[0]; moduleSubtitle.textContent=item[1]; item[2]();
}

function renderClientes(){
  const rows=store.get("macro_clientes");
  moduleContent.innerHTML = `
    <div class="form-grid">
      <label>Nome completo<input id="clienteNome" placeholder="Nome do cliente"></label>
      <label>Telefone / WhatsApp<input id="clienteTelefone" type="tel" placeholder="(93) 99999-9999"></label>
      <button class="primary-btn" id="saveCliente">Salvar cliente</button>
    </div>
    <div class="section-list">
      ${rows.length?rows.map(c=>`<div class="list-card"><strong>${c.nome}</strong><span class="muted">${c.telefone||"Sem telefone"}</span></div>`).join(""):`<div class="empty">Nenhum cliente cadastrado.</div>`}
    </div>`;
  $("#saveCliente").onclick=()=>{
    const nome=$("#clienteNome").value.trim(), telefone=$("#clienteTelefone").value.trim();
    if(!nome) return alert("Informe o nome do cliente.");
    rows.push({id:Date.now(),nome,telefone});
    store.set("macro_clientes",rows); renderClientes();
  };
}

function renderVeiculos(){
  const rows=store.get("macro_veiculos");
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Marca<input id="marca" placeholder="Ex.: Fiat"></label>
      <label>Modelo<input id="modelo" placeholder="Ex.: Strada"></label>
      <label>Ano<input id="ano" placeholder="Ex.: 2014"></label>
      <label>Motor<input id="motor" placeholder="Ex.: 1.4 Fire"></label>
      <label>Placa<input id="placa" placeholder="ABC1D23"></label>
      <button class="primary-btn" id="saveVeiculo">Salvar veículo</button>
    </div>
    <div class="section-list">${rows.length?rows.map(v=>`<div class="list-card"><strong>${v.marca} ${v.modelo}</strong><span class="muted">${v.ano||""} ${v.motor||""} ${v.placa?`• ${v.placa}`:""}</span></div>`).join(""):`<div class="empty">Nenhum veículo cadastrado.</div>`}</div>`;
  $("#saveVeiculo").onclick=()=>{
    const v={id:Date.now(),marca:$("#marca").value.trim(),modelo:$("#modelo").value.trim(),ano:$("#ano").value.trim(),motor:$("#motor").value.trim(),placa:$("#placa").value.trim()};
    if(!v.marca||!v.modelo) return alert("Informe marca e modelo.");
    rows.push(v); store.set("macro_veiculos",rows); renderVeiculos();
  };
}

function renderServicos(){
  const rows=store.get("macro_servicos");
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Serviço<input id="servicoNome" placeholder="Ex.: Troca de amortecedores"></label>
      <label>Mão de obra (R$)<input id="servicoValor" type="number" step="0.01" placeholder="300"></label>
      <label>Tempo estimado (h)<input id="servicoTempo" type="number" step="0.5" placeholder="2"></label>
      <button class="primary-btn" id="saveServico">Salvar serviço</button>
    </div>
    <div class="section-list">${rows.length?rows.map(s=>`<div class="list-card split"><div><strong>${s.nome}</strong><span class="muted">⏱ ${s.tempo||0} h</span></div><b>${money(s.valor)}</b></div>`).join(""):`<div class="empty">Nenhum serviço cadastrado.</div>`}</div>`;
  $("#saveServico").onclick=()=>{
    const s={id:Date.now(),nome:$("#servicoNome").value.trim(),valor:Number($("#servicoValor").value||0),tempo:Number($("#servicoTempo").value||0)};
    if(!s.nome) return alert("Informe o serviço.");
    rows.push(s); store.set("macro_servicos",rows); renderServicos();
  };
}

function renderPecas(){
  const rows=store.get("macro_pecas");
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Peça<input id="pecaNome" placeholder="Ex.: Pastilha de freio"></label>
      <label>Valor estimado (R$)<input id="pecaValor" type="number" step="0.01"></label>
      <label>Aplicação / observação<input id="pecaAplicacao" placeholder="Ex.: Gol G6 1.0"></label>
      <button class="primary-btn" id="savePeca">Salvar peça</button>
    </div>
    <div class="section-list">${rows.length?rows.map(p=>`<div class="list-card split"><div><strong>${p.nome}</strong><span class="muted">${p.aplicacao||""}</span></div><b>${money(p.valor)}</b></div>`).join(""):`<div class="empty">Nenhuma peça cadastrada.</div>`}</div>`;
  $("#savePeca").onclick=()=>{
    const p={id:Date.now(),nome:$("#pecaNome").value.trim(),valor:Number($("#pecaValor").value||0),aplicacao:$("#pecaAplicacao").value.trim()};
    if(!p.nome) return alert("Informe a peça.");
    rows.push(p); store.set("macro_pecas",rows); renderPecas();
  };
}

function options(rows, labelFn){ return `<option value="">Selecione</option>`+rows.map(r=>`<option value="${r.id}">${labelFn(r)}</option>`).join(""); }

function renderOrcamento(){
  const clientes=store.get("macro_clientes"), veiculos=store.get("macro_veiculos"), servicos=store.get("macro_servicos"), pecas=store.get("macro_pecas");
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Cliente<select id="orcCliente">${options(clientes,c=>c.nome)}</select></label>
      <label>Veículo<select id="orcVeiculo">${options(veiculos,v=>`${v.marca} ${v.modelo} ${v.placa||""}`)}</select></label>
      <label>Serviço<select id="orcServico">${options(servicos,s=>`${s.nome} - ${money(s.valor)}`)}</select></label>
      <button class="secondary-btn" id="addServico">Adicionar serviço</button>
      <label>Peça<select id="orcPeca">${options(pecas,p=>`${p.nome} - ${money(p.valor)}`)}</select></label>
      <button class="secondary-btn" id="addPeca">Adicionar peça</button>
      <div id="orcItens" class="section-list"></div>
      <div class="total-box">
        <div>Mão de obra: <b id="totMO">R$ 0,00</b></div>
        <div>Peças: <b id="totPecas">R$ 0,00</b></div>
        <div>Tempo estimado: <b id="totTempo">0 h</b></div>
        <div class="total" id="totGeral">R$ 0,00</div>
      </div>
      <button class="primary-btn" id="salvarOrcamento">Salvar orçamento</button>
    </div>`;
  const itens=[]; const draw=()=>{
    $("#orcItens").innerHTML=itens.length?itens.map(i=>`<div class="list-card split"><div><strong>${i.nome}</strong><span class="muted">${i.tipo}</span></div><b>${money(i.valor)}</b></div>`).join(""):`<div class="empty">Adicione serviços e peças.</div>`;
    const mo=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+b.valor,0), pp=itens.filter(i=>i.tipo==="Peça").reduce((a,b)=>a+b.valor,0), t=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+(b.tempo||0),0);
    $("#totMO").textContent=money(mo); $("#totPecas").textContent=money(pp); $("#totTempo").textContent=t+" h"; $("#totGeral").textContent=money(mo+pp);
  }; draw();
  $("#addServico").onclick=()=>{const s=servicos.find(x=>String(x.id)===$("#orcServico").value); if(s){itens.push({tipo:"Serviço",nome:s.nome,valor:Number(s.valor||0),tempo:Number(s.tempo||0)}); draw();}};
  $("#addPeca").onclick=()=>{const p=pecas.find(x=>String(x.id)===$("#orcPeca").value); if(p){itens.push({tipo:"Peça",nome:p.nome,valor:Number(p.valor||0)}); draw();}};
  $("#salvarOrcamento").onclick=()=>{
    if(!itens.length) return alert("Adicione ao menos um item.");
    const cliente=clientes.find(x=>String(x.id)===$("#orcCliente").value), veiculo=veiculos.find(x=>String(x.id)===$("#orcVeiculo").value);
    const total=itens.reduce((a,b)=>a+b.valor,0), tempo=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+(b.tempo||0),0);
    const hist=store.get("macro_historico"); hist.unshift({id:Date.now(),data:new Date().toLocaleString("pt-BR"),cliente:cliente?.nome||"Cliente não informado",veiculo:veiculo?`${veiculo.marca} ${veiculo.modelo}`:"Veículo não informado",total,tempo,itens});
    store.set("macro_historico",hist); alert("Orçamento salvo."); renderHistorico();
  };
}

function renderAgendamento(){
  const clientes=store.get("macro_clientes"), veiculos=store.get("macro_veiculos"), ag=store.get("macro_agendamentos");
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Cliente<select id="agCliente">${options(clientes,c=>c.nome)}</select></label>
      <label>Veículo<select id="agVeiculo">${options(veiculos,v=>`${v.marca} ${v.modelo}`)}</select></label>
      <label>Data<input id="agData" type="date"></label>
      <label>Horário<input id="agHora" type="time"></label>
      <label>Serviço solicitado<textarea id="agObs" placeholder="Descreva o serviço"></textarea></label>
      <button class="primary-btn" id="saveAg">Confirmar agendamento</button>
    </div>`;
  $("#saveAg").onclick=()=>{
    const cliente=clientes.find(x=>String(x.id)===$("#agCliente").value), veiculo=veiculos.find(x=>String(x.id)===$("#agVeiculo").value);
    const item={id:Date.now(),cliente:cliente?.nome||"Não informado",veiculo:veiculo?`${veiculo.marca} ${veiculo.modelo}`:"Não informado",data:$("#agData").value,hora:$("#agHora").value,obs:$("#agObs").value.trim()};
    if(!item.data||!item.hora) return alert("Informe data e horário.");
    ag.unshift(item); store.set("macro_agendamentos",ag); alert("Agendamento salvo.");
  };
}

function renderHistorico(){
  const hist=store.get("macro_historico");
  moduleContent.innerHTML=`<div class="section-list">${hist.length?hist.map(h=>`<div class="list-card"><strong>${h.cliente}</strong><div>${h.veiculo}</div><span class="muted">${h.data} • ${h.tempo||0} h</span><div style="margin-top:6px;font-weight:900;color:#ff8a00">${money(h.total)}</div></div>`).join(""):`<div class="empty">Nenhum orçamento salvo.</div>`}</div>`;
}

function renderRelatorios(){
  const c=store.get("macro_clientes").length,v=store.get("macro_veiculos").length,s=store.get("macro_servicos").length,h=store.get("macro_historico");
  const faturamento=h.reduce((a,b)=>a+Number(b.total||0),0);
  moduleContent.innerHTML=`<div class="section-list">
    <div class="list-card split"><strong>Clientes</strong><b>${c}</b></div>
    <div class="list-card split"><strong>Veículos</strong><b>${v}</b></div>
    <div class="list-card split"><strong>Serviços cadastrados</strong><b>${s}</b></div>
    <div class="list-card split"><strong>Orçamentos salvos</strong><b>${h.length}</b></div>
    <div class="total-box"><div class="total">${money(faturamento)}</div><div class="muted">Soma dos orçamentos salvos</div></div>
  </div>`;
}

function renderConfig(){
  moduleContent.innerHTML=`<div class="form-grid">
    <label>Empresa<input value="Macroservice Inteligência Automotiva" readonly></label>
    <label>Cidade<input value="Juruti - PA" readonly></label>
    <button class="danger-btn" id="clearData">Limpar dados de teste</button>
  </div>`;
  $("#clearData").onclick=()=>{if(confirm("Apagar todos os dados salvos neste aparelho?")){["macro_clientes","macro_veiculos","macro_servicos","macro_pecas","macro_historico","macro_agendamentos"].forEach(k=>localStorage.removeItem(k)); alert("Dados apagados.");}};
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error));
}
