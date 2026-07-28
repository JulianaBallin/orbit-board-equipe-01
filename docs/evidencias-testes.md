<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Evidências e testes de integração

Este documento organiza as validações exigidas no trabalho final e registra capturas, resultados e responsáveis de cada cenário.

## Convenção dos arquivos

Salve as capturas em `docs/evidencias/capturas/` com o padrão:

```text
E<numero>-<descricao-curta>.png
```

Exemplo: `E01-containers-saudaveis.png`.

Não inclua tokens, senhas, emails pessoais, cookies ou outros segredos nas imagens e nos logs.

## Ambiente da execução final

| Campo | Valor verificado |
|---|---|
| Data | 28 de julho de 2026 |
| Sistema operacional | Ubuntu 24.04 |
| Docker e Compose | Docker 28.5.1 e Docker Compose 2.40.3 |
| .NET SDK | 8.0.415 |
| Node.js e npm | Node.js 20.19.5 e npm 10.8.2 |
| Commit testado | Branch `chore/final-audit`, criada a partir de `d6fa65e` |

## Roteiro de testes

| ID | Cenário | Resultado esperado | Evidência | Responsável | Status |
|---|---|---|---|---|---|
| E01 | Executar `docker compose up --build -d` | Dois serviços iniciados e saudáveis | `E01-containers-saudaveis.png` | Fernanda Costa | Concluído |
| E02 | Abrir `http://localhost:5173` | Dashboard carregado com dados | `E02-dashboard.png` | Fernanda Costa | Concluído |
| E03 | Abrir o Swagger | Endpoints visíveis em `/swagger` | `E03-swagger.png` | Fernanda Costa | Concluído |
| E04 | Consultar `/health` | JSON com status `healthy` | `E04-health.png` | Fernanda Costa | Concluído |
| E05 | Criar um projeto válido | Resposta `201` e projeto na interface | `E05-criar-projeto.png` | Juliana Ballin | Concluído |
| E06 | Repetir o nome do projeto | Resposta `409` e mensagem compreensível | `E06-projeto-duplicado.png` | Fernanda Costa | Concluído |
| E07 | Criar uma tarefa | Resposta `201` e tarefa no quadro | `E07-criar-tarefa.png` | Fernanda Costa | Concluído |
| E08 | Filtrar tarefas | Lista respeita status e prioridade | `E08-filtrar-tarefas.png` | Fernanda Costa | Concluído |
| E09 | Alterar status de uma tarefa | Tarefa muda de coluna e API responde `200` | `E09-alterar-status.png` | Fernanda Costa | Concluído |
| E10 | Excluir projeto com tarefa não concluída | Resposta `409` sem remover o projeto | `E10-bloqueio-exclusao.png` | Juliana Ballin | Concluído |
| E11 | Parar o backend e usar a interface | Frontend mostra erro de conexão | `E11-backend-indisponivel.png` | Fernanda Costa | Concluído |
| E12 | Consultar logs do Compose | Logs mostram inicialização sem erro não tratado | `E12-logs-containers.png` | Fernanda Costa | Concluído |
| E13 | Consultar `GET /api/tasks/{id}/history` pelo Swagger ou Postman | JSON com o histórico de transições de status em ordem cronológica | `E13-backend-task-history.png` | Fernanda Costa | Concluído |
| E14 | Abrir o histórico de status de uma tarefa pela interface (quadro ou tabela) | Modal exibe as transições de status em ordem cronológica, da mais recente para a mais antiga | `E14-historico-tarefa-frontend.png` | Pedro Henrique | Concluído |
| E15 | Excluir projeto cujas tarefas estão todas concluídas | Botão liberado e confirmação avisando que as tarefas concluídas serão removidas, com os demais projetos ainda bloqueados | `E15-exclusao-permitida.png` | Camila Félix | Concluído |
| E16 | Confirmar a exclusão do projeto concluído | Resposta `204`, aviso de sucesso e projeto fora da listagem | `E16-exclusao-concluida.png` | Camila Félix | Concluído |
| E17 | Arrastar uma tarefa entre colunas do quadro | Card acompanha o cursor, coluna de destino destacada e status gravado pela API | `E17-arrastar-tarefa.png` | Camila Félix | Concluído |
| E18 | Conferir a ordem da coluna com prioridades diferentes | Tarefas agrupadas da prioridade mais alta para a mais baixa | `E18-ordem-por-prioridade.png` | Camila Félix | Concluído |
| E19 | Reordenar tarefas de mesma prioridade pelo arraste e recarregar | Ordem definida na mão continua igual após recarregar a página | `E19-ordem-manual-persistida.png` | Camila Félix | Concluído |
| E20 | Abrir o formulário de novo colaborador e expandir o campo Cargo | Lista de cargos pré-definidos, já com um valor selecionado | `E20-cargo-lista-cadastro.png` | Camila Félix | Concluído |
| E21 | Cadastrar um colaborador válido e voltar para a Equipe | Resposta `201` e integrante novo na grade, junto da equipe do projeto | `E21-colaborador-cadastrado.png` | Camila Félix | Concluído |
| E22 | Cadastrar colaborador com email já usado | Resposta `409`, mensagem explicando o conflito e formulário preservado | `E22-colaborador-email-repetido.png` | Camila Félix | Concluído |
| E23 | Alternar a interface para o tema escuro | Tema aplicado em toda a interface, com componentes legíveis e controle de alternância visível | `E23-tema-escuro.png` | Allef Oliveira | Concluído |
| E24 | Executar os testes automatizados do frontend após as alterações | 88 testes em 17 arquivos aprovados, sem warnings | `E24-testes-tema.png` | Equipe | Concluído |
| E27 | Abrir a tela de Equipe com a gestão completa | Cada card exibe as ações de editar e excluir | `E27-acoes-colaborador.png` | Camila Félix | Concluído |
| E28 | Excluir integrante responsável por projeto e tarefa | Resposta `409` informando quantos vínculos existem, com a lista preservada | `E28-bloqueio-exclusao-colaborador.png` | Camila Félix | Concluído |
| E29 | Excluir integrante sem vínculo | Resposta `204`, aviso de sucesso e grade sem o integrante | `E29-colaborador-excluido.png` | Camila Félix | Concluído |
| E30 | Acionar a exclusão de um colaborador | Modal de confirmação com o aviso de que integrantes vinculados não podem ser excluídos | `E30-modal-exclusao-colaborador.png` | Camila Félix | Concluído |

