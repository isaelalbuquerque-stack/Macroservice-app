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
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  },
  set(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
};

const money = v => Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const uid = () => Date.now() + Math.floor(Math.random()*9999);
const esc = v => String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

const MARCAS = Object.keys(VEHICLE_LIBRARY);
const TIPOS = SERVICE_CATEGORIES;
const SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"];

function getSession(){ return store.get("macro_session", null); }
function setSession(s){ store.set("macro_session", s); }
function clearSession(){ localStorage.removeItem("macro_session"); }
function getRememberedAuth(){ return store.get("macro_auth_remember", null); }
function setRememberedAuth(v){ store.set("macro_auth_remember", v); }
function clearRememberedAuth(){ localStorage.removeItem("macro_auth_remember"); }
function setAuthScreenMode(active){ document.body.classList.toggle("auth-screen", !!active); }
function showOnly(el){ [authView,homeView,moduleView].forEach(v=>v.classList.remove("active")); el.classList.add("active"); }

function customServices(){ return store.get("macro_servicos_custom", []); }
function customParts(){ return store.get("macro_pecas_custom", []); }
function servicosDisponiveis(){ return [...CATALOG_SERVICES, ...customServices()]; }
function pecasDisponiveis(){ return [...CATALOG_PARTS, ...customParts()]; }

function init(){ migrateLegacyData(); const s=getSession(); if(s) renderHome(); else renderAuth("cliente"); }

function migrateLegacyData(){
  if(store.get("macro_catalog_migrated",false)) return;
  const legacySrv=store.get("macro_servicos",[]).filter(x=>x?.nome);
  const legacyPec=store.get("macro_pecas",[]).filter(x=>x?.nome);
  if(legacySrv.length && !customServices().length) store.set("macro_servicos_custom",legacySrv.map(x=>({...x,id:uid()+Math.floor(Math.random()*1000),catalogo:false})));
  if(legacyPec.length && !customParts().length) store.set("macro_pecas_custom",legacyPec.map(x=>({...x,id:uid()+Math.floor(Math.random()*1000),catalogo:false,categoria:x.categoria||"Personalizada",subcategoria:x.subcategoria||"Outros"})));
  store.set("macro_catalog_migrated",true);
}

