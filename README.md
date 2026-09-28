# Macroservice App V5.4

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


## Novidades V5.4
- Logo principal atualizado para a nova arte com fundo tecnológico em azul profundo.
- Ícone do app atualizado sem a borda duplicada anterior.
- Imagem do topo da tela de login atualizada automaticamente via `icon-512.png`.
- Service worker atualizado para forçar renovação do cache da nova identidade visual.
