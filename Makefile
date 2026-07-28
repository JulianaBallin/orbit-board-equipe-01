SHELL := /bin/bash
.DEFAULT_GOAL := menu

PROJECT_NAME := OrbitBoard
COMPOSE := docker compose
BACKEND_SOLUTION := backend/OrbitBoard.Api.sln
FRONTEND_DIR := frontend
REPORT_DIR := docs/evidencias
REPORT_SOURCE := relatorio-desenvolvimento-equipe01.tex
REPORT_PDF := relatorio-desenvolvimento-equipe01.pdf

BLUE := \033[1;34m
CYAN := \033[1;36m
GREEN := \033[1;32m
YELLOW := \033[1;33m
RESET := \033[0m

.PHONY: menu help check-tools setup setup-env backend-restore backend-build backend-test \
	backend-run frontend-install frontend-build frontend-test frontend-run build test \
	up down restart status logs health compose-check audit validate report report-clean

menu:
	@clear
	@printf "$(BLUE)============================================================$(RESET)\n"
	@printf "$(BLUE)                 $(PROJECT_NAME) | Menu de comandos$(RESET)\n"
	@printf "$(BLUE)============================================================$(RESET)\n"
	@printf "$(CYAN)  1$(RESET)  Preparar o ambiente\n"
	@printf "$(CYAN)  2$(RESET)  Compilar backend e frontend\n"
	@printf "$(CYAN)  3$(RESET)  Iniciar a aplicacao com Docker\n"
	@printf "$(CYAN)  4$(RESET)  Encerrar a aplicacao com Docker\n"
	@printf "$(CYAN)  5$(RESET)  Reiniciar a aplicacao com Docker\n"
	@printf "$(CYAN)  6$(RESET)  Exibir o status dos containers\n"
	@printf "$(CYAN)  7$(RESET)  Acompanhar os logs\n"
	@printf "$(CYAN)  8$(RESET)  Verificar os health checks\n"
	@printf "$(CYAN)  9$(RESET)  Executar a validacao completa\n"
	@printf "$(CYAN) 10$(RESET)  Compilar o relatorio em PDF\n"
	@printf "$(CYAN) 11$(RESET)  Executar somente o backend local\n"
	@printf "$(CYAN) 12$(RESET)  Executar somente o frontend local\n"
	@printf "$(CYAN)  0$(RESET)  Sair\n"
	@printf "$(BLUE)============================================================$(RESET)\n"
	@read -r -p "Escolha uma opcao: " OPTION; \
	case "$$OPTION" in \
		1) $(MAKE) setup ;; \
		2) $(MAKE) build ;; \
		3) $(MAKE) up ;; \
		4) $(MAKE) down ;; \
		5) $(MAKE) restart ;; \
		6) $(MAKE) status ;; \
		7) $(MAKE) logs ;; \
		8) $(MAKE) health ;; \
		9) $(MAKE) validate ;; \
		10) $(MAKE) report ;; \
		11) $(MAKE) backend-run ;; \
		12) $(MAKE) frontend-run ;; \
		0) printf "Encerrado.\n" ;; \
		*) printf "$(YELLOW)Opcao invalida.$(RESET)\n"; exit 1 ;; \
	esac

help:
	@printf "$(BLUE)Comandos disponiveis$(RESET)\n"
	@printf "  make menu              Abre o menu interativo\n"
	@printf "  make setup             Prepara arquivos e dependencias\n"
	@printf "  make build             Compila backend e frontend\n"
	@printf "  make test              Executa os testes do backend e do frontend\n"
	@printf "  make up                Compila e inicia os containers\n"
	@printf "  make down              Encerra os containers\n"
	@printf "  make restart           Reinicia os containers\n"
	@printf "  make status            Exibe o estado dos containers\n"
	@printf "  make logs              Acompanha os logs\n"
	@printf "  make health            Consulta os health checks\n"
	@printf "  make validate          Executa todas as validacoes\n"
	@printf "  make report            Compila o relatorio em PDF\n"
	@printf "  make report-clean      Remove auxiliares do LaTeX\n"
	@printf "  make backend-run       Executa a API localmente\n"
	@printf "  make frontend-run      Executa o frontend localmente\n"

check-tools:
	@printf "$(BLUE)Verificando ferramentas...$(RESET)\n"
	@command -v dotnet >/dev/null || { printf "dotnet nao encontrado.\n"; exit 1; }
	@command -v node >/dev/null || { printf "node nao encontrado.\n"; exit 1; }
	@command -v npm >/dev/null || { printf "npm nao encontrado.\n"; exit 1; }
	@command -v docker >/dev/null || { printf "docker nao encontrado.\n"; exit 1; }
	@command -v curl >/dev/null || { printf "curl nao encontrado.\n"; exit 1; }
	@printf "$(GREEN)Ferramentas encontradas.$(RESET)\n"

setup-env:
	@if [ ! -f .env ]; then cp .env.example .env; printf "Arquivo .env criado.\n"; else printf "Arquivo .env existente mantido.\n"; fi