function authFieldIcon(kind){
  const icons={
    user:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"/></svg>`,
    lock:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
    phone:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h3l1 5-2 1a15 15 0 0 0 6 6l1-2 5 1v3c0 2-2 4-4 4C9 20 4 15 3 7c0-2 2-4 4-4Z"/></svg>`,
    mail:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`
  };
  return icons[kind]||icons.user;
}
function openAuthModal(title, bodyHtml, submitLabel="Fechar", onSubmit=null){
  document.querySelector("#authModal")?.remove();
  const wrap=document.createElement("div");
  wrap.id="authModal";
  wrap.className="auth-modal-backdrop";
  wrap.innerHTML=`<div class="auth-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="auth-modal-close" id="authModalClose" aria-label="Fechar">×</button><h3>${esc(title)}</h3><div class="auth-modal-body">${bodyHtml}</div><div class="auth-modal-actions"><button class="primary-btn" id="authModalSubmit">${esc(submitLabel)}</button></div></div>`;
  document.body.appendChild(wrap);
  const close=()=>wrap.remove();
  $("#authModalClose").onclick=close;
  wrap.addEventListener("click",e=>{if(e.target===wrap)close();});
  $("#authModalSubmit").onclick=()=>{if(onSubmit)onSubmit(close);else close();};
  return wrap;
}

function googleIntegration(){ return window.MACROSERVICE_INTEGRATIONS?.google || {}; }
function plateIntegration(){ return window.MACROSERVICE_INTEGRATIONS?.plateLookup || {}; }
function normalizePlate(plate){ return String(plate||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,7); }
function decodeJwtPayload(token){
  try{
    const part=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
    const json=decodeURIComponent(atob(part).split("").map(c=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  }catch{return null;}
}
function handleGoogleCredentialResponse(response){
  const payload=decodeJwtPayload(response?.credential||"");
  if(!payload?.email){
    document.querySelector("#loginStatus") && (document.querySelector("#loginStatus").textContent="Não foi possível validar os dados da conta Google.");
    return;
  }
  const clientes=store.get("macro_clientes");
  let cli=clientes.find(c=>String(c.email||"").toLowerCase()===String(payload.email).toLowerCase());
  if(!cli){
    cli={id:uid(),nome:payload.name||payload.given_name||payload.email,email:payload.email,telefone:"",senha:"",provider:"google",googleSub:payload.sub||"",foto:payload.picture||""};
    clientes.push(cli);
  }else{
    cli.provider="google"; cli.googleSub=payload.sub||cli.googleSub||""; cli.foto=payload.picture||cli.foto||""; if(payload.name)cli.nome=payload.name;
  }
  store.set("macro_clientes",clientes);
  setSession({role:"cliente",id:cli.id,nome:cli.nome,telefone:cli.telefone||"",email:cli.email||"",provider:"google",foto:cli.foto||""});
  renderHome();
}
window.handleMacroserviceGoogleCredential=handleGoogleCredentialResponse;
function renderGoogleIdentityButton(attempt=0){
  const host=$("#googleOfficialButton"); if(!host)return;
  const cfg=googleIntegration();
  if(!cfg.clientId){
    host.innerHTML=`<button type="button" class="google-fallback-btn" id="googleSetupBtn"><img src="https://developers.google.com/static/identity/images/g-logo.png" alt=""><span>Continuar com Google</span></button><small class="integration-hint">Login Google ainda precisa do Client ID OAuth.</small>`;
    $("#googleSetupBtn").onclick=()=>openAuthModal("Ativar login Google",`<p>O botão agora usa a integração oficial do Google Identity Services.</p><p>Para entrar de verdade, adicione o <b>Client ID OAuth 2.0</b> em <code>integrations.js</code> e autorize o domínio do GitHub Pages no Google Cloud.</p><p>Depois disso, o próprio Google renderiza o botão e retorna a conta autenticada.</p>`,`Fechar`);
    return;
  }
  if(!window.google?.accounts?.id){ if(attempt<15)setTimeout(()=>renderGoogleIdentityButton(attempt+1),300); return; }
  host.innerHTML="";
  google.accounts.id.initialize({client_id:cfg.clientId,callback:handleGoogleCredentialResponse,auto_select:false,cancel_on_tap_outside:true});
  google.accounts.id.renderButton(host,{type:"standard",theme:"outline",size:"large",text:"continue_with",shape:"rectangular",logo_alignment:"left",width:Math.min(360,Math.max(250,host.clientWidth||340)),locale:"pt-BR"});
}
function normalizePlateResponse(raw,plate){
  const d=raw?.data||raw?.result||raw?.vehicle||raw||{};
  const pick=(...keys)=>{for(const k of keys){if(d?.[k]!=null&&d[k]!=="")return d[k];}return "";};
  const brand=pick("marca","brand","make","fabricante");
  const model=pick("modelo","model","vehicleModel");
  return {
    placa:normalizePlate(pick("placa","plate")||plate),
    marca:String(brand||"").trim(),modelo:String(model||"").trim(),
    versao:String(pick("versao","version","trim")||"").trim(),
    anoFabricacao:String(pick("anoFabricacao","ano_fabricacao","manufactureYear","year")||"").trim(),
    anoModelo:String(pick("anoModelo","ano_modelo","modelYear")||"").trim(),
    motor:String(pick("motor","engine","motorizacao","engineDescription")||"").trim(),
    codigoMotor:String(pick("codigoMotor","engineCode","motorCode")||"").trim(),
    combustivel:String(pick("combustivel","fuel","fuelType")||"").trim(),
    cambio:String(pick("cambio","transmissao","transmission")||"").trim(),
    chassi:String(pick("chassi","vin","VIN")||"").trim(),
    cor:String(pick("cor","color")||"").trim(),
    fipe:String(pick("fipe","codigoFipe","fipeCode")||"").trim(),
    fonteConsulta:"Consulta por placa"
  };
}
async function lookupVehiclePlate(plate){
  const cfg=plateIntegration(), clean=normalizePlate(plate);
  if(clean.length!==7)throw new Error("PLACA_INVALIDA");
  if(!cfg.endpoint)throw new Error("PLATE_API_NOT_CONFIGURED");
  const url=cfg.endpoint.includes("{plate}")?cfg.endpoint.replace("{plate}",encodeURIComponent(clean)):cfg.endpoint+(cfg.endpoint.includes("?")?"&":"?")+"plate="+encodeURIComponent(clean);
  const headers={Accept:"application/json",...(cfg.additionalHeaders||{})};
  if(cfg.token)headers[cfg.tokenHeader||"Authorization"]=(cfg.tokenPrefix??"Bearer ")+cfg.token;
  const res=await fetch(url,{headers});
  if(!res.ok)throw new Error("PLATE_API_"+res.status);
  return normalizePlateResponse(await res.json(),clean);
}
function vehicleFields(prefix,clientSelect=""){
  return `${clientSelect}<div class="plate-row"><label>Placa<input id="${prefix}Placa" maxlength="7" placeholder="ABC1D23" autocomplete="off"></label><button type="button" class="secondary-btn lookup-plate-btn" id="${prefix}Lookup">Consultar placa</button></div><div class="plate-status" id="${prefix}PlateStatus"></div>
  <label>Marca<select id="${prefix}Marca">${marcaOptions()}</select></label><label>Modelo<select id="${prefix}Modelo"><option value="">Selecione a marca</option></select></label>
  <label>Versão<input id="${prefix}Versao" placeholder="Ex.: Attack LE"></label><div class="two-cols"><label>Ano fabricação<input id="${prefix}AnoFab" placeholder="2012"></label><label>Ano modelo<input id="${prefix}AnoMod" placeholder="2013"></label></div>
  <label>Motor / motorização<input id="${prefix}Motor" placeholder="Ex.: 2.5 YD25"></label><label>Código do motor<input id="${prefix}CodMotor" placeholder="Ex.: YD25"></label>
  <div class="two-cols"><label>Combustível<input id="${prefix}Combustivel" placeholder="Diesel / Flex / Gasolina"></label><label>Câmbio<input id="${prefix}Cambio" placeholder="Manual / Automático / CVT"></label></div>
  <label>Chassi / VIN<input id="${prefix}Chassi" placeholder="Opcional, recomendado para peças"></label><div class="two-cols"><label>Cor<input id="${prefix}Cor"></label><label>Código FIPE<input id="${prefix}Fipe"></label></div>`;
}
function bindVehicleFields(prefix){ bindMarcaModelo($("#"+prefix+"Marca"),$("#"+prefix+"Modelo")); $("#"+prefix+"Placa").oninput=e=>e.target.value=normalizePlate(e.target.value); }
function fillVehicleFields(prefix,v){
  if(!v)return;
  const marcaSel=$("#"+prefix+"Marca"),modeloSel=$("#"+prefix+"Modelo");
  const rawMarca=String(v.marca||"").trim(), alias={"VW":"Volkswagen","VOLKSWAGEN - VW":"Volkswagen","GM":"Chevrolet","GM - CHEVROLET":"Chevrolet","MERCEDES BENZ":"Mercedes-Benz","MERCEDES-BENZ":"Mercedes-Benz","CAOA/CHERY":"Caoa Chery","CHERY":"Caoa Chery"};
  const matchedMarca=MARCAS.find(m=>m.toLowerCase()===rawMarca.toLowerCase())||alias[rawMarca.toUpperCase()]||rawMarca;
  $("#"+prefix+"Placa").value=v.placa||"";
  if(matchedMarca&&!MARCAS.includes(matchedMarca))marcaSel.insertAdjacentHTML("beforeend",`<option value="${esc(matchedMarca)}">${esc(matchedMarca)}</option>`);
  marcaSel.value=matchedMarca||"";
  modeloSel.innerHTML=modeloOptions(matchedMarca||"",v.modelo||"");
  if(v.modelo&&![...modeloSel.options].some(o=>o.value===v.modelo))modeloSel.insertAdjacentHTML("beforeend",`<option value="${esc(v.modelo)}">${esc(v.modelo)}</option>`);
  modeloSel.value=v.modelo||"";
  [["Versao","versao"],["AnoFab","anoFabricacao"],["AnoMod","anoModelo"],["Motor","motor"],["CodMotor","codigoMotor"],["Combustivel","combustivel"],["Cambio","cambio"],["Chassi","chassi"],["Cor","cor"],["Fipe","fipe"]].forEach(([a,b])=>{const el=$("#"+prefix+a);if(el)el.value=v[b]||"";});
}
function readVehicleFields(prefix){return {placa:normalizePlate($("#"+prefix+"Placa").value),marca:$("#"+prefix+"Marca").value,modelo:$("#"+prefix+"Modelo").value,versao:$("#"+prefix+"Versao").value.trim(),anoFabricacao:$("#"+prefix+"AnoFab").value.trim(),anoModelo:$("#"+prefix+"AnoMod").value.trim(),ano:[$("#"+prefix+"AnoFab").value.trim(),$("#"+prefix+"AnoMod").value.trim()].filter(Boolean).join("/"),motor:$("#"+prefix+"Motor").value.trim(),codigoMotor:$("#"+prefix+"CodMotor").value.trim(),combustivel:$("#"+prefix+"Combustivel").value.trim(),cambio:$("#"+prefix+"Cambio").value.trim(),chassi:$("#"+prefix+"Chassi").value.trim().toUpperCase(),cor:$("#"+prefix+"Cor").value.trim(),fipe:$("#"+prefix+"Fipe").value.trim()};}
function bindPlateLookup(prefix){
  $("#"+prefix+"Lookup").onclick=async()=>{const status=$("#"+prefix+"PlateStatus"),plate=normalizePlate($("#"+prefix+"Placa").value);status.textContent="Consultando...";status.className="plate-status";try{const data=await lookupVehiclePlate(plate);fillVehicleFields(prefix,data);status.textContent="Dados encontrados. Confira antes de salvar.";status.classList.add("ok");}catch(err){if(err.message==="PLATE_API_NOT_CONFIGURED"){status.textContent="Consulta por placa pronta, mas falta configurar o provedor em integrations.js.";openAuthModal("Consulta por placa",`<p>O cadastro já está preparado para preencher marca, modelo, versão, anos, motor, combustível, câmbio, chassi/VIN, cor e FIPE a partir da placa.</p><p>Para consultar dados reais precisamos conectar um provedor autorizado de dados veiculares. Configure o endpoint e a credencial em <code>integrations.js</code>.</p><p><b>Para cotação precisa de peças, a placa ajuda a identificar o veículo, mas VIN/chassi, código do motor e código OEM continuam sendo as referências mais seguras.</b></p>`,`Fechar`);}else status.textContent=err.message==="PLACA_INVALIDA"?"Informe uma placa com 7 caracteres.":"Não foi possível consultar a placa. Confira o provedor/conexão.";status.classList.add("error");}};
}
function openServiceProcedure(service){
  if(!service)return; const pr=window.getServiceProcedure?window.getServiceProcedure(service):null; if(!pr)return;
  const ol=arr=>`<ol class="procedure-list">${arr.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`, ul=arr=>`<ul class="procedure-list">${arr.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  openAuthModal(service.nome,`<div class="procedure-modal-content"><div class="procedure-time">⏱ Tempo estimado: <b>${pr.time} h</b></div><p>${esc(pr.objective)}</p><h4>Ferramentas</h4>${ul(pr.tools)}<h4>Segurança / preparação</h4>${ul(pr.safety)}<h4>Passo a passo</h4>${ol(pr.steps)}<h4>Conferências finais</h4>${ul(pr.checks)}<div class="procedure-note">${esc(pr.note)}</div></div>`,`Fechar`);
}

function renderAuth(tab="cliente", mode="login"){
  setAuthScreenMode(true);
  showOnly(authView);
  const remembered=getRememberedAuth()||{};
  const rememberedCliente=remembered.role==="cliente"?remembered:{};
  const rememberedAdmin=remembered.role==="admin"?remembered:{};
  const footer=`<div class="auth-brand-footer"><strong>MACROSERVICE</strong><span>Inteligência Automotiva</span><small>Juruti - PA • V5.5</small></div>`;
  const clientLogin=`<div class="form-grid auth-form">
    <label>Telefone ou e-mail<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("user")}</span><input id="clienteLoginId" placeholder="Usuário" value="${esc(rememberedCliente.loginId||"")}" autocomplete="username"></div></label>
    <label>Senha<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("lock")}</span><input id="clienteSenha" type="password" placeholder="Senha" autocomplete="current-password"><button type="button" class="password-toggle" id="toggleClienteSenha" aria-label="Visualizar senha">👁</button></div></label>
    <div class="remember-forgot"><label class="remember-line"><input id="lembrarCliente" type="checkbox" ${rememberedCliente.loginId?"checked":""}> <span>Lembrar de mim</span></label><button class="text-link" id="recuperarSenhaBtn">Esqueci minha senha</button></div>
    <button class="primary-btn login-main-btn" id="entrarCliente">Entrar</button>
    <div class="auth-divider"><span>ou</span></div>
    <div id="googleOfficialButton" class="google-official-wrap"></div>
    <button class="create-account-btn" id="irCadastro">Criar uma conta</button>
    <div class="login-status" id="loginStatus" aria-live="polite"></div>
  </div>`;
  const clientSignup=`<div class="form-grid auth-form">
    <label>Nome completo<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("user")}</span><input id="cadNome" placeholder="Nome completo" autocomplete="name"></div></label>
    <label>Telefone / WhatsApp<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("phone")}</span><input id="cadTelefone" type="tel" placeholder="(93) 99999-9999" autocomplete="tel"></div></label>
    <label>E-mail<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("mail")}</span><input id="cadEmail" type="email" placeholder="email@exemplo.com" autocomplete="email"></div></label>
    <label>Senha<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("lock")}</span><input id="cadSenha" type="password" placeholder="Crie uma senha" autocomplete="new-password"><button type="button" class="password-toggle" id="toggleCadSenha" aria-label="Visualizar senha">👁</button></div></label>
    <label>Confirmar senha<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("lock")}</span><input id="cadSenha2" type="password" placeholder="Confirme a senha" autocomplete="new-password"><button type="button" class="password-toggle" id="toggleCadSenha2" aria-label="Visualizar senha">👁</button></div></label>
    <button class="primary-btn login-main-btn" id="cadCliente">Cadastrar e entrar</button>
    <button class="create-account-btn" id="irLogin">Já tenho uma conta</button>
  </div>`;
  const adminLogin=`<div class="form-grid auth-form">
    <label>Usuário administrador<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("user")}</span><input id="adminUser" value="${esc(rememberedAdmin.user||"admin")}" placeholder="Usuário" autocomplete="username"></div></label>
    <label>Senha<div class="input-icon-wrap"><span class="field-icon">${authFieldIcon("lock")}</span><input id="adminPass" type="password" placeholder="Senha" autocomplete="current-password"><button type="button" class="password-toggle" id="toggleAdminSenha" aria-label="Visualizar senha">👁</button></div></label>
    <div class="remember-forgot"><label class="remember-line"><input id="lembrarAdmin" type="checkbox" ${rememberedAdmin.user?"checked":""}> <span>Lembrar de mim</span></label><button class="text-link" id="recuperarAdminBtn">Ajuda de acesso</button></div>
    <button class="primary-btn login-main-btn" id="entrarAdmin">Entrar</button>
    <div class="login-status" id="loginStatus" aria-live="polite"></div>
  </div>`;
  authView.innerHTML=`<div class="auth-card login-shell">
    <div class="login-hero"><img src="icon-512.png" alt="Macroservice App" class="login-hero-logo"><h2>${mode==="cadastro"?"Criar conta":"Login"}</h2><p>Seu assistente de oficina</p></div>
    <div class="auth-tabs"><button class="auth-tab ${tab==="cliente"?"active":""}" id="tabCliente">Cliente</button><button class="auth-tab ${tab==="admin"?"active":""}" id="tabAdmin">Administrador</button></div>
    ${tab==="cliente"?(mode==="cadastro"?clientSignup:clientLogin):adminLogin}
    ${footer}
  </div>`;

  const status=(msg,error=false)=>{const el=$("#loginStatus");if(!el)return;el.textContent=msg||"";el.classList.toggle("error",!!error);};
  const bindToggle=(btnSel,inputSel)=>{const btn=$(btnSel),input=$(inputSel);if(!btn||!input)return;btn.onclick=()=>{const show=input.type==="password";input.type=show?"text":"password";btn.textContent=show?"🙈":"👁";btn.setAttribute("aria-label",show?"Ocultar senha":"Visualizar senha");};};
  const findCliente=(loginId)=>{const id=loginId.trim().toLowerCase();return store.get("macro_clientes").find(c=>String(c.telefone||"").trim().toLowerCase()===id||String(c.email||"").trim().toLowerCase()===id);};
  const rememberChoice=(role,payload,checked)=>{if(checked)setRememberedAuth({role,...payload});else if(getRememberedAuth()?.role===role)clearRememberedAuth();};
  const loginCliente=()=>{const loginId=$("#clienteLoginId").value.trim(),senha=$("#clienteSenha").value;if(!loginId||!senha)return status("Informe usuário e senha.",true);const cli=findCliente(loginId);if(!cli||String(cli.senha||"")!==senha)return status("Usuário ou senha incorretos.",true);rememberChoice("cliente",{loginId},$("#lembrarCliente").checked);setSession({role:"cliente",id:cli.id,nome:cli.nome,telefone:cli.telefone||"",email:cli.email||"",provider:cli.provider||"local"});renderHome();};
  const loginAdmin=()=>{const user=$("#adminUser").value.trim(),pass=$("#adminPass").value;if(user==="admin"&&pass==="macroservice2026"){rememberChoice("admin",{user},$("#lembrarAdmin").checked);setSession({role:"admin",nome:"Administrador"});renderHome();}else status("Usuário ou senha incorretos.",true);};

  $("#tabCliente").onclick=()=>renderAuth("cliente","login");
  $("#tabAdmin").onclick=()=>renderAuth("admin","login");

  if(tab==="cliente"&&mode==="login"){
    bindToggle("#toggleClienteSenha","#clienteSenha");
    $("#entrarCliente").onclick=loginCliente;
    $("#clienteLoginId").addEventListener("keydown",e=>{if(e.key==="Enter")$("#clienteSenha").focus();});
    $("#clienteSenha").addEventListener("keydown",e=>{if(e.key==="Enter")loginCliente();});
    $("#irCadastro").onclick=()=>renderAuth("cliente","cadastro");
    $("#recuperarSenhaBtn").onclick=()=>{
      const current=esc($("#clienteLoginId").value||"");
      openAuthModal("Recuperar senha",`<div class="form-grid"><label>Telefone ou e-mail<input id="recLogin" value="${current}" placeholder="Digite seu cadastro"></label><label>Nova senha<input id="recSenha" type="password" placeholder="Nova senha"></label><label>Confirmar nova senha<input id="recSenha2" type="password" placeholder="Repita a nova senha"></label><div class="modal-msg" id="recMsg"></div></div>`,`Atualizar senha`,close=>{const id=$("#recLogin").value.trim(),s1=$("#recSenha").value,s2=$("#recSenha2").value,msg=$("#recMsg");if(!id||!s1||!s2){msg.textContent="Preencha todos os campos.";return;}if(s1!==s2){msg.textContent="As senhas não conferem.";return;}const clientes=store.get("macro_clientes"),cli=clientes.find(c=>String(c.telefone||"").trim().toLowerCase()===id.toLowerCase()||String(c.email||"").trim().toLowerCase()===id.toLowerCase());if(!cli){msg.textContent="Cadastro não encontrado neste aparelho.";return;}cli.senha=s1;store.set("macro_clientes",clientes);close();status("Senha atualizada. Você já pode entrar.");});
    };
    renderGoogleIdentityButton();
  }

  if(tab==="cliente"&&mode==="cadastro"){
    bindToggle("#toggleCadSenha","#cadSenha");bindToggle("#toggleCadSenha2","#cadSenha2");
    $("#irLogin").onclick=()=>renderAuth("cliente","login");
    $("#cadCliente").onclick=()=>{const nome=$("#cadNome").value.trim(),telefone=$("#cadTelefone").value.trim(),email=$("#cadEmail").value.trim(),senha=$("#cadSenha").value,senha2=$("#cadSenha2").value;if(!nome||!telefone||!senha)return alert("Preencha nome, telefone e senha.");if(senha.length<4)return alert("A senha precisa ter pelo menos 4 caracteres.");if(senha!==senha2)return alert("As senhas não conferem.");const clientes=store.get("macro_clientes");if(clientes.some(c=>String(c.telefone||"").trim()===telefone||(email&&String(c.email||"").trim().toLowerCase()===email.toLowerCase())))return alert("Já existe um cadastro com este telefone ou e-mail.");const cli={id:uid(),nome,telefone,email,senha,provider:"local"};clientes.push(cli);store.set("macro_clientes",clientes);setSession({role:"cliente",id:cli.id,nome:cli.nome,telefone:cli.telefone,email:cli.email||"",provider:"local"});renderHome();};
  }

  if(tab==="admin"){
    bindToggle("#toggleAdminSenha","#adminPass");
    $("#entrarAdmin").onclick=loginAdmin;
    $("#adminPass").addEventListener("keydown",e=>{if(e.key==="Enter")loginAdmin();});
    $("#recuperarAdminBtn").onclick=()=>openAuthModal("Acesso do administrador",`<p>Enquanto o app estiver usando autenticação local, o acesso de demonstração é:</p><div class="credential-box"><span>Usuário</span><b>admin</b><span>Senha</span><b>macroservice2026</b></div><p>Quando conectarmos o banco online, essa senha fixa será removida.</p>`,`Fechar`);
  }
}

function renderHome(){
  setAuthScreenMode(false);
  const s=getSession(); if(!s)return renderAuth(); showOnly(homeView);
  const solicitacoes=store.get("macro_solicitacoes"), novas=solicitacoes.filter(x=>x.status==="pendente").length;
  const cardsAdmin=`<button class="menu-card" data-view="solicitacoes"><span class="menu-icon">🔔</span><strong>Serviços Solicitados</strong>${novas?`<span class="badge">${novas}</span>`:""}</button><button class="menu-card" data-view="agendamento"><span class="menu-icon">📅</span><strong>Agenda</strong></button><button class="menu-card" data-view="orcamento"><span class="menu-icon">📄</span><strong>Orçamento Rápido</strong></button><button class="menu-card" data-view="clientes"><span class="menu-icon">👥</span><strong>Clientes</strong></button><button class="menu-card" data-view="veiculos"><span class="menu-icon">🚗</span><strong>Veículos</strong></button><button class="menu-card" data-view="servicos"><span class="menu-icon">🛠️</span><strong>Serviços</strong></button><button class="menu-card" data-view="pecas"><span class="menu-icon">⚙️</span><strong>Peças</strong></button><button class="menu-card" data-view="historico"><span class="menu-icon">🕘</span><strong>Histórico</strong></button><button class="menu-card" data-view="relatorios"><span class="menu-icon">📊</span><strong>Relatórios</strong></button><button class="menu-card" data-view="configuracoes"><span class="menu-icon">⚙️</span><strong>Configurações</strong></button>`;
  const cardsCliente=`<button class="menu-card" data-view="solicitar"><span class="menu-icon">🛠️</span><strong>Solicitar Serviço</strong></button><button class="menu-card" data-view="meusPedidos"><span class="menu-icon">📋</span><strong>Meus Pedidos</strong></button><button class="menu-card" data-view="meusVeiculos"><span class="menu-icon">🚗</span><strong>Meus Veículos</strong></button><button class="menu-card" data-view="meusOrcamentos"><span class="menu-icon">📄</span><strong>Meus Orçamentos</strong></button>`;
  homeView.innerHTML=`<div class="profile-strip"><div><strong>${s.role==="admin"?"Administrador":"Olá, "+esc(s.nome)+"!"}</strong><br><small>${s.role==="admin"?"Painel administrativo":"Área do cliente"}</small></div><button class="link-btn" id="logoutBtn">Sair</button></div><div class="welcome"><h2>${s.role==="admin"?"Painel da Oficina":"Bem-vindo! 👋"}</h2><p>${s.role==="admin"?"Controle de solicitações, agenda e orçamento.":"Solicite serviços e acompanhe seus pedidos."}</p></div><div class="dashboard-grid">${s.role==="admin"?cardsAdmin:cardsCliente}</div>`;
  $("#logoutBtn").onclick=()=>{clearSession();renderAuth();}; $$(".menu-card").forEach(b=>b.onclick=()=>showModule(b.dataset.view));
}

function showModule(view){showOnly(moduleView);render(view);} $("#backBtn").onclick=()=>renderHome();
function render(view){$("#backBtn").onclick=()=>renderHome();const map={solicitar:["Solicitar Serviço","Escolha veículo, serviço, data e horário",renderSolicitar],meusPedidos:["Meus Pedidos","Acompanhe suas solicitações",renderMeusPedidos],meusVeiculos:["Meus Veículos","Cadastre os veículos que você utiliza",renderMeusVeiculos],meusOrcamentos:["Meus Orçamentos","Orçamentos vinculados ao seu cadastro",renderMeusOrcamentos],solicitacoes:["Serviços Solicitados","Solicitações recebidas dos clientes",renderSolicitacoesAdmin],agendamento:["Agenda","Horários reservados e disponíveis",renderAgendaAdmin],orcamento:["Orçamento Rápido","Cliente, veículo, serviços e peças",renderOrcamento],clientes:["Clientes","Cadastro e consulta de clientes",renderClientes],veiculos:["Veículos","Cadastro dos veículos atendidos",renderVeiculos],servicos:["Serviços","Serviços organizados por sistema",renderServicos],pecas:["Peças","Biblioteca mecânica e elétrica",renderPecas],historico:["Histórico / OS","Orçamentos, manutenção e impressão",renderHistorico],relatorios:["Relatórios","Visão geral da oficina",renderRelatorios],configuracoes:["Configurações","Dados e regras da Macroservice",renderConfig]};const item=map[view]||map.solicitar;moduleTitle.textContent=item[0];moduleSubtitle.textContent=item[1];item[2]();}

function marcaOptions(selected=""){return `<option value="">Selecione</option>`+MARCAS.map(m=>`<option ${m===selected?"selected":""}>${esc(m)}</option>`).join("");}
function modeloOptions(marca,selected=""){const rows=VEHICLE_LIBRARY[marca]||[];return `<option value="">Selecione</option>`+rows.map(m=>`<option ${m===selected?"selected":""}>${esc(m)}</option>`).join("")+`<option value="Outro modelo">Outro modelo</option>`;}
function bindMarcaModelo(marcaSel,modeloSel){const draw=()=>{const atual=modeloSel.value;modeloSel.innerHTML=modeloOptions(marcaSel.value,atual);};marcaSel.onchange=draw;draw();}

function renderMeusVeiculos(){
  const sess=getSession();let veiculos=store.get("macro_veiculos"),meus=veiculos.filter(v=>v.clienteId===sess.id);
  moduleContent.innerHTML=`<details class="vehicle-add-panel"><summary>＋ Cadastrar novo veículo</summary><div class="form-grid vehicle-form">${vehicleFields("meu")}
  <button class="primary-btn" id="saveMeuVeiculo">Salvar veículo</button></div></details>
  <div class="section-list">${meus.length?meus.map(v=>`<div class="list-card vehicle-card"><div><strong>${esc(v.marca)} ${esc(v.modelo)} ${esc(v.versao||"")}</strong><span class="muted">${esc(v.ano||[v.anoFabricacao,v.anoModelo].filter(Boolean).join("/"))} ${esc(v.motor||"")} ${v.codigoMotor?`• ${esc(v.codigoMotor)}`:""} ${v.placa?`• ${esc(v.placa)}`:""}</span></div><div class="actions"><button class="secondary-btn" data-vehicle-catalog="${v.id}" data-return="meusVeiculos">Abrir catálogo</button></div></div>`).join(""):`<div class="empty">Nenhum veículo cadastrado.</div>`}</div>`;
  bindVehicleFields("meu");bindPlateLookup("meu");
  $("#saveMeuVeiculo").onclick=()=>{const data=readVehicleFields("meu");if(!data.marca||!data.modelo)return alert("Informe marca e modelo.");if(data.placa&&veiculos.some(v=>v.placa===data.placa))return alert("Esta placa já está cadastrada.");veiculos.push({id:uid(),clienteId:sess.id,...data});store.set("macro_veiculos",veiculos);renderMeusVeiculos();};
  $$('[data-vehicle-catalog]').forEach(b=>b.onclick=()=>renderVehicleCatalog(Number(b.dataset.vehicleCatalog),b.dataset.return));
}

function overlaps(aStart,aDur,bStart,bDur){const toM=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};const as=toM(aStart),ae=as+aDur*60,bs=toM(bStart),be=bs+bDur*60;return as<be&&bs<ae;}
function slotBusy(date,time,duration,ignoreId=null){const reqs=store.get("macro_solicitacoes").filter(r=>r.id!==ignoreId&&r.data===date&&["pendente","aceito"].includes(r.status));return reqs.some(r=>overlaps(time,duration,r.hora,Number(r.tempo||1)));}
function serviceSubcategories(cat){return Object.keys(SERVICE_CATALOG[cat]||{});}
function servicesBy(cat,sub){return servicosDisponiveis().filter(s=>(!cat||s.tipo===cat)&&(!sub||s.subcategoria===sub));}
function partSubcategories(cat){return Object.keys(PART_CATALOG[cat]||{});}
function partsBy(cat,sub){return pecasDisponiveis().filter(p=>(!cat||p.categoria===cat)&&(!sub||p.subcategoria===sub));}
function simpleOptions(rows,labelFn){return `<option value="">Selecione</option>`+rows.map(r=>`<option value="${r.id}">${esc(labelFn(r))}</option>`).join("");}

function renderSolicitar(){const s=getSession(),veiculos=store.get("macro_veiculos").filter(v=>v.clienteId===s.id);moduleContent.innerHTML=`<div class="form-grid"><label>Veículo<select id="solVeiculo"><option value="">Selecione</option>${veiculos.map(v=>`<option value="${v.id}">${esc(v.marca)} ${esc(v.modelo)}${v.placa?" - "+esc(v.placa):""}</option>`).join("")}</select></label><label>Sistema / categoria<select id="solTipo">${marcaOptions().replace(MARCAS.map(()=>"").join(""),"")}<option value="">Selecione</option>${TIPOS.map(t=>`<option>${esc(t)}</option>`).join("")}</select></label><label>Grupo do serviço<select id="solSub"><option value="">Selecione a categoria</option></select></label><label>Serviço<select id="solServico"><option value="">Selecione o grupo</option></select></label><label>Data<input id="solData" type="date"></label><div><label>Horários disponíveis</label><div class="slot-grid" id="slotGrid"></div></div><label>Observações<textarea id="solObs" placeholder="Descreva o problema ou serviço desejado"></textarea></label><button class="primary-btn" id="enviarSolicitacao">Enviar solicitação</button>${!veiculos.length?`<div class="notice">Cadastre primeiro um veículo em “Meus Veículos”.</div>`:""}</div>`;
  // corrige opções da categoria sem alterar o visual
  $("#solTipo").innerHTML=`<option value="">Selecione</option>${TIPOS.map(t=>`<option>${esc(t)}</option>`).join("")}`;
  let selectedSlot="";const fillSub=()=>{$("#solSub").innerHTML=`<option value="">Selecione</option>${serviceSubcategories($("#solTipo").value).map(x=>`<option>${esc(x)}</option>`).join("")}`;$("#solServico").innerHTML=`<option value="">Selecione o grupo</option>`;drawSlots();};const fillSrv=()=>{$("#solServico").innerHTML=simpleOptions(servicesBy($("#solTipo").value,$("#solSub").value),x=>`${x.nome} • ${x.tempo} h`);drawSlots();};
  function drawSlots(){selectedSlot="";const data=$("#solData").value,srv=servicosDisponiveis().find(x=>String(x.id)===$("#solServico").value),dur=Number(srv?.tempo||1);$("#slotGrid").innerHTML=SLOTS.map(t=>{const busy=data?slotBusy(data,t,dur):false;return `<button type="button" class="slot ${busy?"busy":""}" data-time="${t}" ${busy?"disabled":""}>${t}</button>`;}).join("");$$("#slotGrid .slot:not(.busy)").forEach(btn=>btn.onclick=()=>{$$("#slotGrid .slot").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");selectedSlot=btn.dataset.time;});}
  $("#solTipo").onchange=fillSub;$("#solSub").onchange=fillSrv;$("#solData").onchange=drawSlots;$("#solServico").onchange=drawSlots;drawSlots();
  $("#enviarSolicitacao").onclick=()=>{const veiculo=veiculos.find(v=>String(v.id)===$("#solVeiculo").value),servico=servicosDisponiveis().find(x=>String(x.id)===$("#solServico").value);if(!veiculo||!servico||!$("#solData").value||!selectedSlot)return alert("Selecione veículo, categoria, serviço, data e horário.");const tempo=Number(servico.tempo||1);if(slotBusy($("#solData").value,selectedSlot,tempo))return alert("Esse horário acabou de ficar indisponível. Escolha outro.");const reqs=store.get("macro_solicitacoes");reqs.unshift({id:uid(),clienteId:s.id,cliente:s.nome,telefone:s.telefone,veiculoId:veiculo.id,veiculo:`${veiculo.marca} ${veiculo.modelo}`,tipo:servico.tipo,subcategoria:servico.subcategoria||"",servico:servico.nome,valorEstimado:Number(servico.valor||0),tempo,data:$("#solData").value,hora:selectedSlot,obs:$("#solObs").value.trim(),status:"pendente",criadoEm:new Date().toLocaleString("pt-BR")});store.set("macro_solicitacoes",reqs);alert("Solicitação enviada. O horário ficou reservado enquanto aguarda análise.");renderMeusPedidos();};
}

function renderMeusPedidos(){const s=getSession(),rows=store.get("macro_solicitacoes").filter(r=>r.clienteId===s.id);moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(r=>`<div class="list-card"><div class="split"><strong>${esc(r.servico)}</strong><span class="status status-${r.status}">${esc(r.status.toUpperCase())}</span></div><div>${esc(r.veiculo)}</div><span class="muted">${esc(r.data)} às ${esc(r.hora)} • ${r.tempo} h</span>${r.obs?`<div class="muted" style="margin-top:6px">${esc(r.obs)}</div>`:""}</div>`).join(""):`<div class="empty">Nenhuma solicitação enviada.</div>`}</div>`;}
function renderSolicitacoesAdmin(){let rows=store.get("macro_solicitacoes");moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(r=>`<div class="list-card"><div class="split"><strong>${esc(r.cliente)}</strong><span class="status status-${r.status}">${esc(r.status.toUpperCase())}</span></div><div>${esc(r.veiculo)}</div><div><b>${esc(r.servico)}</b> • ${esc(r.tipo)}${r.subcategoria?" / "+esc(r.subcategoria):""}</div><span class="muted">${esc(r.data)} às ${esc(r.hora)} • ${r.tempo} h • ${esc(r.telefone||"")}</span>${r.obs?`<div class="muted" style="margin-top:6px">${esc(r.obs)}</div>`:""}${r.status==="pendente"?`<div class="actions"><button class="primary-btn" data-accept="${r.id}">Aceitar</button><button class="danger-btn" data-reject="${r.id}">Recusar</button></div>`:""}${r.status==="aceito"?`<div class="actions"><button class="secondary-btn" data-done="${r.id}">Concluir</button></div>`:""}</div>`).join(""):`<div class="empty">Nenhuma solicitação recebida.</div>`}</div>`;$$('[data-accept]').forEach(b=>b.onclick=()=>updateReq(Number(b.dataset.accept),"aceito"));$$('[data-reject]').forEach(b=>b.onclick=()=>updateReq(Number(b.dataset.reject),"recusado"));$$('[data-done]').forEach(b=>b.onclick=()=>updateReq(Number(b.dataset.done),"concluido"));}
function updateReq(id,status){const rows=store.get("macro_solicitacoes"),r=rows.find(x=>x.id===id);if(r)r.status=status;store.set("macro_solicitacoes",rows);renderSolicitacoesAdmin();}
function renderAgendaAdmin(){const rows=store.get("macro_solicitacoes").filter(r=>["pendente","aceito"].includes(r.status)).sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora));moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(r=>`<div class="list-card"><div class="split"><strong>${esc(r.data)} • ${esc(r.hora)}</strong><span class="status status-${r.status}">${esc(r.status)}</span></div><div>${esc(r.cliente)} — ${esc(r.veiculo)}</div><span class="muted">${esc(r.servico)} • ${r.tempo} h</span></div>`).join(""):`<div class="empty">Nenhum horário reservado.</div>`}</div>`;}
function renderClientes(){const rows=store.get("macro_clientes");moduleContent.innerHTML=`<div class="section-list">${rows.length?rows.map(c=>`<div class="list-card"><strong>${esc(c.nome)}</strong><span class="muted">${esc(c.telefone||"Sem telefone")}</span></div>`).join(""):`<div class="empty">Nenhum cliente cadastrado.</div>`}</div>`;}
function renderVeiculos(){
  const rows=store.get("macro_veiculos"),clientes=store.get("macro_clientes");
  moduleContent.innerHTML=`<details class="vehicle-add-panel"><summary>＋ Cadastrar veículo na oficina</summary><div class="form-grid vehicle-form"><label>Cliente<select id="admCliente"><option value="">Sem vínculo</option>${clientes.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select></label>${vehicleFields("adm")}<button class="primary-btn" id="saveAdmVehicle">Salvar veículo</button></div></details>
  <div class="section-list">${rows.length?rows.map(v=>{const cli=clientes.find(c=>c.id===v.clienteId);return `<div class="list-card vehicle-card"><div><strong>${esc(v.marca)} ${esc(v.modelo)} ${esc(v.versao||"")}</strong><span class="muted">${esc(v.ano||[v.anoFabricacao,v.anoModelo].filter(Boolean).join("/"))} ${esc(v.motor||"")} ${v.codigoMotor?`• ${esc(v.codigoMotor)}`:""} ${v.placa?`• ${esc(v.placa)}`:""}</span>${cli?`<span class="muted">Cliente: ${esc(cli.nome)}</span>`:""}</div><div class="actions"><button class="secondary-btn" data-vehicle-catalog="${v.id}" data-return="veiculos">Abrir catálogo</button></div></div>`;}).join(""):`<div class="empty">Nenhum veículo cadastrado.</div>`}</div>`;
  bindVehicleFields("adm");bindPlateLookup("adm");
  $("#saveAdmVehicle").onclick=()=>{const all=store.get("macro_veiculos"),data=readVehicleFields("adm");if(!data.marca||!data.modelo)return alert("Informe marca e modelo.");if(data.placa&&all.some(v=>v.placa===data.placa))return alert("Esta placa já está cadastrada.");all.push({id:uid(),clienteId:Number($("#admCliente").value)||null,...data});store.set("macro_veiculos",all);renderVeiculos();};
  $$('[data-vehicle-catalog]').forEach(b=>b.onclick=()=>renderVehicleCatalog(Number(b.dataset.vehicleCatalog),b.dataset.return));
}
function renderVehicleCatalog(id,returnView="veiculos"){
  const v=store.get("macro_veiculos").find(x=>x.id===id);if(!v)return render(returnView);
  showOnly(moduleView);moduleTitle.textContent=`${v.marca} ${v.modelo}`;moduleSubtitle.textContent="Catálogo técnico do veículo";
  const hist=store.get("macro_historico").filter(h=>(v.placa&&h.placa===v.placa)||(!v.placa&&h.veiculo===`${v.marca} ${v.modelo}`));
  moduleContent.innerHTML=`<div class="vehicle-tech-card"><div class="vehicle-tech-head"><div><strong>${esc(v.marca)} ${esc(v.modelo)} ${esc(v.versao||"")}</strong><span>${esc(v.ano||"")} ${esc(v.motor||"")}</span></div><span class="plate-chip">${esc(v.placa||"SEM PLACA")}</span></div><div class="vehicle-spec-grid"><span><b>Motor</b>${esc(v.motor||"—")}</span><span><b>Código motor</b>${esc(v.codigoMotor||"—")}</span><span><b>Combustível</b>${esc(v.combustivel||"—")}</span><span><b>Câmbio</b>${esc(v.cambio||"—")}</span><span><b>VIN/Chassi</b>${esc(v.chassi||"—")}</span><span><b>FIPE</b>${esc(v.fipe||"—")}</span></div><div class="notice">Para cotar peça com precisão, use placa para identificar o veículo e confirme aplicação pelo VIN/chassi, código do motor e código OEM da peça.</div></div>
  <div class="catalog-section"><h3>🔩 Peças / cotação</h3><input id="vehPartSearch" class="catalog-search" placeholder="Buscar peça: pivô, bomba, sensor, filtro..."><div id="vehPartList" class="section-list"></div></div>
  <div class="catalog-section"><h3>🛠️ Serviços / procedimentos</h3><input id="vehSrvSearch" class="catalog-search" placeholder="Buscar serviço ou ferramenta..."><div id="vehSrvList" class="section-list"></div></div>
  <div class="catalog-section"><h3>🕘 Histórico deste veículo</h3><div class="section-list">${hist.length?hist.slice(0,20).map(h=>`<div class="list-card"><strong>${esc(h.tipoDocumento||"Registro")}</strong><span class="muted">${esc(h.data||"")} • ${money(h.total||0)}</span></div>`).join(""):`<div class="empty">Ainda não há documentos vinculados a este veículo.</div>`}</div></div>`;
  $("#backBtn").onclick=()=>render(returnView);
  const partDraw=()=>{const q=$("#vehPartSearch").value.trim().toLowerCase();const terms=`${v.marca} ${v.modelo} ${v.versao||""} ${v.motor||""} ${v.codigoMotor||""}`.toLowerCase();let parts=pecasDisponiveis().filter(p=>!q||`${p.nome} ${p.categoria||""} ${p.subcategoria||""} ${p.aplicacao||""}`.toLowerCase().includes(q));if(!q)parts=parts.filter(p=>p.aplicacao&&terms.split(/\s+/).some(t=>t.length>2&&String(p.aplicacao).toLowerCase().includes(t)));$("#vehPartList").innerHTML=parts.length?parts.slice(0,35).map(p=>{const app=String(p.aplicacao||"");const compatible=app&&terms.split(/\s+/).some(t=>t.length>2&&app.toLowerCase().includes(t));return `<div class="list-card"><div class="split"><div><strong>${esc(p.nome)}</strong><span class="muted">${esc(p.categoria||"")} • ${esc(p.subcategoria||"")}</span></div><b>${p.valor?money(p.valor):"—"}</b></div><span class="fit-badge ${compatible?"fit-known":"fit-check"}">${compatible?"Aplicação cadastrada":"Confirmar VIN/OEM"}</span>${app?`<div class="muted small-line">Aplicação: ${esc(app)}</div>`:""}</div>`;}).join(""):`<div class="empty">Digite o nome da peça para pesquisar no catálogo.</div>`;};
  const srvDraw=()=>{const q=$("#vehSrvSearch").value.trim().toLowerCase();if(!q){$("#vehSrvList").innerHTML=`<div class="empty">Digite um serviço, sistema ou ferramenta para pesquisar.</div>`;return;}const rows=servicosDisponiveis().filter(s=>{const pr=getServiceProcedure(s);return `${s.nome} ${s.tipo} ${s.subcategoria||""} ${pr.tools.join(" ")} ${pr.steps.join(" ")}`.toLowerCase().includes(q)});$("#vehSrvList").innerHTML=rows.slice(0,30).map(s=>`<div class="list-card service-result-card"><div><strong>${esc(s.nome)}</strong><span class="muted">${esc(s.tipo)} • ${esc(s.subcategoria||"")} • ${s.tempo} h</span></div><button class="secondary-btn" data-proc="${s.id}">Procedimento</button></div>`).join("")||`<div class="empty">Nenhum serviço encontrado.</div>`;$$('[data-proc]').forEach(b=>b.onclick=()=>openServiceProcedure(servicosDisponiveis().find(s=>String(s.id)===b.dataset.proc)));};
  $("#vehPartSearch").oninput=partDraw;$("#vehSrvSearch").oninput=srvDraw;partDraw();srvDraw();
}


