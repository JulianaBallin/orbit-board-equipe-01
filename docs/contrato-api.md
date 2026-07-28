<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

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
| `DELETE` | `/api/projects/{id}` | `204` | Exclui um projeto sem tarefas pendentes |
| `GET` | `/api/tasks` | `200` | Lista tarefas e aceita filtros |
| `GET` | `/api/tasks/{id}` | `200` | Consulta uma tarefa |
| `POST` | `/api/tasks` | `201` | Cria uma tarefa |
| `PUT` | `/api/tasks/{id}` | `200` | Atualiza uma tarefa |
| `PATCH` | `/api/tasks/{id}/status` | `200` | Altera o status de uma tarefa |
| `PATCH` | `/api/tasks/{id}/position` | `200` | Move a tarefa de coluna e de posição |
| `DELETE` | `/api/tasks/{id}` | `204` | Exclui uma tarefa |
| `GET` | `/api/tasks/{id}/history` | `200` | Lista o histórico de mudanças de status de uma tarefa |
| `GET` | `/api/team-members` | `200` | Lista integrantes disponíveis na aplicação |
| `POST` | `/api/team-members` | `201` | Cadastra um integrante na equipe |
| `PUT` | `/api/team-members/{id}` | `200` | Atualiza os dados de um integrante |
| `DELETE` | `/api/team-members/{id}` | `204` | Exclui um integrante sem vínculos |

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

## Cadastrar integrante

`POST /api/team-members`

```json
{
  "name": "Renata Vasconcelos",
  "role": "Backend Developer",
  "email": "renata.vasconcelos@example.com"
}
```

Regras principais:

- `name` tem de 3 a 80 caracteres.
- `role` tem de 3 a 60 caracteres.
- `email` precisa ter formato válido, no máximo 120 caracteres, e não pode repetir o de outro integrante. A comparação ignora maiúsculas e minúsculas.
- As iniciais são geradas automaticamente a partir do nome, usando a primeira letra do primeiro e do último nome. Nome com uma palavra só gera uma inicial.
- Responde `409` quando o email já pertence a outro integrante.
- Responde `400` quando algum campo está fora das regras.

O integrante cadastrado já pode ser escolhido como responsável de projeto e de tarefa.

## Atualizar integrante

`PUT /api/team-members/{id}`

Aceita o mesmo corpo do cadastro. Valem as mesmas regras de tamanho e de formato de email.

Regras principais:

- O email continua sendo único entre os integrantes, mas manter o próprio email é permitido.
- As iniciais são recalculadas a partir do nome enviado.
- Responde `409` quando o email já pertence a outro integrante.
- Responde `404` quando o integrante informado não existe.

## Excluir integrante

`DELETE /api/team-members/{id}`

A exclusão é bloqueada enquanto o integrante estiver vinculado a algum trabalho.

Regras principais:

- Responde `204` quando o integrante não é responsável por nenhum projeto e não está atribuído a nenhuma tarefa.
- Responde `409` quando existe ao menos um vínculo, e o `detail` informa quantos projetos e quantas tarefas.
- Responde `404` quando o integrante informado não existe.

O bloqueio evita registro órfão: o nome do responsável é resolvido a partir da lista de integrantes ao montar a resposta de projeto, então remover alguém ainda vinculado quebraria a listagem inteira.

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

## Mover a tarefa de posição

`PATCH /api/tasks/{id}/position`

```json
{
  "status": "Review",
  "position": 0
}
```

A ordem do quadro é definida primeiro pela prioridade e depois pela posição manual. Ou seja, a posição só reordena a tarefa entre as outras que têm a mesma prioridade na mesma coluna.

Regras principais:

- `position` é o índice, começando em zero, dentro do grupo formado pelo status informado e pela prioridade atual da tarefa.
- Valores acima do tamanho do grupo colocam a tarefa no fim dele, sem erro.
- `position` negativa responde `400`.
- Quando o `status` informado é diferente do atual, a tarefa muda de coluna e o histórico de status registra a transição, igual ao endpoint de status.
- As posições do grupo de origem e do grupo de destino são renumeradas em sequência, sem deixar buracos.
- Responde `404` quando a tarefa informada não existe.

A resposta é a tarefa atualizada, no mesmo formato de `GET /api/tasks/{id}`, incluindo o campo `position`.

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

## Excluir projeto

`DELETE /api/projects/{id}`

A exclusão é bloqueada enquanto o projeto tiver tarefas que não estejam concluídas.

Regras principais:

- Responde `204` quando o projeto não tem tarefas ou quando todas estão em `Done`.
- Responde `409` quando existe ao menos uma tarefa em `Backlog`, `InProgress` ou `Review`, e o `detail` informa quantas estão pendentes.
- Responde `404` quando o projeto informado não existe.
- Ao excluir um projeto cujas tarefas estão todas concluídas, essas tarefas e o histórico de status delas são removidos junto, para não restar registro órfão.

Exemplo de resposta bloqueada:

```json
{
  "type": "about:blank",
  "title": "Conflito de regra",
  "status": 409,
  "detail": "O projeto possui 2 tarefa(s) não concluída(s) e não pode ser excluído.",
  "instance": "/api/projects/IDENTIFICADOR_DO_PROJETO",
  "traceId": "IDENTIFICADOR_DA_REQUISICAO"
}
```

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
| `409` | Nome de projeto duplicado ou tentativa de excluir projeto com tarefas não concluídas |
| `500` | Falha interna não tratada |