## Verificações técnicas iniciais

Verificação executada em 20 de julho de 2026 na branch `feature/project-foundation`.

| Comando | Resultado inicial | Execução final da equipe |
|---|---|---|
| `dotnet build --configuration Release` | Aprovado, sem erros e sem avisos | Confirmado em 28 de julho |
| `npm run build` | Aprovado com Vite 8.1.5 | Confirmado em 28 de julho |
| `npm audit --audit-level=moderate` | Aprovado, nenhuma vulnerabilidade encontrada | Aviso atual registrado na reverificação final |
| `docker compose config` | Aprovado | Confirmado em 28 de julho |
| `docker compose up --build -d` | Aprovado, dois serviços saudáveis | Confirmado em 28 de julho |

### Ambiente da verificação inicial

| Ferramenta | Versão |
|---|---|
| Sistema operacional | Ubuntu 24.04 |
| Docker | 28.5.1 |
| Docker Compose | 2.40.3 |
| .NET SDK | 8.0.415 |
| Node.js | 20.19.5 |
| npm | 10.8.2 |

### Resultados HTTP iniciais

| Verificação | Resultado |
|---|---|
| Backend `/health` | `200`, serviço saudável |
| Frontend `/` | `200` |
| Swagger `/swagger/index.html` | `200` |
| CORS para `http://localhost:5173` | Origem autorizada |
| Dashboard | 3 projetos, 5 tarefas e 1 tarefa concluída nos dados iniciais |
| Criação temporária de projeto | Aprovada |
| Tentativa de nome duplicado | `409`, conflito tratado corretamente |
| Exclusão do projeto temporário | `204` |
| Logs dos containers | Inicialização sem erro não tratado e aviso esperado para o conflito |