function renderServicos(){
  moduleContent.innerHTML=`<div class="form-grid service-search-panel"><label>Pesquisar serviço<input id="srvBusca" placeholder="Ex.: alternador, compressão, amortecedor, multímetro..."></label><div class="two-cols"><label>Categoria / sistema<select id="srvFiltroCat"><option value="">Todas</option>${TIPOS.map(t=>`<option>${esc(t)}</option>`).join("")}</select></label><label>Grupo<select id="srvFiltroSub"><option value="">Todos</option></select></label></div><div class="notice">A lista não fica mais aberta inteira. Digite na busca ou escolha Categoria → Grupo. A busca também encontra serviços pelas ferramentas e etapas do procedimento.</div></div>
  <div class="section-list" id="srvLista"><div class="empty">Pesquise um serviço para visualizar os resultados.</div></div>
  <details class="service-custom-details"><summary>＋ Cadastrar serviço personalizado</summary><div class="form-grid"><label>Novo serviço personalizado<input id="srvNome"></label><label>Tipo<select id="srvTipo">${TIPOS.map(t=>`<option>${esc(t)}</option>`).join("")}</select></label><label>Grupo<input id="srvSub" placeholder="Ex.: Diagnóstico / testes"></label><label>Mão de obra (R$)<input id="srvValor" type="number" step="0.01"></label><label>Tempo estimado (h)<input id="srvTempo" type="number" step="0.5"></label><button class="primary-btn" id="saveSrv">Salvar serviço personalizado</button></div></details>`;
  const drawSubs=()=>{$("#srvFiltroSub").innerHTML=`<option value="">Todos</option>${serviceSubcategories($("#srvFiltroCat").value).map(x=>`<option>${esc(x)}</option>`).join("")}`;draw();};
  const draw=()=>{const q=$("#srvBusca").value.trim().toLowerCase(),cat=$("#srvFiltroCat").value,sub=$("#srvFiltroSub").value,active=q||cat||sub;if(!active){$("#srvLista").innerHTML=`<div class="empty">Pesquise um serviço ou selecione uma categoria.</div>`;return;}let rows=servicosDisponiveis().filter(s=>{if(cat&&s.tipo!==cat)return false;if(sub&&s.subcategoria!==sub)return false;if(!q)return true;const pr=getServiceProcedure(s),hay=`${s.nome} ${s.tipo} ${s.subcategoria||""} ${pr.tools.join(" ")} ${pr.steps.join(" ")}`.toLowerCase();return hay.includes(q);});$("#srvLista").innerHTML=rows.length?rows.slice(0,40).map(s=>`<div class="list-card service-result-card"><div><strong>${esc(s.nome)}</strong><span class="muted">${esc(s.tipo||"")} • ${esc(s.subcategoria||"")} • ⏱ ${s.tempo} h</span>${s.valor?`<span class="service-price">${money(s.valor)}</span>`:""}</div><button class="secondary-btn" data-proc="${s.id}">Ver procedimento</button></div>`).join("")+(rows.length>40?`<div class="notice">${rows.length} resultados. Refine a busca para reduzir a lista.</div>`:""):`<div class="empty">Nenhum serviço encontrado.</div>`;$$('[data-proc]').forEach(b=>b.onclick=()=>openServiceProcedure(servicosDisponiveis().find(s=>String(s.id)===b.dataset.proc)));};
  $("#srvFiltroCat").onchange=drawSubs;$("#srvFiltroSub").onchange=draw;$("#srvBusca").oninput=draw;
  $("#saveSrv").onclick=()=>{const nome=$("#srvNome").value.trim();if(!nome)return alert("Informe o serviço.");const r=customServices();r.push({id:uid(),nome,tipo:$("#srvTipo").value,subcategoria:$("#srvSub").value.trim()||"Outros",valor:Number($("#srvValor").value||0),tempo:Number($("#srvTempo").value||1),catalogo:false});store.set("macro_servicos_custom",r);renderServicos();};
}


