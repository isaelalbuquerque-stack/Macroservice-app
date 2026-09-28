# Macroservice App V5.6

Atualização funcional mantendo a interface azul/laranja da revisão anterior.

## Novidades
- Biblioteca de veículos nacionais e importados: Marca → Modelo → Versão/Ano/Motor.
- Biblioteca de peças mecânicas e elétricas organizada por sistema e grupo.
- Serviços em linha lógica: Sistema → Grupo → Serviço.
- Inclui motor, ignição, bicos/injeção, elétrica, suspensão, freios, direção, transmissão, arrefecimento, ar-condicionado, alinhamento, balanceamento, borracharia, lavagem e revisão.
- Testes e diagnósticos: compressão, leak-down, pressão de óleo, vazão/pressão de combustível, bateria/CCA, carga, partida, chicote, sensores, bicos e outros.
- Orçamento com quantidade, valor unitário editável e totais automáticos.
- Impressão do orçamento e opção Salvar como PDF pelo navegador.
- Relatório de manutenção com diagnóstico, medições/testes, execução, recomendações e próxima revisão.
- Impressão/PDF do relatório de manutenção.
- Cadastro de cliente, veículos, solicitações, agenda e bloqueio de horários sobrepostos preservados.
- PWA corrigido para GitHub Pages em `/Macroservice-app/`, com ícones 192x192, 512x512 e maskable.
- Botão “Instalar Macroservice no celular” dentro de Configurações quando o navegador disponibilizar o instalador.

## Importante
Os dados continuam no `localStorage` deste aparelho. Para clientes em celulares diferentes enviarem solicitações ao administrador em tempo real, será necessário conectar autenticação e banco online (ex.: Supabase/Firebase).

A biblioteca de peças é genérica. A compatibilidade exata deve ser confirmada pelo chassi/VIN, catálogo do fabricante ou código OEM.


## Novidades V5.2
- Ícone do app atualizado com base no novo modelo enviado.
- Tela de login redesenhada com visual mais próximo do mockup enviado.
- Campo de senha com opção de visualizar/ocultar.
- Recuperação local de senha para clientes cadastrados no aparelho.
- Botão “Entrar com Google” em modo local/demonstração, pronto para futura integração real.
- Opção “Lembrar de mim” para cliente e administrador.


## Novidades V5.3
- Tela de login refinada seguindo o modelo visual enviado pelo usuário.
- Campos de usuário, telefone, e-mail e senha com ícones integrados.
- Botão de visualizar/ocultar senha preservado e melhor posicionado.
- Recuperação de senha em janela própria, sem prompts soltos do navegador.
- Login com tecla Enter e mensagens de erro dentro da tela.
- Opção “Lembrar de mim” reorganizada junto ao acesso de recuperação.
- Botão Google redesenhado; não simula autenticação Google local. A conexão real exige Firebase/Supabase e credenciais.
- Rodapé interno da tela de login com MACROSERVICE, Inteligência Automotiva, Juruti - PA e versão.
- Melhor adaptação a telas pequenas.


## Novidades V5.5
- Login Google preparado com Google Identity Services e botão oficial renderizado pelo Google quando o Client ID estiver configurado.
- `integrations.js` centraliza o Client ID Google e a configuração do provedor de consulta por placa.
- Cadastro de veículo ampliado: placa, marca, modelo, versão, ano fabricação/modelo, motor, código do motor, combustível, câmbio, VIN/chassi, cor e FIPE.
- Botão “Consultar placa” preenche automaticamente os campos quando um provedor de dados veiculares estiver configurado.
- Cada veículo ganhou “Abrir catálogo”, com busca de peças, busca de serviços/procedimentos e histórico do próprio veículo.
- Catálogo de Serviços não abre mais centenas de itens de uma vez; os resultados aparecem somente por busca/filtro.
- Busca de serviços também pesquisa ferramentas e etapas dos procedimentos.
- Todos os serviços recebem um procedimento de referência com ferramentas, segurança/preparação, passo a passo, conferências finais e tempo estimado.

## Ativar login Google
1. No Google Cloud Console crie uma credencial OAuth 2.0 do tipo **Aplicativo da Web**.
2. Adicione `https://isaelalbuquerque-stack.github.io` em **Origens JavaScript autorizadas**.
3. Copie o Client ID e cole em `integrations.js` no campo `google.clientId`.
4. Publique novamente no GitHub Pages e recarregue o app.

O login Google identifica o cliente no navegador. Para permissões de servidor, dados compartilhados em tempo real e segurança multiusuário, a credencial Google deve ser validada por um backend/Firebase/Supabase.

## Ativar consulta por placa
A consulta por placa depende de um provedor autorizado de dados veiculares. Configure `plateLookup.endpoint` e, quando exigido pelo provedor, o token em `integrations.js`. O app tenta normalizar campos comuns retornados pela API.

A placa é útil para identificar marca/modelo/ano/versão, mas a aplicação exata de peças deve ser confirmada também por VIN/chassi, código do motor e/ou código OEM.

## Procedimentos técnicos
Os procedimentos incorporados são referências operacionais para organizar o trabalho da oficina. Torques, folgas, fluidos, capacidades, ferramentas especiais, sequências e boletins devem ser conferidos no manual técnico específico do veículo antes da execução.


## Novidades V5.6
- Consulta por placa ligada à Edge Function `consultar-placa` do projeto Supabase da Macroservice.
- O Bearer Token da APIBrasil não é armazenado no app nem no GitHub; permanece em `APIBRASIL_TOKEN` nos Secrets do Supabase.
- Configurações do administrador agora permitem salvar/testar a URL e a Publishable Key do Supabase.
- Resposta da FIPE Beta mapeada para marca, modelo, ano fabricação/modelo, combustível, cilindrada, potência, cor, chassi parcial, código FIPE, valor e mês de referência.
- Quando a FIPE retorna mais de uma versão, o app permite escolher outra opção encontrada.
- Consultas em homologação são destacadas como dados de teste para evitar uso indevido em cotação real.
- Cadastro do veículo ganhou campo `VIN completo lido pelo Autel`.
- Catálogo técnico do veículo ganhou uma área para registrar o VIN AutoVIN do Autel DS900BT; o VIN completo passa a ser a referência prioritária para compatibilidade de peças.
- Incluído backup do código da Edge Function em `supabase/consultar-placa/index.ts`.

## Para ativar a consulta por placa no app
1. Abra o Macroservice como administrador → Configurações.
2. A URL do projeto Supabase já vem preenchida.
3. Cole somente a Publishable Key `sb_publishable_...` e toque em **Salvar integração**.
4. Use **Testar consulta ABC1234**. Enquanto a Edge Function estiver com `homolog: true`, o app mostrará HOMOLOGAÇÃO e os dados são somente de teste.
5. Para produção, adicione saldo no provedor e altere conscientemente a Edge Function para `homolog: false`.

Nunca coloque `APIBRASIL_TOKEN`, `service_role` ou `sb_secret_...` no GitHub Pages.