Esses resultados registram a preparação técnica inicial. A reverificação final abaixo confirma o estado atual depois das novas funcionalidades.

### Reverificação técnica

Reverificação executada em 27 de julho de 2026 na branch `chore/finalize-final-deliverables`, antes da abertura do MR final para `develop`.

| Verificação | Resultado |
|---|---|
| `dotnet test backend/OrbitBoard.Api.sln` | Aprovado, 29 testes (19 unitários e 10 de integração) |
| `npm test` (frontend) | Aprovado, 10 testes em 4 arquivos |
| `npm run build` (frontend) | Aprovado com Vite 8.1.5 |
| `dotnet build --configuration Release` | Aprovado, sem erros e sem avisos |
| `npm audit --audit-level=moderate` | 2 vulnerabilidades moderadas em `react-router` (ver Registro de falhas) |
| `docker compose config` | Aprovado |
| `docker compose up --build -d` | Aprovado, backend e frontend saudáveis |
| `GET /health`, `/api/dashboard`, `/api/projects`, `/api/tasks`, `/api/tasks/{id}/history` | Todos com `200` e JSON válido |
| `POST /api/projects` com nome duplicado | `409` tratado corretamente |
| CORS para `http://localhost:5173` | Origem autorizada |

Essa reverificação histórica confirmou o funcionamento existente naquele estágio. A reverificação final de 28 de julho, registrada abaixo, substitui os números de testes e confirma que todas as capturas previstas foram incorporadas ao relatório.

### Reverificação da regra de exclusão de projeto

Executada em 27 de julho de 2026 na branch `feat/project-delete-validation`, após ajustar a regra para liberar a exclusão quando todas as tarefas do projeto estão concluídas.

| Verificação | Resultado |
|---|---|
| `dotnet test backend/OrbitBoard.Api.sln` | Aprovado, 33 testes (21 unitários e 12 de integração) |
| `npm test` (frontend) | Aprovado, 13 testes em 5 arquivos |
| `DELETE /api/projects/{id}` com tarefa em aberto | `409`, projeto preservado |
| `DELETE /api/projects/{id}` com todas as tarefas concluídas | `204`, projeto e tarefas concluídas removidos |
| Listagem de tarefas após a exclusão | `200`, nenhuma tarefa órfã e todos os nomes de projeto resolvidos |

Cobertura automatizada adicionada nesta verificação:

| Teste | Camada |
|---|---|
| `DeleteProject_WithUnfinishedTasks_ThrowsConflict` | Serviço |
| `DeleteProject_WithOnlyDoneTasks_RemovesProjectAndItsTasks` | Serviço |
| `DeleteProject_WithOnlyDoneTasks_KeepsRemainingTasksReadable` | Serviço |
| `DeleteProject_WithUnfinishedTasks_Returns409` | API |
| `DeleteProject_WithOnlyDoneTasks_Returns204` | API |
| `ProjectsPage delete guard` (3 casos) | Interface |

### Reverificação da alteração de tema

Executada em 28 de julho de 2026 após a implementação dos temas claro e escuro e os ajustes nos testes do frontend.

| Verificação | Resultado |
|---|---|
| `npm test` (frontend) | Aprovado, 49 testes em 10 arquivos |
| Testes do `themeService` | Aprovado, 7 casos |
| Inicialização do tema | Respeita o tema aplicado, a preferência salva e, na ausência deles, o tema do sistema |
| Alternância e persistência | Alterna entre claro e escuro, persiste a escolha no `localStorage` e emite `themechange` |
| Compatibilidade visual | Cores e componentes ajustados para preservar contraste e legibilidade |
| Warnings da suíte | Execução sem warnings do React Router e de atualizações fora de `act(...)` |

