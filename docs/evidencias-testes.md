<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Evidências e testes de integração

Este documento organiza as validações exigidas no trabalho final. Capturas, resultados e responsáveis devem ser preenchidos pelos integrantes que executarem cada cenário.

## Convenção dos arquivos

Salve as capturas em `docs/evidencias/capturas/` com o padrão:

```text
E<numero>-<descricao-curta>.png
```

Exemplo: `E01-containers-saudaveis.png`.

Não inclua tokens, senhas, emails pessoais, cookies ou outros segredos nas imagens e nos logs.

## Ambiente da execução final

| Campo | Valor a registrar |
|---|---|
| Data | Pendente |
| Sistema operacional | Pendente |
| Docker e Compose | Pendente |
| .NET SDK | Pendente |
| Node.js e npm | Pendente |
| Commit testado | Pendente |

## Roteiro de testes

| ID | Cenário | Resultado esperado | Evidência | Responsável | Status |
|---|---|---|---|---|---|
| E01 | Executar `docker compose up --build -d` | Dois serviços iniciados e saudáveis | `E01-containers-saudaveis.png` | Definir | Pendente |
| E02 | Abrir `http://localhost:5173` | Dashboard carregado com dados | `E02-dashboard.png` | Definir | Pendente |
| E03 | Abrir o Swagger | Endpoints visíveis em `/swagger` | `E03-swagger.png` | Definir | Pendente |
| E04 | Consultar `/health` | JSON com status `healthy` | `E04-health.png` | Definir | Pendente |
| E05 | Criar um projeto válido | Resposta `201` e projeto na interface | `E05-criar-projeto.png` | Definir | Pendente |
| E06 | Repetir o nome do projeto | Resposta `409` e mensagem compreensível | `E06-projeto-duplicado.png` | Definir | Pendente |
| E07 | Criar uma tarefa | Resposta `201` e tarefa no quadro | `E07-criar-tarefa.png` | Definir | Pendente |
| E08 | Filtrar tarefas | Lista respeita status e prioridade | `E08-filtrar-tarefas.png` | Definir | Pendente |
| E09 | Alterar status de uma tarefa | Tarefa muda de coluna e API responde `200` | `E09-alterar-status.png` | Definir | Pendente |
| E10 | Excluir projeto com tarefa não concluída | Resposta `409` sem remover o projeto | `E10-bloqueio-exclusao.png` | Definir | Pendente |
| E11 | Parar o backend e usar a interface | Frontend mostra erro de conexão | `E11-backend-indisponivel.png` | Definir | Pendente |
| E12 | Consultar logs do Compose | Logs mostram inicialização sem erro não tratado | `E12-logs-containers.png` | Definir | Pendente |
| E13 | Consultar `GET /api/tasks/{id}/history` pelo Swagger ou Postman | JSON com o histórico de transições de status em ordem cronológica | `E13-backend-task-history.png` | Definir | Pendente |
| E14 | Abrir o histórico de status de uma tarefa pela interface (quadro ou tabela) | Modal exibe as transições de status em ordem cronológica, da mais recente para a mais antiga | `E14-historico-tarefa-frontend.png` | Definir | Pendente |
| E15 | Excluir projeto cujas tarefas estão todas concluídas | Botão liberado e confirmação avisando que as tarefas concluídas serão removidas, com os demais projetos ainda bloqueados | `E15-exclusao-permitida.jpg` | Camila Félix | Concluído |
| E16 | Confirmar a exclusão do projeto concluído | Resposta `204`, aviso de sucesso e projeto fora da listagem | `E16-exclusao-concluida.jpg` | Camila Félix | Concluído |
| E17 | Arrastar uma tarefa entre colunas do quadro | Card acompanha o cursor, coluna de destino destacada e status gravado pela API | `E17-arrastar-tarefa.jpg` | Camila Félix | Concluído |

## Verificações técnicas iniciais

Verificação executada em 20 de julho de 2026 na branch `feature/project-foundation`.

| Comando | Resultado inicial | Execução final da equipe |
|---|---|---|
| `dotnet build --configuration Release` | Aprovado, sem erros e sem avisos | Confirmar e registrar |
| `npm run build` | Aprovado com Vite 8.1.5 | Confirmar e registrar |
| `npm audit --audit-level=moderate` | Aprovado, nenhuma vulnerabilidade encontrada | Confirmar e registrar |
| `docker compose config` | Aprovado | Confirmar e registrar |
| `docker compose up --build -d` | Aprovado, dois serviços saudáveis | Executar e registrar |

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

Esses resultados comprovam a preparação técnica inicial. A equipe ainda deve repetir a execução, produzir as capturas restantes e preencher os responsáveis antes da apresentação.

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

Essa reverificação confirma que as rotas, os endpoints e os testes automatizados continuam funcionando após as últimas contribuições da equipe. As capturas visuais e o roteiro manual completo continuam sendo responsabilidade da execução final da equipe descrita acima.

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

## Teste de uma chamada HTTP

Depois de iniciar o ambiente, execute:

```bash
curl --fail --silent http://localhost:5200/health
curl --fail --silent http://localhost:5200/api/dashboard
curl --fail --silent http://localhost:5200/api/projects
```

Cole abaixo somente um resumo do resultado, sem dados sensíveis:

```text
Verificação inicial aprovada. Repetir e anexar a evidência produzida pela equipe.
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
| `npm audit` no frontend | 2 vulnerabilidades moderadas relatadas para `react-router` (GHSA-wrjc-x8rr-h8h6 e GHSA-337j-9hxr-rhxg) | Todas as versões 6.x do `react-router` são afetadas; a correção exige migrar para a versão 7, que não é compatível sem revisar as rotas | Não aplicada nesta entrega; registrada como melhoria opcional em `docs/evidencias/relatorio-desenvolvimento-equipe01.tex` | `npm audit` |
