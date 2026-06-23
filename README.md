# Diário de Preceptoria

Site estático para GitHub Pages com formulário de registro e painel de histórico conectado ao Google Sheets por Google Apps Script.

## Como Atualizar o Site Depois de Mudanças Feitas Com o Codex

Use esta seção sempre que você pedir mudanças aqui no Codex e quiser colocar a nova versão no ar.

### 1. Entenda Quais Arquivos Mudaram

Depois que o Codex fizer uma alteração, ele normalmente vai dizer quais arquivos foram modificados. Os mais comuns são:

- `index.html`: muda textos, campos, botões e estrutura da tela.
- `styles.css`: muda cores, tamanhos, espaçamentos e aparência.
- `script.js`: muda funcionamento do site.
- `assets/logo-prmfc.png`: imagem do logo no topo.
- `apps-script/Code.gs`: muda a ponte com o Google Sheets.
- `README.md`: muda este arquivo de instruções.

### 2. Se Mudou index.html, styles.css ou script.js

Esses arquivos ficam no GitHub e controlam o site publicado no GitHub Pages.

1. Abra seu repositório no GitHub.
2. Clique no arquivo que mudou, por exemplo `script.js`.
3. Clique no ícone de lápis, que significa editar.
4. Apague todo o conteúdo antigo do arquivo no GitHub.
5. Copie o conteúdo novo do mesmo arquivo aqui na pasta do projeto.
6. Cole no GitHub.
7. Clique em `Commit changes`.
8. Aguarde alguns minutos.
9. Abra o site publicado e recarregue a página.

Repita isso para cada arquivo que mudou.

### 3. Se Mudou apps-script/Code.gs

Esse arquivo não atualiza pelo GitHub Pages. Ele precisa ser atualizado no Google Apps Script.

1. Abra sua planilha do Google Sheets.
2. Clique em `Extensões` > `Apps Script`.
3. Abra o arquivo `Code.gs`.
4. Apague todo o código antigo.
5. Copie o conteúdo novo de `apps-script/Code.gs`.
6. Cole no `Code.gs` do Google Apps Script.
7. Confirme se o `SPREADSHEET_ID` continua com o ID correto da sua planilha.
8. Clique em salvar.
9. Clique em `Implantar`.
10. Clique em `Gerenciar implantações`.
11. Clique no lápis para editar a implantação atual.
12. Em `Versão`, escolha `Nova versão`.
13. Clique em `Implantar` ou `Salvar`.

Isso mantém a mesma URL `/exec`, mas usando o código novo.

### 4. Como Saber se Precisa Atualizar o Apps Script

Você precisa atualizar o Apps Script quando o arquivo alterado for:

`apps-script/Code.gs`

Exemplos de mudanças que normalmente mexem no Apps Script:

- salvar novos campos na planilha;
- criar uma nova aba;
- editar ou excluir registros;
- mudar cabeçalhos do Google Sheets;
- mudar como o site lê dados da planilha.

### 5. Como Testar Depois de Atualizar

1. Abra o site publicado no GitHub Pages.
2. Recarregue a página.
3. Faça uma ação pequena, como registrar uma atividade de teste.
4. Abra a planilha e confira se o dado entrou.
5. Abra a aba `Histórico` e confira se o registro aparece.
6. Se algo der erro, copie a mensagem e mande aqui para o Codex.

### 6. Dica Importante

Se você alterou `script.js` e `apps-script/Code.gs`, atualize os dois lugares:

- `script.js` no GitHub;
- `Code.gs` no Google Apps Script.

Se atualizar só um deles, o site pode ficar usando uma versão nova de um lado e antiga do outro.

## Arquivos

- `index.html`: estrutura da tela.
- `styles.css`: layout responsivo com foco em celular.
- `script.js`: integração com a API do Apps Script.
- `apps-script/Code.gs`: código para copiar no Google Apps Script.

## Passo a Passo Detalhado

Siga nesta ordem:

1. Preparar a planilha do Google Sheets.
2. Configurar o Google Apps Script.
3. Colocar a URL do Apps Script no arquivo `script.js`.
4. Criar o repositório no GitHub.
5. Enviar os arquivos para o GitHub.
6. Ativar o GitHub Pages.
7. Testar o site publicado.

## 1. Preparar a Planilha

1. Abra a planilha do Google Sheets que já recebe os dados do AppSheet.
2. Confira se existe uma aba chamada exatamente:
   `Registo do Preceptor`
3. Na primeira linha dessa aba, confira se existem estes cabeçalhos:
   - `ID Registo`
   - `Data e Hora`
   - `Nome do Preceptor`
   - `E-mail do Preceptor`
   - `Unidade`
   - `Ano do Residente`
   - `Nome do Residente`
   - `Atividade Realizada`
   - `Registo Descritivo`
   - `Qual EPA isso se relaciona?`
4. Se alguma dessas colunas não existir, crie a coluna na primeira linha.
5. Confira se existe uma aba chamada:
   `Base de Dados das Atividades`
6. Essa aba pode ter colunas de atividades e EPAs, mas o site já tem listas internas. Então, se essa aba ainda não estiver perfeita, tudo bem.
7. Crie uma aba chamada:
   `Cadastro de Preceptores`
8. Nessa aba, use estes cabeçalhos:
   - `Nome do Preceptor`
   - `E-mail do Preceptor`
   - `Unidade`
   - `Perfil`
9. Cadastre todos os preceptores que poderão usar o site, com e-mail e unidade.
10. Preencha a coluna `Unidade` usando sempre os nomes oficiais das unidades.
11. A lista suspensa de unidades do site vem dessa aba. Se uma unidade não estiver cadastrada ali, ela não aparecerá para seleção no site.
12. O e-mail informado no site precisa existir nessa aba. Se o e-mail estiver fora do cadastro, o site não libera a consulta/salvamento na planilha.
13. A unidade selecionada no site precisa ser a mesma unidade cadastrada para aquele e-mail.

## 2. Copiar o ID da Planilha

1. Com a planilha aberta, olhe a barra de endereço do navegador.
2. O endereço será parecido com este:
   `https://docs.google.com/spreadsheets/d/1ABCDEFghiJKLmnop123456789/edit#gid=0`
3. O ID da planilha é a parte que fica entre `/d/` e `/edit`.
4. No exemplo acima, o ID seria:
   `1ABCDEFghiJKLmnop123456789`
5. Copie o ID da sua planilha. Você vai usar no próximo passo.

## 3. Configurar o Apps Script

1. Na própria planilha, clique no menu:
   `Extensões` > `Apps Script`
2. Vai abrir uma nova página do Google Apps Script.
3. Se aparecer um projeto sem nome, você pode dar um nome como:
   `API Registro Preceptoria`
4. No lado esquerdo, clique no arquivo `Code.gs`.
5. Apague todo o conteúdo que estiver dentro dele.
6. Volte para esta pasta do projeto e abra o arquivo:
   `apps-script/Code.gs`
7. Copie todo o conteúdo desse arquivo.
8. Cole esse conteúdo dentro do `Code.gs` no Google Apps Script.
9. No começo do código, procure esta linha:
   `SPREADSHEET_ID: "COLE_AQUI_O_ID_DA_SUA_PLANILHA",`
10. Substitua `COLE_AQUI_O_ID_DA_SUA_PLANILHA` pelo ID real da sua planilha.
11. A linha deve ficar parecida com:
   `SPREADSHEET_ID: "1ABCDEFghiJKLmnop123456789",`
12. Clique no ícone de salvar ou pressione `Ctrl + S` / `Command + S`.

### Como Conferir se o Code.gs Foi Copiado Inteiro

O arquivo `apps-script/Code.gs` completo tem mais de 500 linhas. Se no Google Apps Script ele estiver indo só até perto da linha 100, a cópia ficou incompleta.