Os testes do `themeService` cobrem a preferência do sistema, o tema persistido, a prioridade do tema já aplicado, a persistência, o evento `themechange`, a alternância e a rejeição de valores inválidos. As capturas E23 e E24 registram, respectivamente, o resultado visual e a saída final da suíte.

### Reverificação final

Executada em 28 de julho de 2026 na branch `chore/final-audit`, criada a partir da versão `d6fa65e` de `develop`.

| Verificação | Resultado |
|---|---|
| `dotnet test backend/OrbitBoard.Api.sln --configuration Release` | Aprovado, 73 testes: 42 unitários e 31 de integração |
| `npm test` | Aprovado, 88 testes em 17 arquivos |
| `npm run build` | Aprovado com React Router 7.18.1 e Vite 8.1.5 |
| Compatibilidade com Node 20 | Aprovada após fixar `@testing-library/jest-dom` em 6.9.1 |
| `docker compose config` | Aprovado |
| `docker compose up --build --detach` | Aprovado, backend e frontend saudáveis |
| Fluxo HTTP no Compose | Aprovadas as 19 operações da API, as 10 rotas de destino e os 2 redirecionamentos do SPA |
| Renderização em navegador headless | Aprovadas 15 entradas do SPA, incluindo edição existente e erro para IDs inexistentes |
| Frontend em `/dashboard` e backend em `/health` | Respostas `200` |
| CORS para `http://localhost:5173` | Origem autorizada |
| Cadastro e edição de colaborador | Respostas `201` e `200` |
| Nome de projeto duplicado | Resposta `409` |
| Exclusão de projeto com tarefa pendente | Resposta `409` |
| Histórico da tarefa | Uma entrada na criação e duas após mudança para `Done` |
| Exclusão de projeto concluído | Resposta `204`, tarefa removida em cascata e consulta posterior com `404` |
| Exclusão de colaborador sem vínculos | Resposta `204` |
| Reinício do backend | Aprovado, registro temporário removido e carga inicial restaurada com 3 projetos, 5 tarefas e histórico de criação |
| `npm audit --audit-level=moderate` | Duas ocorrências de severidade alta associadas ao mesmo aviso de RSC do React Router |

O aviso atual do `npm audit` afeta o modo React Server Components. O OrbitBoard usa uma SPA com Vite, `BrowserRouter` e API ASP.NET Core separada, sem RSC. A versão 7.18.1 foi mantida porque corrige os avisos anteriores aplicáveis à navegação. A equipe deve monitorar a publicação de uma versão que também corrija o aviso de RSC.

### Cobertura final de rotas e persistência

O teste `Swagger_ExposesExactlyTheNineteenDocumentedOperations` impede divergência entre o contrato e as 19 operações HTTP expostas. A tabela relaciona cada operação a pelo menos um caso de integração aprovado:

| Operação | Cobertura automatizada | Status |
|---|---|---|
| `GET /health` | `Health_ReturnsHealthyPayload` | Aprovado |
| `GET /api/dashboard` | `GetDashboard_ReturnsConsistentTotals` | Aprovado |
| `GET /api/projects` | `GetProjects_ReturnsSeededProjectsAsJson` | Aprovado |
| `GET /api/projects/{id}` | `GetProject_WhenExists_Returns200WithTheRequestedProject` e caso `404` | Aprovado |
| `POST /api/projects` | `CreateProject_WithValidData_Returns201AndIsListed` e conflito `409` | Aprovado |
| `PUT /api/projects/{id}` | `UpdateProject_WithValidData_Returns200AndPersists` | Aprovado |
| `DELETE /api/projects/{id}` | Casos com tarefas abertas e somente concluídas | Aprovado |
| `GET /api/tasks` | Listagem, posição e filtro por status | Aprovado |
| `GET /api/tasks/{id}` | Consulta após criação e ausência após exclusão | Aprovado |
| `POST /api/tasks` | `CreateAndGetTask_WithValidData_Returns201AndPersistsInitialHistory` | Aprovado |
| `PUT /api/tasks/{id}` | `UpdateTask_WithValidData_Returns200AndPersistsStatusHistory` | Aprovado |
| `PATCH /api/tasks/{id}/status` | Mudança de status, persistência e histórico | Aprovado |
| `PATCH /api/tasks/{id}/position` | Movimento, reordenação, posição inválida e tarefa ausente | Aprovado |
| `DELETE /api/tasks/{id}` | `DeleteTask_WhenExists_Returns204AndRemainsAbsent` | Aprovado |
| `GET /api/tasks/{id}/history` | Criação, transição e tarefa ausente | Aprovado |
| `GET /api/team-members` | `GetTeamMembers_ReturnsSeededMembers` | Aprovado |
| `POST /api/team-members` | Cadastro, email repetido e validações de entrada | Aprovado |
| `PUT /api/team-members/{id}` | Edição, leitura posterior, conflito e ausência | Aprovado |
| `DELETE /api/team-members/{id}` | Exclusão livre, bloqueio por vínculo e ausência | Aprovado |

