# Relatório da OS com IA · MACROSERVICE V5.12.1

## Ativar na oficina

1. No projeto Supabase já usado pelo aplicativo, abra **Authentication → Users → Add user → Create new user**. Use um e-mail e uma senha de acesso da oficina e confirme o e-mail da conta. Se já houver uma conta de mecânico confirmada no Supabase Auth, você pode usá-la. Copie o **User UID**.
2. No painel da OpenAI, crie uma chave de API para o projeto da oficina em <https://platform.openai.com/api-keys>. A geração online usa a cota ou o saldo disponível nesse projeto.
3. No Supabase, em **Edge Functions → Secrets**, salve `OPENAI_API_KEY` com a chave da OpenAI e `MACRO_IA_ADMIN_ID` com o User UID do passo 1. O modelo padrão é `gpt-4.1-mini`. Se necessário, configure `OPENAI_MODEL` com um modelo de texto compatível com a Responses API e disponível no projeto.
4. Em **Edge Functions**, abra a função de slug **relatorio-os-** ou crie-a se for uma instalação nova. Para publicar ou atualizar o código, cole o conteúdo de `supabase/functions/relatorio-os-/index.ts` no editor e publique. Nas configurações **dessa função**, desative **Verify JWT with legacy secret**. A função faz a própria verificação do token com o Supabase Auth e confere o User UID antes de chamar a OpenAI. Quem usa a CLI pode executar `supabase functions deploy relatorio-os- --project-ref SEU_PROJECT_REF` na pasta que contém `supabase/config.toml`.
5. Atualize os arquivos do PWA na mesma pasta do GitHub Pages que já serve o aplicativo. Preserve seus valores personalizados em `integrations.js`. Feche as janelas do app no celular e reabra. O rodapé do login passa a mostrar **V5.12.1**. Ao manter a mesma origem e o mesmo navegador, o app reutiliza o histórico local.
6. No aplicativo, em **Administrador → Configurações**, salve a URL do projeto Supabase e sua **chave publicável** (`sb_publishable_…`, em **Settings → API Keys**). A chave da OpenAI fica apenas nos Secrets do Supabase.

## Gerar o primeiro relatório

Em **Administrador → Histórico**, escolha um orçamento e toque em **Criar relatório de manutenção**. Se o histórico estiver vazio, salve primeiro um orçamento em **Orçamento Rápido**.

Preencha o diagnóstico, as medições e o trabalho executado. No Samsung, você também pode ditar as anotações pelo microfone do teclado. Toque em **Gerar relatório com IA** e entre com a conta da oficina do passo 1. O acesso à IA dura até a sessão expirar, a página ser recarregada ou o administrador sair.

Revise o **Texto para o cliente** e toque em **Salvar relatório de manutenção**. O relatório fica no Histórico, ao lado do orçamento, com a opção **Imprimir / PDF**. Os campos de diagnóstico e as medições originais também aparecem no documento.

**Organizar sem IA** monta um texto com as anotações no próprio aparelho, inclusive antes da ativação ou quando a internet cair. O texto pode ser editado da mesma forma.

## Dados enviados

Ao gerar com IA, a função recebe os campos técnicos digitados, a marca, o modelo, o motor e o ano disponíveis. Mantenha as anotações técnicas livres de dados de contato. Os campos de cliente, telefone, placa, chassi e valores do orçamento ficam no aplicativo. O relatório só entra no histórico quando você o salva.

## Se aparecer um erro

- **Sessão expirada**. Toque novamente em **Gerar relatório com IA** e entre com a conta do Supabase Auth da oficina.
- **Conta sem autorização**. Compare o User UID dessa conta com o Secret `MACRO_IA_ADMIN_ID`.
- **Função indisponível**. Confira o slug `relatorio-os-`, a URL do projeto, o deploy e as configurações da função.
- **Limite de uso**. Confira a cota ou o saldo na conta da API e tente novamente. A ficha permanece disponível para edição.

Referências técnicas: [OpenAI Responses API](https://developers.openai.com/api/docs/quickstart), [Supabase Edge Functions](https://supabase.com/docs/guides/functions), [autorização no Supabase](https://supabase.com/docs/guides/functions/auth-headers).
