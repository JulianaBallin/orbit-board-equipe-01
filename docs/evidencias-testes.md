# Evidências e testes de integração

Este documento organiza as validações exigidas no trabalho final. Capturas, resultados e responsáveis devem ser preenchidos pelos integrantes que executarem cada cenário.

## Convenção dos arquivos

Salve as capturas em `docs/evidencias/` com o padrão:

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
| E10 | Excluir projeto com tarefa | Resposta `409` sem remover o projeto | `E10-bloqueio-exclusao.png` | Definir | Pendente |
| E11 | Parar o backend e usar a interface | Frontend mostra erro de conexão | `E11-backend-indisponivel.png` | Definir | Pendente |
| E12 | Consultar logs do Compose | Logs mostram inicialização sem erro não tratado | `E12-logs-containers.png` | Definir | Pendente |

## Verificações técnicas iniciais

Verificação executada em 20 de julho de 2026, no commit `8249f2b`.

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

Esses resultados comprovam a preparação técnica inicial. A equipe ainda deve repetir a execução, produzir as capturas e preencher os responsáveis antes da apresentação.

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