Faça assim:

1. Abra o arquivo local:
   `apps-script/Code.gs`
2. Selecione o arquivo inteiro:
   `Ctrl + A` no Windows ou `Command + A` no Mac.
3. Copie:
   `Ctrl + C` no Windows ou `Command + C` no Mac.
4. Volte para o Google Apps Script.
5. Clique dentro do arquivo `Code.gs`.
6. Selecione tudo que estiver lá:
   `Ctrl + A` no Windows ou `Command + A` no Mac.
7. Apague ou cole por cima.
8. Cole o código completo:
   `Ctrl + V` no Windows ou `Command + V` no Mac.
9. Role até o final do arquivo no Google Apps Script.
10. O final correto do arquivo deve terminar assim:

```js
function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Se o arquivo não terminar com esse trecho, ele ainda não foi copiado inteiro.

## 4. Publicar o Apps Script Como Web App

1. No canto superior direito do Apps Script, clique em:
   `Implantar`
2. Clique em:
   `Nova implantação`
3. Ao lado de `Selecionar tipo`, clique no ícone de engrenagem.
4. Escolha:
   `App da Web`
5. Em `Descrição`, escreva algo como:
   `Primeira versão`
6. Em `Executar como`, escolha:
   `Eu`
7. Em `Quem pode acessar`, escolha:
   `Qualquer pessoa`
8. Clique em:
   `Implantar`
9. O Google vai pedir autorização. Clique em:
   `Autorizar acesso`
10. Escolha sua conta Google.
11. Se aparecer uma tela avisando que o app não foi verificado, clique em:
   `Avançado`
12. Depois clique em:
   `Acessar API Registro Preceptoria`
13. Clique em:
   `Permitir`
14. Ao final, o Apps Script vai mostrar uma `URL do app da Web`.
15. Copie essa URL. Ela normalmente termina com `/exec`.

Guarde essa URL. Ela é a ponte entre o site e a planilha.

## 5. Colocar a URL no Site

1. Abra o arquivo `script.js`.
2. Logo no começo do arquivo, você verá:
   `APPS_SCRIPT_URL: "COLE_AQUI_A_URL_DO_SEU_WEB_APP",`
3. Apague apenas o texto `COLE_AQUI_A_URL_DO_SEU_WEB_APP`.
4. Cole no lugar a URL do Apps Script que você copiou.
5. A linha deve ficar parecida com:
   `APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx.../exec",`
6. Salve o arquivo `script.js`.

## 6. Criar o Repositório no GitHub

1. Entre no site do GitHub:
   `https://github.com`
2. Faça login na sua conta.
3. No canto superior direito, clique no botão `+`.
4. Clique em:
   `New repository`
5. Em `Repository name`, escreva um nome simples, por exemplo:
   `registro-preceptoria`
6. Marque a opção:
   `Public`
7. Não precisa marcar `Add a README file`, porque este projeto já tem um `README.md`.
8. Clique em:
   `Create repository`

## 7. Enviar os Arquivos Para o GitHub Pelo Navegador

1. Depois de criar o repositório, clique em:
   `uploading an existing file`
2. Envie estes arquivos:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
   - `assets/logo-prmfc.png`
3. Envie também a pasta:
   `apps-script`
4. Se o GitHub não deixar arrastar a pasta inteira, abra a pasta `apps-script` no seu computador e envie o arquivo `Code.gs` separadamente.
5. No campo `Commit changes`, escreva:
   `Primeira versão do site`
6. Clique em:
   `Commit changes`

## 8. Ativar o GitHub Pages

1. Dentro do repositório no GitHub, clique em:
   `Settings`
2. No menu lateral esquerdo, clique em:
   `Pages`
3. Em `Build and deployment`, procure `Source`.
4. Em `Source`, selecione:
   `Deploy from a branch`
5. Em `Branch`, escolha:
   `main`
6. Ao lado, escolha:
   `/(root)`
7. Clique em:
   `Save`