setup: check-tools setup-env backend-restore frontend-install
	@printf "$(GREEN)Ambiente preparado.$(RESET)\n"

backend-restore:
	@printf "$(BLUE)Restaurando dependencias do backend...$(RESET)\n"
	@dotnet restore $(BACKEND_SOLUTION)

backend-build: backend-restore
	@printf "$(BLUE)Compilando o backend...$(RESET)\n"
	@dotnet build $(BACKEND_SOLUTION) --configuration Release --no-restore

backend-test: backend-build
	@printf "$(BLUE)Executando os testes do backend...$(RESET)\n"
	@dotnet test $(BACKEND_SOLUTION) --configuration Release --no-build

backend-run:
	@printf "$(BLUE)Iniciando o backend em http://localhost:5200...$(RESET)\n"
	@dotnet run --project backend/OrbitBoard.Api

frontend-install:
	@printf "$(BLUE)Instalando dependencias do frontend...$(RESET)\n"
	@npm ci --prefix $(FRONTEND_DIR)

frontend-build: frontend-install
	@printf "$(BLUE)Compilando o frontend...$(RESET)\n"
	@npm run build --prefix $(FRONTEND_DIR)

frontend-test: frontend-install
	@printf "$(BLUE)Executando os testes do frontend...$(RESET)\n"
	@npm test --prefix $(FRONTEND_DIR)

frontend-run:
	@printf "$(BLUE)Iniciando o frontend em http://localhost:5173...$(RESET)\n"
	@npm run dev --prefix $(FRONTEND_DIR)

build: backend-build frontend-build
	@printf "$(GREEN)Backend e frontend compilados.$(RESET)\n"

test: backend-test frontend-test
	@printf "$(GREEN)Testes do backend e frontend aprovados.$(RESET)\n"

up: setup-env
	@printf "$(BLUE)Compilando e iniciando os containers...$(RESET)\n"
	@$(COMPOSE) up --build --detach
	@$(MAKE) status

down:
	@printf "$(BLUE)Encerrando os containers...$(RESET)\n"
	@$(COMPOSE) down

restart: down up

status:
	@printf "$(BLUE)Status dos containers$(RESET)\n"
	@$(COMPOSE) ps

logs:
	@printf "$(BLUE)Logs dos containers. Use Ctrl+C para sair.$(RESET)\n"
	@$(COMPOSE) logs --follow

health:
	@printf "$(BLUE)Health check do backend$(RESET)\n"
	@curl --fail --silent --show-error http://localhost:5200/health
	@printf "\n$(BLUE)Health check do frontend$(RESET)\n"
	@curl --fail --silent --show-error http://localhost:5173/health
	@printf "\n$(GREEN)Servicos saudaveis.$(RESET)\n"

compose-check:
	@printf "$(BLUE)Validando o Docker Compose...$(RESET)\n"
	@$(COMPOSE) config >/dev/null
	@printf "$(GREEN)Docker Compose valido.$(RESET)\n"

audit:
	@printf "$(BLUE)Auditando dependencias do frontend...$(RESET)\n"
	@npm audit --prefix $(FRONTEND_DIR) --audit-level=moderate || { \
		npm audit --prefix $(FRONTEND_DIR) --json | node -e 'const fs = require("fs"); const report = JSON.parse(fs.readFileSync(0, "utf8")); const advisories = Object.values(report.vulnerabilities ?? {}).flatMap((entry) => entry.via).filter((entry) => typeof entry === "object").map((entry) => entry.url); const known = "https://github.com/advisories/GHSA-qwww-vcr4-c8h2"; if (advisories.length === 0 || advisories.some((url) => url !== known)) process.exit(1); console.log("Aviso RSC conhecido e sem caminho de execucao nesta SPA.");'; \
	}

validate: check-tools backend-test frontend-test frontend-build audit compose-check
	@printf "$(GREEN)Validacao completa aprovada.$(RESET)\n"

report:
	@command -v pdflatex >/dev/null || { printf "pdflatex nao encontrado.\n"; exit 1; }
	@printf "$(BLUE)Compilando o relatorio...$(RESET)\n"
	@cd $(REPORT_DIR) && pdflatex -interaction=nonstopmode -halt-on-error $(REPORT_SOURCE) >/dev/null
	@cd $(REPORT_DIR) && pdflatex -interaction=nonstopmode -halt-on-error $(REPORT_SOURCE) >/dev/null
	@printf "$(GREEN)Relatorio criado em $(REPORT_DIR)/$(REPORT_PDF).$(RESET)\n"

report-clean:
	@$(RM) $(REPORT_DIR)/relatorio-desenvolvimento-equipe01.aux
	@$(RM) $(REPORT_DIR)/relatorio-desenvolvimento-equipe01.log
	@$(RM) $(REPORT_DIR)/relatorio-desenvolvimento-equipe01.out
	@$(RM) $(REPORT_DIR)/relatorio-desenvolvimento-equipe01.toc
	@printf "Arquivos auxiliares removidos.\n"
