<p align="center">
  <img src="docs/assets/orbitboard-logo.png" alt="OrbitBoard" width="620">
</p>

<p align="center">
  Plataforma full stack para organizar projetos, tarefas e responsabilidades de uma equipe.<br>
  <em>Projeto acadêmico | Capacitação em IA e Transformação Digital | Módulo 5</em>
</p>

---

<h2 align="center">Tecnologias utilizadas</h2>

<p align="center">
  <img alt=".NET" src="https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white">
  <img alt="ASP.NET Core" src="https://img.shields.io/badge/ASP.NET_Core-API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white">
  <img alt="Nginx" src="https://img.shields.io/badge/Nginx-1.27-009639?style=for-the-badge&logo=nginx&logoColor=white">
  <img alt="Swagger" src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
</p>

---

<h2 align="center">Descrição do projeto</h2>

O **OrbitBoard** é uma aplicação acadêmica de gestão de projetos e tarefas. A solução permite acompanhar indicadores em um dashboard, cadastrar projetos, organizar tarefas por status e prioridade, filtrar o trabalho e consultar os integrantes disponíveis.

O objetivo didático é demonstrar a integração real entre um frontend React e uma API ASP.NET Core, incluindo comunicação HTTP e JSON, validação, tratamento de erros, CORS, variáveis de ambiente, documentação OpenAPI e execução conteinerizada.

Os dados são mantidos em memória para concentrar a atividade na integração full stack. Eles são recriados quando o backend reinicia.

---

<h2 align="center">Funcionalidades</h2>

| Funcionalidade | Descrição |
|---|---|
| **Dashboard** | Exibe projetos, tarefas, itens concluídos, atrasos e atividades recentes |
| **Projetos** | Cadastra, consulta, edita e exclui projetos sem tarefas vinculadas |
| **Quadro de tarefas** | Organiza itens em Backlog, Em andamento, Revisão e Concluído |
| **Filtros** | Pesquisa por projeto, status, prioridade, responsável e texto |
| **Equipe** | Lista integrantes, funções e informações de contato fictícias da aplicação |
| **Validação** | Verifica campos, datas, referências e nomes duplicados |
| **Tratamento de erros** | Padroniza respostas com `ProblemDetails` e mostra mensagens na interface |
| **Swagger** | Permite explorar e executar os endpoints da API |
| **Health checks** | Informa a disponibilidade do frontend e do backend |
| **Docker Compose** | Compila e executa toda a solução com um único comando |

---

<h2 align="center">Arquitetura</h2>

```text
Usuário
  |
Navegador em http://localhost:5173
  |
  +-- Frontend React
  |     +-- Vite no desenvolvimento
  |     +-- Nginx no container
  |
  +-- HTTP e JSON
        |
        +-- API ASP.NET Core em http://localhost:5200
              +-- Controllers e DTOs
              +-- WorkspaceService
              +-- Dados em memória
              +-- Middleware de erros
              +-- Swagger e health check
```

O navegador consome diretamente a URL pública da API definida em `VITE_API_URL`. A API permite a origem do frontend por meio da configuração de CORS.

A explicação detalhada, o diagrama e as decisões técnicas estão em [docs/arquitetura.md](docs/arquitetura.md).

---

<h2 align="center">Como executar com Docker</h2>

### Requisitos

- Docker Engine 24 ou superior
- Docker Compose 2.20 ou superior

### Iniciar a aplicação

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

O frontend aguarda o health check do backend antes de iniciar.

### Acompanhar os logs

```bash
docker compose logs --follow
```

### Encerrar

```bash
docker compose down
```

---

<h2 align="center">Como executar localmente</h2>

### Requisitos

- .NET SDK 8
- Node.js 20.19 ou superior
- npm 10 ou superior

### Backend

```bash
cd backend
dotnet restore OrbitBoard.Api.sln
dotnet run --project OrbitBoard.Api
```

### Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

<h2 align="center">URLs de acesso</h2>

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:5200 |
| Swagger | http://localhost:5200/swagger |
| Health check do backend | http://localhost:5200/health |
| Health check do frontend | http://localhost:5173/health |

---

<h2 align="center">API REST</h2>

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica a saúde da API |
| `GET` | `/api/dashboard` | Retorna métricas e tarefas recentes |
| `GET` | `/api/projects` | Lista projetos |
| `GET` | `/api/projects/{id}` | Consulta um projeto |
| `POST` | `/api/projects` | Cria um projeto |
| `PUT` | `/api/projects/{id}` | Atualiza um projeto |
| `DELETE` | `/api/projects/{id}` | Exclui um projeto sem tarefas |
| `GET` | `/api/tasks` | Lista e filtra tarefas |
| `GET` | `/api/tasks/{id}` | Consulta uma tarefa |
| `POST` | `/api/tasks` | Cria uma tarefa |
| `PUT` | `/api/tasks/{id}` | Atualiza uma tarefa |
| `PATCH` | `/api/tasks/{id}/status` | Altera somente o status |
| `DELETE` | `/api/tasks/{id}` | Exclui uma tarefa |
| `GET` | `/api/team-members` | Lista integrantes disponíveis |

