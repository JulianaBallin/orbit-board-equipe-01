# Contrato da API

## Informações gerais

| Item | Valor padrão |
|---|---|
| URL base | `http://localhost:5200` |
| Formato | JSON |
| Documentação interativa | `http://localhost:5200/swagger` |
| Verificação de saúde | `GET /health` |

As datas usam o formato `AAAA-MM-DD`. Identificadores usam UUID. Os enums são enviados e recebidos como texto.

## Valores aceitos

| Campo | Valores |
|---|---|
| Status do projeto | `Planning`, `Active`, `OnHold`, `Completed` |
| Status da tarefa | `Backlog`, `InProgress`, `Review`, `Done` |
| Prioridade da tarefa | `Low`, `Medium`, `High`, `Critical` |

## Endpoints

| Método | Endpoint | Sucesso | Descrição |
|---|---|---|---|
| `GET` | `/health` | `200` | Informa a saúde da API |
| `GET` | `/api/dashboard` | `200` | Retorna métricas e tarefas recentes |
| `GET` | `/api/projects` | `200` | Lista projetos |
| `GET` | `/api/projects/{id}` | `200` | Consulta um projeto |
| `POST` | `/api/projects` | `201` | Cria um projeto |
| `PUT` | `/api/projects/{id}` | `200` | Atualiza um projeto |
| `DELETE` | `/api/projects/{id}` | `204` | Exclui um projeto sem tarefas |
| `GET` | `/api/tasks` | `200` | Lista tarefas e aceita filtros |
| `GET` | `/api/tasks/{id}` | `200` | Consulta uma tarefa |
| `POST` | `/api/tasks` | `201` | Cria uma tarefa |
| `PUT` | `/api/tasks/{id}` | `200` | Atualiza uma tarefa |
| `PATCH` | `/api/tasks/{id}/status` | `200` | Altera o status de uma tarefa |
| `DELETE` | `/api/tasks/{id}` | `204` | Exclui uma tarefa |
| `GET` | `/api/tasks/{id}/history` | `200` | Lista o histórico de mudanças de status de uma tarefa |
| `GET` | `/api/team-members` | `200` | Lista integrantes disponíveis na aplicação |

## Filtros de tarefas

`GET /api/tasks` aceita os seguintes parâmetros de consulta:

| Parâmetro | Tipo | Exemplo |
|---|---|---|
| `projectId` | UUID | `?projectId=00000000-0000-0000-0000-000000000000` |
| `status` | enum | `?status=InProgress` |
| `priority` | enum | `?priority=High` |
| `assigneeId` | UUID | `?assigneeId=00000000-0000-0000-0000-000000000000` |
| `search` | texto | `?search=integração` |

Os filtros podem ser combinados na mesma requisição.

## Criar projeto

```http
POST /api/projects
Content-Type: application/json
```

```json
{
  "name": "Integração da equipe",
  "description": "Projeto usado para validar o fluxo completo da aplicação.",
  "status": "Active",
  "startDate": "2026-07-20",
  "dueDate": "2026-08-20",
  "ownerId": "UUID_DE_UM_INTEGRANTE"
}
```

Regras principais:

- `name` deve ter entre 3 e 80 caracteres e ser único.
- `description` deve ter entre 10 e 500 caracteres.
- `status` deve ser um dos valores aceitos para status de projeto.
- `ownerId` deve existir na lista de integrantes.
- `dueDate` não pode ser anterior a `startDate`.

## Criar tarefa

```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "projectId": "UUID_DE_UM_PROJETO",
  "title": "Registrar evidências do Compose",
  "description": "Capturar a execução dos containers e os respectivos logs.",
  "status": "Backlog",
  "priority": "High",
  "assigneeId": "UUID_DE_UM_INTEGRANTE",
  "dueDate": "2026-08-20",
  "estimatedHours": 4
}
```

Regras principais:

- `projectId` deve existir.
- `title` deve ter entre 3 e 120 caracteres.
- `description` deve ter entre 5 e 800 caracteres.
- `status` deve ser um dos valores aceitos para status de tarefa.
- `priority` deve ser um dos valores aceitos para prioridade.
- `assigneeId` é opcional, mas deve existir quando informado.
- `dueDate` é opcional, mas quando informado não pode ser anterior à `startDate` nem posterior à `dueDate` do projeto.
- `estimatedHours` deve estar entre 1 e 200.

As mesmas regras de `status`, `priority` e `dueDate` valem para `PUT /api/tasks/{id}`. `PATCH /api/tasks/{id}/status` valida apenas se o `status` informado é um valor aceito.

## Alterar somente o status

```http
PATCH /api/tasks/{id}/status
Content-Type: application/json
```

```json
{
  "status": "Done"
}
```

## Histórico de status da tarefa

```http
GET /api/tasks/{id}/history
```

Retorna a lista de mudanças de status da tarefa, em ordem cronológica (mais antiga primeiro):

```json
[
  {
    "id": "UUID_DO_EVENTO",
    "workItemId": "UUID_DA_TAREFA",
    "fromStatus": null,
    "toStatus": "Backlog",
    "changedAt": "2026-07-20T12:00:00Z"
  },
  {
    "id": "UUID_DO_EVENTO",
    "workItemId": "UUID_DA_TAREFA",
    "fromStatus": "Backlog",
    "toStatus": "InProgress",
    "changedAt": "2026-07-22T09:30:00Z"
  }
]
```

Regras principais:

- O primeiro evento tem `fromStatus` nulo e representa a criação da tarefa no status inicial.
- Um novo evento só é registrado quando o status muda de fato (chamadas que repetem o status atual não geram entrada).
- Retorna `404` quando a tarefa informada não existe.

## Formato de erro

Erros de negócio usam `application/problem+json` e seguem o formato abaixo:

```json
{
  "type": "about:blank",
  "title": "Conflito de regra",
  "status": 409,
  "detail": "Já existe um projeto com esse nome.",
  "instance": "/api/projects",
  "traceId": "IDENTIFICADOR_DA_REQUISICAO"
}
```

| Status | Situação comum |
|---|---|
| `400` | JSON inválido, campo fora das regras ou referência inexistente |
| `404` | Projeto ou tarefa não encontrado |
| `409` | Nome de projeto duplicado ou tentativa de excluir projeto com tarefas |
| `500` | Falha interna não tratada |