function renderPecas(){moduleContent.innerHTML=`<div class="form-grid"><label>Sistema da peça<select id="pecFiltroCat"><option value="">Todos</option>${PART_CATEGORIES.map(t=>`<option>${esc(t)}</option>`).join("")}</select></label><label>Grupo<select id="pecFiltroSub"><option value="">Todos</option></select></label><label>Pesquisar peça<input id="pecBusca" placeholder="Ex.: bobina, pivô, alternador, bico"></label><div class="notice">Biblioteca geral mecânica e elétrica. A aplicação exata deve ser confirmada pelo veículo/chassi e código da peça.</div><label>Nova peça personalizada<input id="pecNome"></label><label>Categoria<input id="pecCat" placeholder="Ex.: Suspensão"></label><label>Grupo<input id="pecSub" placeholder="Ex.: Dianteira"></label><label>Valor estimado (R$)<input id="pecValor" type="number" step="0.01"></label><label>Aplicação<input id="pecAplicacao" placeholder="Ex.: Gol G6 1.0 2013"></label><button class="primary-btn" id="savePec">Salvar peça personalizada</button></div><div class="section-list" id="pecLista"></div>`;
  const drawSubs=()=>{$("#pecFiltroSub").innerHTML=`<option value="">Todos</option>${partSubcategories($("#pecFiltroCat").value).map(x=>`<option>${esc(x)}</option>`).join("")}`;draw();};
  const draw=()=>{const q=$("#pecBusca").value.trim().toLowerCase(),cat=$("#pecFiltroCat").value,sub=$("#pecFiltroSub").value;let rows=pecasDisponiveis().filter(p=>(!cat||p.categoria===cat)&&(!sub||p.subcategoria===sub)&&(!q||`${p.nome} ${p.categoria||""} ${p.subcategoria||""}`.toLowerCase().includes(q)));$("#pecLista").innerHTML=rows.length?rows.slice(0,250).map(p=>`<div class="list-card split"><div><strong>${esc(p.nome)}</strong><span class="muted">${esc(p.categoria||"")} • ${esc(p.subcategoria||"")}</span></div><b>${p.valor?money(p.valor):"—"}</b></div>`).join(""):`<div class="empty">Nenhuma peça encontrada.</div>`;};
  $("#pecFiltroCat").onchange=drawSubs;$("#pecFiltroSub").onchange=draw;$("#pecBusca").oninput=draw;draw();
  $("#savePec").onclick=()=>{const nome=$("#pecNome").value.trim();if(!nome)return alert("Informe a peça.");const r=customParts();r.push({id:uid(),nome,categoria:$("#pecCat").value.trim()||"Personalizada",subcategoria:$("#pecSub").value.trim()||"Outros",valor:Number($("#pecValor").value||0),aplicacao:$("#pecAplicacao").value.trim(),catalogo:false});store.set("macro_pecas_custom",r);renderPecas();};
}

