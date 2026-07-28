<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Registro de ajustes técnicos

Este registro relaciona o estado inicial, as alterações da equipe e as evidências que deverão ser apresentadas.

| Item | Situação inicial | Ajuste realizado | Como validar |
|---|---|---|---|
| Execução do backend | Apenas execução local documentada | Dockerfile em múltiplos estágios com health check | `docker compose ps` e `/health` |
| Execução do frontend | Apenas execução local com Vite | Build Node e publicação estática com Nginx | Abrir a porta `5173` e consultar `/health` |
| Integração dos serviços | Sem arquivo Compose | Compose com build, portas, dependência e verificações de saúde | `docker compose up --build` |
| CORS | Origem do frontend fixa no código | Lista de origens carregada da configuração | Alterar `CORS_ALLOWED_ORIGIN` e testar |
| Configuração local | Variável apenas no frontend | `.env.example` centraliza portas, URL pública da API e origem permitida | `docker compose config` |
| Dependências do frontend | Vite 5 com alertas no `npm audit` | Vite 8 e plugin React compatível com Node 20.19 | `npm audit` e `npm run build` |
| Navegação do frontend | React Router 6 com avisos moderados de segurança | React Router 7.18.1 validado nos fluxos e testes da SPA | `npm test`, `npm run build` e `npm audit` |
| Validação automatizada | `make validate` compilava o projeto, mas não executava testes | Alvos de teste do backend e frontend incluídos no Makefile e na validação completa | `make test` e `make validate` |
| Tema da interface | Apenas tema claro, sem preferência persistida | Temas claro e escuro, alternância pela interface e persistência no `localStorage` por meio do `themeService` | Alternar o tema, recarregar a página e conferir a E23 |
| Testes do tema | Serviço sem cobertura automatizada específica | Sete testes do `themeService` e ajustes no `MemoryRouter` e no fluxo de drag and drop para eliminar warnings | `npm test` e evidência E24 |
| Cobertura do frontend | Execução sem relatório de cobertura e sem limites mínimos | Cobertura V8 com relatórios em texto, HTML e JSON, limites globais mínimos de 80% e execução de `npm run test:coverage` na CI | `npm run test:coverage` e evidência E25 |
| Ampliação dos testes do frontend | Cobertura concentrada em cenários pontuais | Testes ampliados para o cliente da API e para o `TasksPage`, incluindo respostas JSON/texto/204, erros, filtros, navegação, alteração de status, exclusão e estados de carregamento | `npm run test:coverage` e evidência E26 |
| Documentação | READMEs separados da base | Arquitetura, contrato, testes, evidências e contribuições organizados em `docs/` | Revisar os links no README principal |

## Pendências antes da apresentação

- Registrar problemas encontrados em computadores diferentes.
- Confirmar a divisão da apresentação e ensaiar o roteiro de 7 minutos.
- Integrar a branch final em `develop` e promover a versão validada para `main`.