Os filtros e os exemplos de JSON estão documentados em [docs/contrato-api.md](docs/contrato-api.md).

---

<h2 align="center">Variáveis de ambiente</h2>

Copie `.env.example` para `.env` antes de usar o Compose.

| Variável | Padrão | Finalidade |
|---|---|---|
| `BACKEND_PORT` | `5200` | Porta da API no computador local |
| `FRONTEND_PORT` | `5173` | Porta da interface no computador local |
| `VITE_API_URL` | `http://localhost:5200` | URL pública da API usada pelo navegador |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Origem autorizada a consumir a API |

O `.env` local não deve ser enviado ao Git. Apenas `.env.example` faz parte do repositório.

---

<h2 align="center">Estrutura do projeto</h2>

```text
orbit-board-equipe-01/
├── backend/
│   ├── Dockerfile
│   ├── OrbitBoard.Api.sln
│   └── OrbitBoard.Api/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── docs/
│   ├── assets/
│   ├── evidencias/
│   ├── arquitetura.md
│   ├── contrato-api.md
│   ├── contribuicoes.md
│   ├── evidencias-testes.md
│   ├── registro-ajustes.md
│   └── roteiro-apresentacao.md
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

<h2 align="center">Testes e evidências</h2>

O roteiro inclui execução dos containers, dashboard, Swagger, health checks, criação e filtro de dados, alteração de status, conflitos, indisponibilidade da API e logs.

| Documento | Conteúdo |
|---|---|
| [Evidências e testes](docs/evidencias-testes.md) | Cenários, resultados esperados e nomes das capturas |
| [Registro de ajustes](docs/registro-ajustes.md) | Estado inicial, alterações e formas de validação |
| [Roteiro da apresentação](docs/roteiro-apresentacao.md) | Sequência sugerida para uma apresentação de 10 minutos |
| [Plano de contribuições](docs/contribuicoes.md) | Frentes sugeridas e espaço para commits e MRs reais |
| [Fluxo Git](docs/fluxo-git.md) | Regras das branches, commits e MRs |

As capturas finais serão produzidas e adicionadas pelos integrantes durante a validação conjunta.

---

<h2 align="center">Fluxo de contribuição</h2>

```bash
git switch develop
git pull origin develop
git switch -c feature/nome-da-atividade
```

Após a alteração:

```bash
git add .
git commit -m "feat(scope): describe the change"
git push -u origin feature/nome-da-atividade
```

Abra um MR da branch de trabalho para `develop` e peça a revisão de outro integrante. Depois de validar a versão integrada, abra outro MR de `develop` para `main`.

Não faça commits diretamente em `main` ou `develop`. O fluxo completo está em [docs/fluxo-git.md](docs/fluxo-git.md).

---

<h2 align="center">Limitações</h2>

- Os dados são apagados quando a API reinicia.
- A aplicação não possui autenticação ou autorização.
- O frontend recebe a URL da API no momento do build.
- A solução foi projetada para fins didáticos e execução em uma única instância.
- As evidências finais dependem da execução conjunta da equipe.

---

<h2 align="center">Equipe</h2>

| Integrante | GitHub | Frente inicial sugerida | Contribuição final |
|---|---|---|---|
| Allef Oliveira Ramos | [@allef-oliveira](https://github.com/allef-oliveira) | Testes da API e cenários de erro | A registrar após o MR |
| Camila Félix dos Reis | [@cawzkf](https://github.com/cawzkf) | Validação do frontend e usabilidade | A registrar após o MR |
| Fernanda de Oliveira da Costa | [@nanda-costa](https://github.com/nanda-costa) | Docker Compose, logs e infraestrutura | A registrar após o MR |
| Juliana Ballin Lima | [@JulianaBallin](https://github.com/JulianaBallin) | Organização do repositório e revisão do README | A registrar após o MR |
| Pedro Henrique Oliveria Dias | [@pedroddias-oss](https://github.com/pedroddias-oss) | Arquitetura e apresentação técnica | A registrar após o MR |

As contribuições devem refletir o histórico real de commits e MRs. A distribuição pode ser ajustada pela equipe antes da entrega.

---

<h3 align="center">OrbitBoard | Integração Full Stack | Módulo 5</h3>