function renderOrcamento(){const clientes=store.get("macro_clientes"),todosSrv=servicosDisponiveis(),todasPec=pecasDisponiveis();moduleContent.innerHTML=`<div class="form-grid"><label>Cliente<select id="orcCliente">${simpleOptions(clientes,c=>c.nome)}</select></label><label>Marca<select id="orcMarca">${marcaOptions()}</select></label><label>Modelo<select id="orcModelo"><option value="">Selecione a marca</option></select></label><label>Versão / Motor<input id="orcMotor" placeholder="Ex.: Working 1.4 Fire"></label><label>Placa<input id="orcPlaca" placeholder="ABC1D23"></label><label>Categoria do serviço<select id="orcTipo"><option value="">Selecione</option>${TIPOS.map(t=>`<option>${esc(t)}</option>`).join("")}</select></label><label>Grupo do serviço<select id="orcSub"><option value="">Selecione a categoria</option></select></label><label>Serviço<select id="orcServico"><option value="">Selecione o grupo</option></select></label><button class="secondary-btn" id="addSrv">Adicionar serviço</button><label>Categoria da peça<select id="orcPecCat"><option value="">Selecione</option>${PART_CATEGORIES.map(t=>`<option>${esc(t)}</option>`).join("")}</select></label><label>Grupo da peça<select id="orcPecSub"><option value="">Selecione a categoria</option></select></label><label>Peça<select id="orcPeca"><option value="">Selecione o grupo</option></select></label><button class="secondary-btn" id="addPec">Adicionar peça</button><div id="orcItens" class="section-list"></div><div class="total-box"><div>Mão de obra: <b id="totMO">R$ 0,00</b></div><div>Peças: <b id="totP">R$ 0,00</b></div><div>Tempo: <b id="totT">0 h</b></div><div class="total" id="totG">R$ 0,00</div></div><label>Observações do orçamento<textarea id="orcObs" placeholder="Condições, validade, recomendações..."></textarea></label><button class="primary-btn" id="saveOrc">Salvar orçamento</button></div>`;
  bindMarcaModelo($("#orcMarca"),$("#orcModelo"));
  $("#orcTipo").onchange=()=>{$("#orcSub").innerHTML=`<option value="">Selecione</option>${serviceSubcategories($("#orcTipo").value).map(x=>`<option>${esc(x)}</option>`).join("")}`;$("#orcServico").innerHTML=`<option value="">Selecione o grupo</option>`;};
  $("#orcSub").onchange=()=>{$("#orcServico").innerHTML=simpleOptions(servicesBy($("#orcTipo").value,$("#orcSub").value),s=>`${s.nome} • ${s.tempo} h`);};
  $("#orcPecCat").onchange=()=>{$("#orcPecSub").innerHTML=`<option value="">Selecione</option>${partSubcategories($("#orcPecCat").value).map(x=>`<option>${esc(x)}</option>`).join("")}`;$("#orcPeca").innerHTML=`<option value="">Selecione o grupo</option>`;};
  $("#orcPecSub").onchange=()=>{$("#orcPeca").innerHTML=simpleOptions(partsBy($("#orcPecCat").value,$("#orcPecSub").value),p=>p.nome);};
  const itens=[];
  const draw=()=>{const mo=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+b.valor*b.qtd,0),pp=itens.filter(i=>i.tipo==="Peça").reduce((a,b)=>a+b.valor*b.qtd,0),tt=itens.filter(i=>i.tipo==="Serviço").reduce((a,b)=>a+b.tempo*b.qtd,0);$("#orcItens").innerHTML=itens.length?itens.map((i,idx)=>`<div class="list-card"><strong>${esc(i.nome)}</strong><span class="muted">${esc(i.tipo)}${i.categoria?" • "+esc(i.categoria):""}</span><div class="form-grid" style="margin-top:8px"><label>Quantidade<input data-qtd="${idx}" type="number" min="1" step="1" value="${i.qtd}"></label><label>Valor unitário (R$)<input data-val="${idx}" type="number" min="0" step="0.01" value="${i.valor}"></label><button class="danger-btn" data-rem="${idx}">Remover</button></div></div>`).join(""):`<div class="empty">Adicione serviços e peças.</div>`;$("#totMO").textContent=money(mo);$("#totP").textContent=money(pp);$("#totT").textContent=tt.toFixed(1).replace(".0","")+" h";$("#totG").textContent=money(mo+pp);$$('[data-qtd]').forEach(x=>x.onchange=()=>{itens[Number(x.dataset.qtd)].qtd=Math.max(1,Number(x.value||1));draw();});$$('[data-val]').forEach(x=>x.onchange=()=>{itens[Number(x.dataset.val)].valor=Math.max(0,Number(x.value||0));draw();});$$('[data-rem]').forEach(x=>x.onclick=()=>{itens.splice(Number(x.dataset.rem),1);draw();});};draw();
  $("#addSrv").onclick=()=>{const s=todosSrv.find(x=>String(x.id)===$("#orcServico").value);if(s){itens.push({tipo:"Serviço",nome:s.nome,categoria:s.tipo,subcategoria:s.subcategoria,valor:Number(s.valor||0),tempo:Number(s.tempo||1),qtd:1});draw();}};
  $("#addPec").onclick=()=>{const p=todasPec.find(x=>String(x.id)===$("#orcPeca").value);if(p){itens.push({tipo:"Peça",nome:p.nome,categoria:p.categoria,subcategoria:p.subcategoria,valor:Number(p.valor||0),tempo:0,qtd:1});draw();}};
  $("#saveOrc").onclick=()=>{const c=clientes.find(x=>String(x.id)===$("#orcCliente").value);if(!c||!$("#orcMarca").value||!$("#orcModelo").value||!itens.length)return alert("Preencha cliente, veículo e itens.");const total=itens.reduce((a,b)=>a+b.valor*b.qtd,0),tempo=itens.reduce((a,b)=>a+b.tempo*b.qtd,0),hist=store.get("macro_historico");hist.unshift({id:uid(),clienteId:c.id,cliente:c.nome,telefone:c.telefone||"",marca:$("#orcMarca").value,modelo:$("#orcModelo").value,motor:$("#orcMotor").value.trim(),placa:$("#orcPlaca").value.trim().toUpperCase(),veiculo:`${$("#orcMarca").value} ${$("#orcModelo").value}`,data:new Date().toLocaleString("pt-BR"),total,tempo,itens:JSON.parse(JSON.stringify(itens)),obs:$("#orcObs").value.trim(),tipoDocumento:"orcamento"});store.set("macro_historico",hist);alert("Orçamento salvo.");renderHistorico();};
}