8. Aguarde alguns minutos.
9. A própria página vai mostrar o endereço publicado do site.
10. O endereço será parecido com:
    `https://seu-usuario.github.io/registro-preceptoria/`

## 9. Testar o Site

1. Abra o endereço do GitHub Pages.
2. Digite o nome e e-mail de um preceptor.
3. Faça um registro simples no Diário.
4. Veja se ele aparece no histórico.
5. Abra a aba `Histórico`.
6. Confira se o registro aparece nos cards.
7. Abra sua planilha e confirme se os dados entraram na aba correta.

## 10. Quando Você Alterar o Código Depois

Se você alterar arquivos do site, como `index.html`, `styles.css` ou `script.js`:

1. Envie os arquivos alterados novamente para o GitHub.
2. Aguarde o GitHub Pages atualizar.
3. Recarregue o site.

Se você alterar o arquivo `apps-script/Code.gs`:

1. Copie o novo conteúdo para o Google Apps Script.
2. Salve.
3. Clique em `Implantar`.
4. Clique em `Gerenciar implantações`.
5. Edite a implantação existente.
6. Crie uma nova versão.
7. Salve a implantação.

Isso garante que a URL `/exec` use o código atualizado.

## Funcionamento do registro

- `Nome do Preceptor` e `E-mail do Preceptor` continuam obrigatórios na identificação.
- O campo `Unidade` aparece na identificação como uma lista suspensa fechada.
- A lista de unidades vem da aba `Cadastro de Preceptores`, usando os nomes preenchidos na coluna `Unidade`.
- O Apps Script confere se o e-mail do preceptor existe no `Cadastro de Preceptores`.
- O Apps Script também confere se a unidade selecionada corresponde à unidade cadastrada para aquele e-mail.
- O histórico pode ser alternado entre `Meus registros` e `Minha unidade`.
- Em `Minha unidade`, o preceptor consegue ler e copiar registros de colegas da mesma unidade.
- Em registros feitos por outros preceptores, os botões de editar e excluir não aparecem.
- Os campos da atividade não são obrigatórios. O preceptor pode registrar uma atividade mesmo deixando ano, residente, atividade, descrição ou EPA em branco.
- O campo `Nome do Residente` memoriza nomes já digitados ou carregados do histórico e mostra sugestões em novos registros.
- O campo `Qual EPA isso se relaciona?` permite selecionar mais de uma EPA. Quando houver múltiplas EPAs, elas são salvas na mesma célula separadas por ponto e vírgula.
- No histórico, cada registro criado pelo site pode ser editado ou excluído.
- O histórico pode ser filtrado por busca livre, residente, atividade e intervalo de datas.
- O histórico é exibido em cards para facilitar a leitura do registro descritivo.
- Cada card tem o botão `Copiar feedback`, que copia um texto organizado para colar em feedbacks dos residentes.
- A edição e a exclusão usam `ID Registo` e `E-mail do Preceptor` para localizar o registro correto na planilha.

## Funcionamento do histórico

- Depois da identificação, o aplicativo mostra duas abas: `Diário` e `Histórico`.
- Em `Histórico`, o preceptor consulta registros, filtra, copia feedbacks e alterna entre `Meus registros` e `Minha unidade`.

## Cabeçalhos esperados

Na aba `Registo do Preceptor`, o script procura cabeçalhos equivalentes a:

- `ID Registo`
- `Data e Hora`
- `Nome do Preceptor`
- `E-mail do Preceptor`
- `Unidade`
- `Ano do Residente`
- `Nome do Residente`
- `Atividade Realizada`
- `Registo Descritivo`
- `Qual EPA isso se relaciona?`

Na aba `Base de Dados das Atividades`, o script tenta carregar listas para preenchimento automático usando:

- `Atividade Realizada`
- `Qual EPA isso se relaciona?`

Os nomes podem ter pequenas variações, com ou sem acento, como `Atividade`, `Atividade realizada`, `EPA` ou `EPA correspondente`.