As 10 rotas de destino do frontend e os redirecionamentos de `/` e de rota desconhecida são exercitados pelos 12 casos de `App.test.jsx`. A persistência em memória foi confirmada por requisições consecutivas de escrita e leitura para projeto, tarefa, integrante, posição e histórico. A preferência de tema permanece após recarga por `localStorage`. O teste ao vivo também confirmou que reiniciar o processo do backend remove o registro temporário e restaura os 3 projetos, as 5 tarefas e o histórico inicial, comportamento esperado para o escopo sem banco de dados.

## Teste de uma chamada HTTP

Depois de iniciar o ambiente, execute:

```bash
curl --fail --silent http://localhost:5200/health
curl --fail --silent http://localhost:5200/api/dashboard
curl --fail --silent http://localhost:5200/api/projects
```

Cole abaixo somente um resumo do resultado, sem dados sensíveis:

```text
Verificação final aprovada em 28 de julho de 2026: health, dashboard e projetos responderam com HTTP 200 e JSON válido.
```

## Registro de falhas

Para cada falha encontrada, registre:

| Campo | Conteúdo |
|---|---|
| Cenário | Qual teste falhou |
| Sintoma | Mensagem ou comportamento observado |
| Causa | Motivo identificado |
| Correção | Alteração realizada |
| Evidência | Captura, log, commit ou MR |
| Responsável | Integrante que investigou |

### Falhas registradas

| Cenário | Sintoma | Causa | Correção | Evidência |
|---|---|---|---|---|
| `npm audit` no frontend | React Router 6 relatava dois avisos moderados | A versão usada estava dentro dos intervalos afetados | Migração para React Router 7.18.1, com 88 testes e build aprovados | `npm test`, `npm run build` e `npm audit` |
| Auditoria após a migração | Duas ocorrências de severidade alta para o mesmo aviso de RSC | O aviso atual alcança a versão 7.18.1, mas o OrbitBoard não usa React Server Components | Risco analisado e registrado; `make audit` aceita somente esse aviso conhecido e falha para qualquer outro | GHSA-qwww-vcr4-c8h2 |
| `npm ci` com Node 20 | Aviso `EBADENGINE` na biblioteca `@testing-library/jest-dom` 7 | A versão 7 exige Node 22, enquanto o projeto e a CI usam Node 20 | Dependência ajustada para 6.9.1, compatível com Node 20 | `npm ci` |
| `make validate` | A validação completa não executava testes automatizados | O alvo dependia somente de builds, auditoria e Compose | Criados `backend-test`, `frontend-test` e `test`; `validate` agora inclui as duas suítes | `Makefile` |
| Rota de edição com ID inexistente | Formulários de projeto, tarefa e integrante podiam aparecer vazios após falha de carga | O erro de carregamento compartilhava o mesmo estado do erro de gravação | Falha de carga separada do formulário, com mensagem e tentativa novamente; casos automatizados adicionados | `ProjectFormPage.test.jsx`, `TaskFormPage.test.jsx` e `TeamMemberFormPage.test.jsx` |