function printDocument(doc,title="Orçamento"){
  const isMaint=title.includes("Manutenção");
  const itens=(doc.itens||[]).map(i=>`<tr><td>${esc(i.tipo)}</td><td>${esc(i.nome)}</td><td>${Number(i.qtd||1)}</td><td>${money(i.valor||0)}</td><td>${money(Number(i.valor||0)*Number(i.qtd||1))}</td></tr>`).join("");
  const testes=(doc.testes||[]).filter(x=>x.nome||x.resultado).map(x=>`<tr><td>${esc(x.nome)}</td><td>${esc(x.resultado)}</td></tr>`).join("");
  const w=window.open("","_blank");if(!w)return alert("Permita pop-ups para imprimir o documento.");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;color:#111;margin:28px}header{display:flex;align-items:center;gap:18px;border-bottom:3px solid #ff7a00;padding-bottom:12px}header img{width:120px;height:70px;object-fit:cover}h1{margin:0;color:#0b2a43}h2{margin:4px 0;color:#ff7a00}.box{border:1px solid #bbb;padding:10px;margin:12px 0;border-radius:6px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #bbb;padding:7px;text-align:left}th{background:#eee}.total{font-size:20px;font-weight:bold;text-align:right;margin-top:12px}.muted{color:#555;font-size:12px}@media print{button{display:none}}</style></head><body><header><img src="logo.png"><div><h1>MACROSERVICE</h1><h2>Inteligência Automotiva</h2><div>Juruti - PA • (93) 98124-8315 • isael.albuquerque@gmail.com</div></div></header><h2>${esc(title)}</h2><div class="box"><b>Cliente:</b> ${esc(doc.cliente||"")} &nbsp; <b>Telefone:</b> ${esc(doc.telefone||"")}<br><b>Veículo:</b> ${esc(doc.veiculo||"")} ${esc(doc.motor||"")} &nbsp; <b>Placa:</b> ${esc(doc.placa||"")}<br><b>Data:</b> ${esc(doc.data||"")}</div>${isMaint?`<div class="box"><b>Diagnóstico inicial:</b><br>${esc(doc.diagnostico||"")}</div>`:""}<table><thead><tr><th>Tipo</th><th>Descrição</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead><tbody>${itens||`<tr><td colspan="5">Sem itens</td></tr>`}</tbody></table><div class="total">Total: ${money(doc.total||0)}</div>${testes?`<h3>Testes e medições</h3><table><thead><tr><th>Teste</th><th>Resultado</th></tr></thead><tbody>${testes}</tbody></table>`:""}${isMaint?`<div class="box"><b>Serviços executados / observações:</b><br>${esc(doc.execucao||"")}</div><div class="box"><b>Recomendações técnicas:</b><br>${esc(doc.recomendacoes||"")}</div><div class="box"><b>Próxima revisão:</b> ${esc(doc.proximaRevisao||"")}</div>`:`<div class="box"><b>Observações:</b><br>${esc(doc.obs||"")}</div>`}<p class="muted">Documento gerado pelo Macroservice App. Use a opção Imprimir do navegador e selecione “Salvar como PDF” para gerar PDF.</p><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close();
}