Na aba `Cadastro de Preceptores`, use estes cabeçalhos:

- `Nome do Preceptor`
- `E-mail do Preceptor`
- `Unidade`
- `Perfil`

Essa aba controla os nomes fixos das unidades que aparecem na lista suspensa do site.

## Unidades de Saúde

O site já vem com estas unidades na lista suspensa:

- `CMS Heitor Beltrão`
- `CMS Hélio Pellegrino`
- `CMS Maria Augusta Estrella`
- `CMS Ernani Agrícola`
- `CF Odalea Firmo Dutra`
- `CMS Salles Netto`
- `CF Sérgio Vieira de Mello`
- `CF Ana Maria Conceição dos Santos Correia`
- `Paraty`
- `Piraí`
- `Três Rios`
- `Cabo Frio`
- `Volta Redonda`
- `AMI`
- `Saúde da Mulher`

Mesmo com essa lista fixa no site, cada preceptor ainda precisa estar cadastrado na aba `Cadastro de Preceptores` com a unidade correta para o seu e-mail.
Se a planilha ainda tiver `Centro Municipal de Saúde...` ou `Clínica da Família...`, o sistema converte para `CMS` e `CF` automaticamente.

## Opções de atividade

O site já vem com estas opções no campo `Atividade Realizada`:

- `Observação direta de Visita Domiciliar`
- `Observação direta de Consulta Individual`
- `Observação direta de Reunião de Equipe`
- `Observação direta de Atividade Coletiva`
- `Observação direta de Consultório Territorializado`
- `Discussão de Abordagem Familiar`
- `Discussão de Abordagem Comunitária`
- `Supervisão de Turnos UERJ (AMI / Saúde da Mulher / PG)`
- `Supervisão de Canal Teórico da Clínica`
- `Supervisão de TCR`
- `Realização de feedback`
- `Supervisão de prontuário`
- `Supervisão de Procedimento Ambulatorial`
- `Outros`

Se a aba `Base de Dados das Atividades` tiver uma coluna de atividades preenchida, o site pode usar a lista da planilha. Se ela ainda não estiver pronta, usa a lista acima.

## Opções de EPA

O campo `Qual EPA isso se relaciona?` já vem com estas opções e permite marcar mais de uma:

- `EPA 1 – Atendendo integralmente as condições em saúde em todas as faixas etárias e ciclos de vida`
- `EPA 2 – Atendendo pessoas de etnia, raça ou cultura semelhante ou distinta da sua própria`
- `EPA 3 – Atendendo pessoas LGBTQIAPN+`
- `EPA 4 – Atendendo pessoas vulnerabilizadas`
- `EPA 5 – Coordenando o cuidado com base nas necessidades da pessoa`
- `EPA 6 – Realizando cuidado domiciliar`
- `EPA 7 – Realizando procedimentos ambulatoriais`
- `EPA 8 – Realizando o atendimento inicial às situações de urgência e emergência`
- `EPA 9 – Facilitando o ensino de Medicina de Família e Comunidade aos seus pares e outros aprendizes`
- `EPA 10 – Atendendo pessoas acometidas por transtornos mentais`
- `EPA 11 – Organizando os processos de trabalho em saúde`
- `EPA 12 – Utilizando a abordagem familiar no cuidado às pessoas e suas famílias`
- `EPA 13 – Utilizando a abordagem comunitária no cuidado das pessoas, famílias e comunidade`
- `EPA 14 – Promovendo acesso e continuidade do cuidado`
- `EPA 15 – Promovendo saúde planetária em seu contexto`

## Observação de privacidade

GitHub Pages é hospedagem estática. Nesta versão, o histórico é filtrado por `E-mail do Preceptor`, o que evita misturar registros de pessoas com nomes parecidos. Ainda assim, isso não substitui login institucional real. Para uma camada ainda mais forte no futuro, o próximo passo seria autenticação com Google OAuth.
