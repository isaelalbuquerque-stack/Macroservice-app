const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const authView = $("#authView");
const homeView = $("#homeView");
const moduleView = $("#moduleView");
const moduleTitle = $("#moduleTitle");
const moduleSubtitle = $("#moduleSubtitle");
const moduleContent = $("#moduleContent");

const store = {
  get(key, fallback=[]){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
};

const money = v => Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const uid = () => Date.now() + Math.floor(Math.random()*9999);

const MARCAS = ["Fiat","Volkswagen","Chevrolet","Ford","Toyota","Nissan","Mitsubishi","Hyundai","Honda","Jeep","Renault","Peugeot","Citroën","Caoa Chery","Mercedes-Benz","BMW","Audi","Kia","Suzuki","JAC","RAM","Volvo","Outra"];
const TIPOS = ["Motor","Suspensão","Freios","Direção","Transmissão / Embreagem","Elétrica / Eletrônica","Injeção Eletrônica","Ar-condicionado","Arrefecimento","Alinhamento","Balanceamento","Revisão preventiva","Scanner / Diagnóstico","Pneus / Borracharia","Outro"];
const SERVICOS_BASE = [
  {nome:"Scanner / diagnóstico",tipo:"Scanner / Diagnóstico",valor:130,tempo:1},
  {nome:"Alinhamento",tipo:"Alinhamento",valor:60,tempo:1},
  {nome:"Balanceamento",tipo:"Balanceamento",valor:80,tempo:1},
  {nome:"Limpeza de bicos",tipo:"Injeção Eletrônica",valor:120,tempo:1.5},
  {nome:"Troca de amortecedores (par)",tipo:"Suspensão",valor:300,tempo:2},
  {nome:"Troca de kit de embreagem",tipo:"Transmissão / Embreagem",valor:350,tempo:4},
  {nome:"Troca de junta do cabeçote",tipo:"Motor",valor:800,tempo:8},
  {nome:"Troca de pastilhas de freio",tipo:"Freios",valor:80,tempo:1}
];

const SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"];

function getSession(){ return store.get("macro_session", null); }
function setSession(s){ store.set("macro_session", s); }
function clearSession(){ localStorage.removeItem("macro_session"); }

function showOnly(el){
  [authView,homeView,moduleView].forEach(v=>v.classList.remove("active"));
  el.classList.add("active");
}

function init(){
  seedServices();
  const s = getSession();
  if (s) renderHome();
  else renderAuth("cliente");
}

function seedServices(){
  const atual = store.get("macro_servicos");
  if (!atual.length) store.set("macro_servicos", SERVICOS_BASE.map((s,i)=>({id:i+1,...s})));
}

function renderAuth(tab="cliente"){
  showOnly(authView);
  authView.innerHTML = `
    <div class="auth-card">
      <h2>Bem-vindo à Macroservice</h2>
      <p>Entre ou faça seu cadastro para continuar.</p>

      <div class="auth-tabs">
        <button class="auth-tab ${tab==="cliente"?"active":""}" id="tabCliente">Cliente</button>
        <button class="auth-tab ${tab==="admin"?"active":""}" id="tabAdmin">Administrador</button>
      </div>

      ${tab==="cliente" ? `
        <div class="form-grid">
          <label>Nome completo<input id="cadNome" placeholder="Seu nome"></label>
          <label>Telefone / WhatsApp<input id="cadTelefone" type="tel" placeholder="(93) 99999-9999"></label>
          <label>Senha<input id="cadSenha" type="password" placeholder="Crie uma senha"></label>
          <button class="primary-btn" id="cadCliente">Cadastrar e entrar</button>
          <div class="notice">Nesta versão de demonstração, o cadastro fica salvo neste aparelho. A sincronização entre celulares entra com o banco online.</div>
        </div>` : `
        <div class="form-grid">
          <label>Usuário administrador<input id="adminUser" value="admin" autocomplete="username"></label>
          <label>Senha<input id="adminPass" type="password" placeholder="Senha do administrador" autocomplete="current-password"></label>
          <button class="primary-btn" id="entrarAdmin">Entrar como administrador</button>
          <div class="notice">Demonstração: usuário <b>admin</b> e senha <b>macroservice2026</b>. Antes do uso real, o login será movido para autenticação online segura.</div>
        </div>`}
    </div>`;

  $("#tabCliente").onclick=()=>renderAuth("cliente");
  $("#tabAdmin").onclick=()=>renderAuth("admin");

  if(tab==="cliente"){
    $("#cadCliente").onclick=()=>{
      const nome=$("#cadNome").value.trim();
      const telefone=$("#cadTelefone").value.trim();
      const senha=$("#cadSenha").value.trim();
      if(!nome||!telefone||!senha) return alert("Preencha nome, telefone e senha.");
      const clientes=store.get("macro_clientes");
      let cli=clientes.find(c=>c.telefone===telefone);
      if(!cli){ cli={id:uid(),nome,telefone,senha}; clientes.push(cli); store.set("macro_clientes",clientes); }
      setSession({role:"cliente",id:cli.id,nome:cli.nome,telefone:cli.telefone});
      renderHome();
    };
  }else{
    $("#entrarAdmin").onclick=()=>{
      if($("#adminUser").value.trim()==="admin" && $("#adminPass").value==="macroservice2026"){
        setSession({role:"admin",nome:"Administrador"});
        renderHome();
      } else alert("Usuário ou senha incorretos.");
    };
  }
}

function renderHome(){
  const s=getSession();
  if(!s) return renderAuth();
  showOnly(homeView);

  const solicitacoes=store.get("macro_solicitacoes");
  const novas=solicitacoes.filter(x=>x.status==="pendente").length;

  const cardsAdmin = `
    <button class="menu-card" data-view="solicitacoes"><span class="menu-icon">🔔</span><strong>Serviços Solicitados</strong>${novas?`<span class="badge">${novas}</span>`:""}</button>
    <button class="menu-card" data-view="agendamento"><span class="menu-icon">📅</span><strong>Agenda</strong></button>
    <button class="menu-card" data-view="orcamento"><span class="menu-icon">📄</span><strong>Orçamento Rápido</strong></button>
    <button class="menu-card" data-view="clientes"><span class="menu-icon">👥</span><strong>Clientes</strong></button>
    <button class="menu-card" data-view="veiculos"><span class="menu-icon">🚗</span><strong>Veículos</strong></button>
    <button class="menu-card" data-view="servicos"><span class="menu-icon">🛠️</span><strong>Serviços</strong></button>
    <button class="menu-card" data-view="pecas"><span class="menu-icon">⚙️</span><strong>Peças</strong></button>
    <button class="menu-card" data-view="historico"><span class="menu-icon">🕘</span><strong>Histórico</strong></button>
    <button class="menu-card" data-view="relatorios"><span class="menu-icon">📊</span><strong>Relatórios</strong></button>
    <button class="menu-card" data-view="configuracoes"><span class="menu-icon">⚙️</span><strong>Configurações</strong></button>`;

  const cardsCliente = `
    <button class="menu-card" data-view="solicitar"><span class="menu-icon">🛠️</span><strong>Solicitar Serviço</strong></button>
    <button class="menu-card" data-view="meusPedidos"><span class="menu-icon">📋</span><strong>Meus Pedidos</strong></button>
    <button class="menu-card" data-view="meusVeiculos"><span class="menu-icon">🚗</span><strong>Meus Veículos</strong></button>
    <button class="menu-card" data-view="meusOrcamentos"><span class="menu-icon">📄</span><strong>Meus Orçamentos</strong></button>`;

  homeView.innerHTML=`
    <div class="profile-strip">
      <div><strong>${s.role==="admin"?"Administrador":"Olá, "+s.nome+"!"}</strong><br><small>${s.role==="admin"?"Painel administrativo":"Área do cliente"}</small></div>
      <button class="link-btn" id="logoutBtn">Sair</button>
    </div>
    <div class="welcome">
      <h2>${s.role==="admin"?"Painel da Oficina":"Bem-vindo! 👋"}</h2>
      <p>${s.role==="admin"?"Controle de solicitações, agenda e orçamento.":"Solicite serviços e acompanhe seus pedidos."}</p>
    </div>
    <div class="dashboard-grid">${s.role==="admin"?cardsAdmin:cardsCliente}</div>`;

  $("#logoutBtn").onclick=()=>{clearSession();renderAuth();};
  $$(".menu-card").forEach(b=>b.onclick=()=>showModule(b.dataset.view));
}

function showModule(view){
  showOnly(moduleView);
  render(view);
}
$("#backBtn").onclick=()=>renderHome();

function render(view){
  const map={
    solicitar:["Solicitar Serviço","Escolha veículo, serviço, data e horário",renderSolicitar],
    meusPedidos:["Meus Pedidos","Acompanhe suas solicitações",renderMeusPedidos],
    meusVeiculos:["Meus Veículos","Cadastre os veículos que você utiliza",renderMeusVeiculos],
    meusOrcamentos:["Meus Orçamentos","Orçamentos vinculados ao seu cadastro",renderMeusOrcamentos],
    solicitacoes:["Serviços Solicitados","Solicitações recebidas dos clientes",renderSolicitacoesAdmin],
    agendamento:["Agenda","Horários reservados e disponíveis",renderAgendaAdmin],
    orcamento:["Orçamento Rápido","Cliente, veículo, serviços e peças",renderOrcamento],
    clientes:["Clientes","Cadastro e consulta de clientes",renderClientes],
    veiculos:["Veículos","Cadastro dos veículos atendidos",renderVeiculos],
    servicos:["Serviços","Mão de obra e tempo estimado",renderServicos],
    pecas:["Peças","Peças e valores estimados",renderPecas],
    historico:["Histórico / OS","Orçamentos e atendimentos salvos",renderHistorico],
    relatorios:["Relatórios","Visão geral da oficina",renderRelatorios],
    configuracoes:["Configurações","Dados e regras da Macroservice",renderConfig]
  };
  const item=map[view]||map.solicitar;
  moduleTitle.textContent=item[0]; moduleSubtitle.textContent=item[1]; item[2]();
}

function renderMeusVeiculos(){
  const s=getSession();
  let veiculos=store.get("macro_veiculos");
  const meus=veiculos.filter(v=>v.clienteId===s.id);
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Marca<select id="marca">${MARCAS.map(m=>`<option>${m}</option>`).join("")}</select></label>
      <label>Modelo<input id="modelo" placeholder="Ex.: Strada"></label>
      <label>Ano<input id="ano" placeholder="Ex.: 2014"></label>
      <label>Motor<input id="motor" placeholder="Ex.: 1.4 Fire"></label>
      <label>Placa<input id="placa" placeholder="ABC1D23"></label>
      <button class="primary-btn" id="saveMeuVeiculo">Salvar veículo</button>
    </div>
    <div class="section-list">${meus.length?meus.map(v=>`<div class="list-card"><strong>${v.marca} ${v.modelo}</strong><span class="muted">${v.ano||""} ${v.motor||""} ${v.placa?`• ${v.placa}`:""}</span></div>`).join(""):`<div class="empty">Nenhum veículo cadastrado.</div>`}</div>`;
  $("#saveMeuVeiculo").onclick=()=>{
    const v={id:uid(),clienteId:s.id,marca:$("#marca").value,modelo:$("#modelo").value.trim(),ano:$("#ano").value.trim(),motor:$("#motor").value.trim(),placa:$("#placa").value.trim()};
    if(!v.modelo) return alert("Informe o modelo.");
    veiculos.push(v);store.set("macro_veiculos",veiculos);renderMeusVeiculos();
  };
}

function servicosDisponiveis(){
  return store.get("macro_servicos").length ? store.get("macro_servicos") : SERVICOS_BASE;
}

function overlaps(aStart,aDur,bStart,bDur){
  const toM=t=>{const [h,m]=t.split(":").map(Number);return h*60+m};
  const as=toM(aStart), ae=as+aDur*60, bs=toM(bStart), be=bs+bDur*60;
  return as<be && bs<ae;
}

function slotBusy(date,time,duration,ignoreId=null){
  const reqs=store.get("macro_solicitacoes").filter(r=>r.id!==ignoreId && r.data===date && ["pendente","aceito"].includes(r.status));
  return reqs.some(r=>overlaps(time,duration,r.hora,Number(r.tempo||1)));
}

function renderSolicitar(){
  const s=getSession();
  const veiculos=store.get("macro_veiculos").filter(v=>v.clienteId===s.id);
  const servicos=servicosDisponiveis();
  moduleContent.innerHTML=`
    <div class="form-grid">
      <label>Veículo<select id="solVeiculo"><option value="">Selecione</option>${veiculos.map(v=>`<option value="${v.id}">${v.marca} ${v.modelo}${v.placa?" - "+v.placa:""}</option>`).join("")}</select></label>
      <label>Tipo de serviço<select id="solTipo"><option value="">Selecione</option>${TIPOS.map(t=>`<option>${t}</option>`).join("")}</select></label>
      <label>Serviço<select id="solServico"><option value="">Selecione</option>${servicos.map(x=>`<option value="${x.id}">${x.nome} • ${x.tempo} h</option>`).join("")}</select></label>
      <label>Data<input id="solData" type="date"></label>
      <div><label>Horários disponíveis</label><div class="slot-grid" id="slotGrid"></div></div>
      <label>Observações<textarea id="solObs" placeholder="Descreva o problema ou serviço desejado"></textarea></label>
      <button class="primary-btn" id="enviarSolicitacao">Enviar solicitação</button>
      ${!veiculos.length?`<div class="notice">Cadastre primeiro um veículo em “Meus Veículos”.</div>`:""}
    </div>`;

  let selectedSlot="";
  function drawSlots(){
    selectedSlot="";
    const data=$("#solData").value;
    const srv=servicos.find(x=>String(x.id)===$("#solServico").value);
    const dur=Number(srv?.tempo||1);
    $("#slotGrid").innerHTML=SLOTS.map(t=>{
      const busy=data?slotBusy(data,t,dur):false;
      return `<button type="button" class="slot ${busy?"busy":""}" data-time="${t}" ${busy?"disabled":""}>${t}</button>`;
    }).join("");
    $$("#slotGrid .slot:not(.busy)").forEach(btn=>btn.onclick=()=>{
      $$("#slotGrid .slot").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");selectedSlot=btn.dataset.time;
    });
  }
  $("#solData").onchange=drawSlots;
  $("#solServico").onchange=drawSlots;
  drawSlots();

  $("#enviarSolicitacao").onclick=()=>{
    const veiculo=veiculos.find(v=>String(v.id)===$("#solVeiculo").value);
    const servico=servicos.find(x=>String(x.id)===$("#solServico").value);
    if(!veiculo||!servico||!$("#solData").value||!selectedSlot) return alert("Selecione veículo, serviço, data e horário.");
    const tempo=Number(servico.tempo||1);
    if(slotBusy($("#solData").value,selectedSlot,tempo)) return alert("Esse horário acabou de ficar indisponível. Escolha outro.");
    const reqs=store.get("macro_solicitacoes");
    reqs.unshift({id:uid(),clienteId:s.id,cliente:s.nome,telefone:s.telefone,veiculoId:veiculo.id,veiculo:`${veiculo.marca} ${veiculo.modelo}`,tipo:$("#solTipo").value||servico.tipo||"Outro",servico:servico.nome,valorEstimado:Number(servico.valor||0),tempo,data:$("#solData").value,hora:selectedSlot,obs:$("#solObs").value.trim(),status:"pendente",criadoEm:new Date().toLocaleString("pt-BR")});
    store.set("macro_solicitacoes",reqs);
    alert("Solicitação enviada. O horário ficou reservado enquanto aguarda análise.");
    renderMeusPedidos();
  };
}

function renderMeusPedidos(){
  const s=getSession();
  const rows=store.get("macro_solicitacoes").filter(r=>r.clienteId===s.id);
  moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(r=>`
    <div class="list-card">
      <div class="split"><strong>${r.servico}</strong><span class="status status-${r.status}">${r.status.toUpperCase()}</span></div>
      <div>${r.veiculo}</div>
      <span class="muted">${r.data} às ${r.hora} • ${r.tempo} h</span>
      ${r.obs?`<div class="muted" style="margin-top:6px">${r.obs}</div>`:""}
    </div>`).join(""):`<div class="empty">Nenhuma solicitação enviada.</div>`}</div>`;
}

function renderSolicitacoesAdmin(){
  let rows=store.get("macro_solicitacoes");
  moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(r=>`
    <div class="list-card">
      <div class="split"><strong>${r.cliente}</strong><span class="status status-${r.status}">${r.status.toUpperCase()}</span></div>
      <div>${r.veiculo}</div>
      <div><b>${r.servico}</b> • ${r.tipo}</div>
      <span class="muted">${r.data} às ${r.hora} • ${r.tempo} h • ${r.telefone||""}</span>
      ${r.obs?`<div class="muted" style="margin-top:6px">${r.obs}</div>`:""}
      ${r.status==="pendente"?`<div class="actions">
        <button class="primary-btn" data-accept="${r.id}">Aceitar</button>
        <button class="danger-btn" data-reject="${r.id}">Recusar</button>
      </div>`:""}
      ${r.status==="aceito"?`<div class="actions"><button class="secondary-btn" data-done="${r.id}">Concluir</button></div>`:""}
    </div>`).join(""):`<div class="empty">Nenhuma solicitação recebida.</div>`}</div>`;

  $$("[data-accept]").forEach(b=>b.onclick=()=>updateReq(Number(b.dataset.accept),"aceito"));
  $$("[data-reject]").forEach(b=>b.onclick=()=>updateReq(Number(b.dataset.reject),"recusado"));
  $$("[data-done]").forEach(b=>b.onclick=()=>updateReq(Number(b.dataset.done),"concluido"));
}
function updateReq(id,status){
  const rows=store.get("macro_solicitacoes");
  const r=rows.find(x=>x.id===id); if(r) r.status=status;
  store.set("macro_solicitacoes",rows); renderSolicitacoesAdmin();
}

function renderAgendaAdmin(){
  const rows=store.get("macro_solicitacoes").filter(r=>["pendente","aceito"].includes(r.status)).sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora));
  moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(r=>`
    <div class="list-card"><div class="split"><strong>${r.data} • ${r.hora}</strong><span class="status status-${r.status}">${r.status}</span></div><div>${r.cliente} — ${r.veiculo}</div><span class="muted">${r.servico} • ${r.tempo} h</span></div>`).join(""):`<div class="empty">Nenhum horário reservado.</div>`}</div>`;
}