function renderMaintenanceForm(id){const hist=store.get("macro_historico"),base=hist.find(x=>x.id===id);if(!base)return renderHistorico();moduleContent.innerHTML=`<div class="form-grid"><div class="notice">Relatório de manutenção para <b>${esc(base.cliente)}</b> — ${esc(base.veiculo)}</div><label>Diagnóstico inicial<textarea id="manDiag" placeholder="Sintomas, falhas encontradas, inspeção inicial..."></textarea></label><label>Teste / medição 1<input id="t1n" placeholder="Ex.: Compressão dos cilindros"></label><label>Resultado 1<input id="t1r" placeholder="Ex.: C1 11,2 | C2 11,2 | C3 11,2 | C4 12,2 bar"></label><label>Teste / medição 2<input id="t2n" placeholder="Ex.: Pressão de óleo"></label><label>Resultado 2<input id="t2r" placeholder="Ex.: 1,2 bar em lenta"></label><label>Teste / medição 3<input id="t3n" placeholder="Ex.: Teste de bateria / CCA"></label><label>Resultado 3<input id="t3r" placeholder="Ex.: 520 CCA / 12,65 V"></label><label>Serviços executados / observações<textarea id="manExec"></textarea></label><label>Recomendações técnicas<textarea id="manRec"></textarea></label><label>Próxima revisão<input id="manProx" placeholder="Ex.: 10.000 km ou 6 meses"></label><button class="primary-btn" id="saveMan">Salvar relatório de manutenção</button></div>`;$("#saveMan").onclick=()=>{const rel={...base,id:uid(),origemId:base.id,tipoDocumento:"manutencao",data:new Date().toLocaleString("pt-BR"),diagnostico:$("#manDiag").value.trim(),testes:[{nome:$("#t1n").value.trim(),resultado:$("#t1r").value.trim()},{nome:$("#t2n").value.trim(),resultado:$("#t2r").value.trim()},{nome:$("#t3n").value.trim(),resultado:$("#t3r").value.trim()}],execucao:$("#manExec").value.trim(),recomendacoes:$("#manRec").value.trim(),proximaRevisao:$("#manProx").value.trim()};hist.unshift(rel);store.set("macro_historico",hist);alert("Relatório de manutenção salvo.");renderHistorico();};}

