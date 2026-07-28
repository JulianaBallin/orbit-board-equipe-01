<p align="center">
  <img src="../docs/assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# OrbitBoard | Backend

API REST em **.NET 8 / ASP.NET Core** para uma aplicação de acompanhamento de projetos, tarefas e equipe.

## Funcionalidades

- Dashboard com métricas e tarefas recentes.
- Cadastro, consulta, edição e exclusão de projetos.
- Cadastro, consulta, edição e exclusão de tarefas.
- Alteração rápida do status de uma tarefa.
- Histórico de mudanças de status de uma tarefa, em ordem cronológica.
- Filtros por projeto, status, prioridade, responsável e texto.
- Listagem dos integrantes da equipe.
- Validação de entrada por Data Annotations.
- Respostas de erro padronizadas com `ProblemDetails`.
- Swagger/OpenAPI.
- CORS configurado para o front-end local.
- Dados em memória, já carregados com exemplos didáticos.

## Requisitos

- .NET SDK 8.

Verifique:

```bash
dotnet --version
```

## Como executar

A partir da pasta `backend`:

```bash
dotnet restore OrbitBoard.Api.sln
dotnet run --project OrbitBoard.Api
```

A API ficará disponível em:

- API: `http://localhost:5200`
- Swagger: `http://localhost:5200/swagger`
- Health check: `http://localhost:5200/health`

## Como executar com Docker

A partir da raiz do repositório:

```bash
docker compose up --build backend
```

O container escuta na porta interna `8080`, publicada por padrão como `5200`.

## Configuração

As origens permitidas pelo CORS ficam em `Cors:AllowedOrigins`. No Docker Compose, a primeira origem é configurada pela variável `CORS_ALLOWED_ORIGIN`.

## Endpoints principais

### Dashboard

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/dashboard` | Retorna métricas e tarefas recentes. |

### Projetos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/projects` | Lista projetos. |
| GET | `/api/projects/{id}` | Consulta um projeto. |
| POST | `/api/projects` | Cria um projeto. |
| PUT | `/api/projects/{id}` | Atualiza um projeto. |
| DELETE | `/api/projects/{id}` | Exclui um projeto sem tarefas. |

### Tarefas

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/tasks` | Lista e filtra tarefas. |
| GET | `/api/tasks/{id}` | Consulta uma tarefa. |
| POST | `/api/tasks` | Cria uma tarefa. |
| PUT | `/api/tasks/{id}` | Atualiza uma tarefa. |
| PATCH | `/api/tasks/{id}/status` | Altera somente o status. |
| DELETE | `/api/tasks/{id}` | Exclui uma tarefa. |
| GET | `/api/tasks/{id}/history` | Lista o histórico de mudanças de status da tarefa. |

Filtros aceitos em `GET /api/tasks`:

```text
projectId
status
priority
assigneeId
search
```

### Equipe

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/team-members` | Lista os integrantes. |

## Exemplo de criação de tarefa

```json
{
  "projectId": "GUID_DO_PROJETO",
  "title": "Revisar experiência de cadastro",
  "description": "Validar mensagens, navegação e estados de erro.",
  "status": "Backlog",
  "priority": "High",
  "assigneeId": "GUID_DO_INTEGRANTE",
  "dueDate": "2026-08-20",
  "estimatedHours": 8
}
```

## Organização

```text
OrbitBoard.Api/
├── Controllers/   Endpoints HTTP
├── DTOs/          Contratos de entrada e saída
├── Exceptions/    Exceções de negócio
├── Middleware/    Tratamento global de erros
├── Models/        Entidades e enums
├── Services/      Regras e armazenamento em memória
└── Program.cs     Configuração da aplicação
```

## Observações

Os dados são mantidos somente em memória. Eles são recriados sempre que a API é reiniciada. Essa escolha permite concentrar a atividade didática na integração HTTP/JSON sem exigir a configuração prévia de um banco de dados.