function renderClientes(){
  const rows=store.get("macro_clientes");
  moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(c=>`<div class="list-card"><strong>${c.nome}</strong><span class="muted">${c.telefone||"Sem telefone"}</span></div>`).join(""):`<div class="empty">Nenhum cliente cadastrado.</div>`}</div>`;
}
function renderVeiculos(){
  const rows=store.get("macro_veiculos");
  moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(v=>`<div class="list-card"><strong>${v.marca} ${v.modelo}</strong><span class="muted">${v.ano||""} ${v.motor||""} ${v.placa?`• ${v.placa}`:""}</span></div>`).join(""):`<div class="empty">Nenhum veículo cadastrado.</div>`}</div>`;
}
function renderServicos(){
  const rows=store.get("macro_servicos");
  moduleContent.innerHTML=`<div class="form-grid">
    <label>Serviço<input id="srvNome"></label><label>Tipo<select id="srvTipo">${TIPOS.map(t=>`<option>${t}</option>`).join("")}</select></label>
    <label>Mão de obra (R$)<input id="srvValor" type="number" step="0.01"></label><label>Tempo estimado (h)<input id="srvTempo" type="number" step="0.5"></label>
    <button class="primary-btn" id="saveSrv">Salvar serviço</button></div>
    <div class="section-list">${rows.map(s=>`<div class="list-card split"><div><strong>${s.nome}</strong><span class="muted">${s.tipo||""} • ${s.tempo} h</span></div><b>${money(s.valor)}</b></div>`).join("")}</div>`;
  $("#saveSrv").onclick=()=>{const r=store.get("macro_servicos");const x={id:uid(),nome:$("#srvNome").value.trim(),tipo:$("#srvTipo").value,valor:Number($("#srvValor").value||0),tempo:Number($("#srvTempo").value||1)};if(!x.nome)return alert("Informe o serviço.");r.push(x);store.set("macro_servicos",r);renderServicos();};
}
function renderPecas(){
  const rows=store.get("macro_pecas");
  moduleContent.innerHTML=`<div class="form-grid"><label>Peça<input id="pecNome"></label><label>Valor estimado (R$)<input id="pecValor" type="number" step="0.01"></label><label>Aplicação<input id="pecAplicacao"></label><button class="primary-btn" id="savePec">Salvar peça</button></div><div class="section-list">${rows.length?rows.map(p=>`<div class="list-card split"><div><strong>${p.nome}</strong><span class="muted">${p.aplicacao||""}</span></div><b>${money(p.valor)}</b></div>`).join(""):`<div class="empty">Nenhuma peça cadastrada.</div>`}</div>`;
  $("#savePec").onclick=()=>{const r=store.get("macro_pecas");const p={id:uid(),nome:$("#pecNome").value.trim(),valor:Number($("#pecValor").value||0),aplicacao:$("#pecAplicacao").value.trim()};if(!p.nome)return alert("Informe a peça.");r.push(p);store.set("macro_pecas",r);renderPecas();};
}
function options(rows,labelFn){return `<option value="">Selecione</option>`+rows.map(r=>`<option value="${r.id}">${labelFn(r)}</option>`).join("");}
function renderOrcamento(){
  const clientes=store.get("macro_clientes"),servicos=store.get("macro_servicos"),pecas=store.get("macro_pecas");
  moduleContent.innerHTML=`<div class="form-grid">
    <label>Cliente<select id="orcCliente">${options(clientes,c=>c.nome)}</select></label>
    <label>Marca<select id="orcMarca"><option value="">Selecione</option>${MARCAS.map(m=>`<option>${m}</option>`).join("")}</select></label>
    <label>Modelo<input id="orcModelo"></label>
    <label>Tipo de serviço<select id="orcTipo"><option value="">Selecione</option>${TIPOS.map(t=>`<option>${t}</option>`).join("")}</select></label>
    <label>Serviço<select id="orcServico">${options(servicos,s=>`${s.nome} - ${money(s.valor)}`)}</select></label>
    <button class="secondary-btn" id="addSrv">Adicionar serviço</button>
    <label>Peça<select id="orcPeca">${options(pecas,p=>`${p.nome} - ${money(p.valor)}`)}</select></label>
    <button class="secondary-btn" id="addPec">Adicionar peça</button>
    <div id="orcItens" class="section-list"></div><div class="total-box"><div>Mão de obra: <b id="totMO">R$ 0,00</b></div><div>Peças: <b id="totP">R$ 0,00</b></div><div>Tempo: <b id="totT">0 h</b></div><div class="total" id="totG">R$ 0,00</div></div>
    <button class="primary-btn" id="saveOrc">Salvar orçamento</button></div>`;
  const itens=[];const draw=()=>{const mo=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+b.valor,0),pp=itens.filter(i=>i.tipo==="Peça").reduce((a,b)=>a+b.valor,0),tt=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+b.tempo,0);$("#orcItens").innerHTML=itens.length?itens.map(i=>`<div class="list-card split"><div><strong>${i.nome}</strong><span class="muted">${i.tipo}</span></div><b>${money(i.valor)}</b></div>`).join(""):`<div class="empty">Adicione serviços e peças.</div>`;$("#totMO").textContent=money(mo);$("#totP").textContent=money(pp);$("#totT").textContent=tt+" h";$("#totG").textContent=money(mo+pp);};draw();
  $("#addSrv").onclick=()=>{const s=servicos.find(x=>String(x.id)===$("#orcServico").value);if(s){itens.push({tipo:"Serviço",nome:s.nome,valor:Number(s.valor),tempo:Number(s.tempo)});draw();}};
  $("#addPec").onclick=()=>{const p=pecas.find(x=>String(x.id)===$("#orcPeca").value);if(p){itens.push({tipo:"Peça",nome:p.nome,valor:Number(p.valor),tempo:0});draw();}};
  $("#saveOrc").onclick=()=>{const c=clientes.find(x=>String(x.id)===$("#orcCliente").value);if(!c||!$("#orcMarca").value||!$("#orcModelo").value.trim()||!itens.length)return alert("Preencha cliente, veículo e itens.");const hist=store.get("macro_historico");hist.unshift({id:uid(),clienteId:c.id,cliente:c.nome,veiculo:`${$("#orcMarca").value} ${$("#orcModelo").value.trim()}`,data:new Date().toLocaleString("pt-BR"),total:itens.reduce((a,b)=>a+b.valor,0),tempo:itens.reduce((a,b)=>a+b.tempo,0),itens});store.set("macro_historico",hist);alert("Orçamento salvo.");renderHistorico();};
}
function renderMeusOrcamentos(){const s=getSession();const h=store.get("macro_historico").filter(x=>x.clienteId===s.id);moduleContent.innerHTML=`<div class="section-list">${h.length?h.map(x=>`<div class="list-card"><strong>${x.veiculo}</strong><span class="muted">${x.data}</span><div style="margin-top:6px;color:#ff8a00;font-weight:900">${money(x.total)}</div></div>`).join(""):`<div class="empty">Nenhum orçamento disponível.</div>`}</div>`;}
function renderHistorico(){const h=store.get("macro_historico");moduleContent.innerHTML=`<div class="section-list">${h.length?h.map(x=>`<div class="list-card"><strong>${x.cliente}</strong><div>${x.veiculo}</div><span class="muted">${x.data} • ${x.tempo||0} h</span><div style="margin-top:6px;color:#ff8a00;font-weight:900">${money(x.total)}</div></div>`).join(""):`<div class="empty">Nenhum orçamento salvo.</div>`}</div>`;}
function renderRelatorios(){const req=store.get("macro_solicitacoes"),h=store.get("macro_historico");moduleContent.innerHTML=`<div class="section-list"><div class="list-card split"><strong>Clientes</strong><b>${store.get("macro_clientes").length}</b></div><div class="list-card split"><strong>Solicitações pendentes</strong><b>${req.filter(x=>x.status==="pendente").length}</b></div><div class="list-card split"><strong>Agendadas</strong><b>${req.filter(x=>x.status==="aceito").length}</b></div><div class="list-card split"><strong>Orçamentos</strong><b>${h.length}</b></div><div class="total-box"><div class="total">${money(h.reduce((a,b)=>a+Number(b.total||0),0))}</div><div class="muted">Soma dos orçamentos salvos</div></div></div>`;}
function renderConfig(){moduleContent.innerHTML=`<div class="form-grid"><div class="notice">Horários padrão: 08:00, 09:00, 10:00, 11:00, 13:00, 14:00, 15:00 e 16:00. Solicitações pendentes e aceitas bloqueiam automaticamente o intervalo conforme a duração do serviço.</div><button class="danger-btn" id="clearData">Limpar dados de demonstração</button></div>`;$("#clearData").onclick=()=>{if(confirm("Apagar dados locais deste aparelho?")){["macro_clientes","macro_veiculos","macro_servicos","macro_pecas","macro_historico","macro_solicitacoes"].forEach(k=>localStorage.removeItem(k));clearSession();init();}};}

if ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error));
init();