function renderMeusOrcamentos(){const s=getSession(),h=store.get("macro_historico").filter(x=>x.clienteId===s.id&&x.tipoDocumento!=="manutencao");moduleContent.innerHTML=`<div class="section-list">${h.length?h.map(x=>`<div class="list-card"><strong>${esc(x.veiculo)}</strong><span class="muted">${esc(x.data)}</span><div style="margin-top:6px;color:#ff8a00;font-weight:900">${money(x.total)}</div><div class="actions"><button class="secondary-btn" data-printorc="${x.id}">Visualizar / Imprimir</button></div></div>`).join(""):`<div class="empty">Nenhum orçamento disponível.</div>`}</div>`;$$('[data-printorc]').forEach(b=>b.onclick=()=>{const x=h.find(i=>i.id===Number(b.dataset.printorc));if(x)printDocument(x,"Orçamento");});}
function renderHistorico(){const h=store.get("macro_historico");moduleContent.innerHTML=`<div class="section-list">${h.length?h.map(x=>`<div class="list-card"><strong>${x.tipoDocumento==="manutencao"?"Relatório de Manutenção":"Orçamento"} — ${esc(x.cliente)}</strong><div>${esc(x.veiculo)}</div><span class="muted">${esc(x.data)} • ${x.tempo||0} h</span><div style="margin-top:6px;color:#ff8a00;font-weight:900">${money(x.total)}</div><div class="actions"><button class="secondary-btn" data-print="${x.id}">Imprimir / PDF</button>${x.tipoDocumento!=="manutencao"?`<button class="primary-btn" data-man="${x.id}">Criar relatório de manutenção</button>`:""}</div></div>`).join(""):`<div class="empty">Nenhum documento salvo.</div>`}</div>`;$$('[data-print]').forEach(b=>b.onclick=()=>{const x=h.find(i=>i.id===Number(b.dataset.print));if(x)printDocument(x,x.tipoDocumento==="manutencao"?"Relatório de Manutenção":"Orçamento");});$$('[data-man]').forEach(b=>b.onclick=()=>renderMaintenanceForm(Number(b.dataset.man)));}
function renderRelatorios(){const req=store.get("macro_solicitacoes"),h=store.get("macro_historico"),orc=h.filter(x=>x.tipoDocumento!=="manutencao"),man=h.filter(x=>x.tipoDocumento==="manutencao");moduleContent.innerHTML=`<div class="section-list"><div class="list-card split"><strong>Clientes</strong><b>${store.get("macro_clientes").length}</b></div><div class="list-card split"><strong>Solicitações pendentes</strong><b>${req.filter(x=>x.status==="pendente").length}</b></div><div class="list-card split"><strong>Agendadas</strong><b>${req.filter(x=>x.status==="aceito").length}</b></div><div class="list-card split"><strong>Orçamentos</strong><b>${orc.length}</b></div><div class="list-card split"><strong>Relatórios de manutenção</strong><b>${man.length}</b></div><div class="total-box"><div class="total">${money(orc.reduce((a,b)=>a+Number(b.total||0),0))}</div><div class="muted">Soma dos orçamentos salvos</div></div></div>`;}

let deferredInstallPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;});
function renderConfig(){moduleContent.innerHTML=`<div class="form-grid"><div class="notice">Horários padrão: 08:00, 09:00, 10:00, 11:00, 13:00, 14:00, 15:00 e 16:00. Solicitações pendentes e aceitas bloqueiam automaticamente o intervalo conforme a duração do serviço.</div><div class="notice">A biblioteca inclui veículos nacionais/importados, peças mecânicas/elétricas e serviços organizados por sistema. Confirme sempre a aplicação exata da peça pelo chassi/VIN ou código OEM.</div><button class="primary-btn" id="installApp">Instalar Macroservice no celular</button><button class="danger-btn" id="clearData">Limpar dados de demonstração</button></div>`;$("#installApp").onclick=async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;}else alert("Se o app já estiver instalado ou o navegador não liberar o instalador, abra o menu ⋮ do Chrome e procure ‘Instalar app’ ou ‘Adicionar à tela inicial’. Atualize a página uma vez após publicar esta versão.");};$("#clearData").onclick=()=>{if(confirm("Apagar dados locais deste aparelho?")){["macro_clientes","macro_veiculos","macro_servicos","macro_pecas","macro_servicos_custom","macro_pecas_custom","macro_historico","macro_solicitacoes","macro_catalog_migrated"].forEach(k=>localStorage.removeItem(k));clearSession();init();}};}

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(console.error));
init();
