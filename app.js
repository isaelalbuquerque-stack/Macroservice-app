const conteudo = document.getElementById("conteudo");

function carregarDados(nome) {
  return JSON.parse(localStorage.getItem(nome) || "[]");
}

function salvarDados(nome, dados) {
  localStorage.setItem(nome, JSON.stringify(dados));
}

function abrirModulo(modulo) {

  if (modulo === "clientes") {
    telaClientes();
  }

  else if (modulo === "veiculos") {
    telaVeiculos();
  }

  else if (modulo === "servicos") {
    telaServicos();
  }

  else if (modulo === "pecas") {
    telaPecas();
  }

  else if (modulo === "orcamento") {
    telaOrcamento();
  }

  else if (modulo === "agendamento") {
    telaAgendamento();
  }

  else if (modulo === "historico") {
    telaHistorico();
  }

  else if (modulo === "relatorios") {
    mensagem("Relatórios", "Este módulo será liberado nas próximas versões.");
  }

  else if (modulo === "configuracoes") {
    mensagem("Configurações", "Configurações da Macroservice.");
  }
}

function mensagem(titulo, texto) {
  conteudo.innerHTML = `
    <h2>${titulo}</h2>
    <p>${texto}</p>
  `;
}

/* CLIENTES */

function telaClientes() {

  const clientes = carregarDados("macro_clientes");

  conteudo.innerHTML = `
    <h2>👥 Clientes</h2>

    <label>Nome do cliente</label>
    <input id="clienteNome" placeholder="Nome completo">

    <label>Telefone / WhatsApp</label>
    <input id="clienteTelefone" type="tel"
           placeholder="(93) 99999-9999">

    <button class="botao-principal"
            onclick="salvarCliente()">
      Salvar Cliente
    </button>

    <br><br>

    <h3>Clientes cadastrados</h3>

    <div id="listaClientes">
      ${
        clientes.length
          ? clientes.map(c =>
            `<p>👤 <strong>${c.nome}</strong><br>
             📱 ${c.telefone}</p><br>`
          ).join("")
          : "<p>Nenhum cliente cadastrado.</p>"
      }
    </div>
  `;
}

function salvarCliente() {

  const nome =
    document.getElementById("clienteNome").value.trim();

  const telefone =
    document.getElementById("clienteTelefone").value.trim();

  if (!nome) {
    alert("Informe o nome do cliente.");
    return;
  }

  const clientes = carregarDados("macro_clientes");

  clientes.push({
    id: Date.now(),
    nome,
    telefone
  });

  salvarDados("macro_clientes", clientes);

  alert("Cliente salvo com sucesso!");

  telaClientes();
}

/* VEÍCULOS */

function telaVeiculos() {

  const veiculos = carregarDados("macro_veiculos");

  conteudo.innerHTML = `
    <h2>🚗 Veículos</h2>

    <label>Marca</label>
    <input id="marca" placeholder="Ex.: Fiat">

    <label>Modelo</label>
    <input id="modelo" placeholder="Ex.: Strada">

    <label>Ano</label>
