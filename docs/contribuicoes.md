<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Plano e registro de contribuições

A tabela abaixo reflete o histórico real de commits e MRs integrados em `develop`, levantado a partir de `git log` e dos merges de cada pull request.

| Integrante | GitHub | Contribuição real | Evidência |
|---|---|---|---|
| Juliana Ballin Lima | [@JulianaBallin](https://github.com/JulianaBallin) | Fundação do projeto: ambiente containerizado (Dockerfiles e Compose), pipeline de CI, menu de automação do Makefile, README inicial, documentação de arquitetura e contrato de API, e fonte e PDF iniciais do relatório de desenvolvimento. Também revisou e integrou os MRs #1 a #11 como mantenedora do repositório. | MRs [#1](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/1) e [#2](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/2) |
| Allef Oliveira Ramos | [@allef-oliveira](https://github.com/allef-oliveira) | Identidade visual (favicon e logo no layout), separação das rotas de cadastro e edição de projetos e tarefas em páginas próprias, visualização de tarefas em tabela com menu de ações responsivo, migração do README para MDX, implementação dos temas claro e escuro com persistência, testes do `themeService`, correções de warnings e histórico de tarefa expansível. | MRs [#3](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/3), [#4](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/4), [#5](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/5), [#20](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/20) e [#29](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/29) |
| Camila Félix dos Reis | [@cawzkf](https://github.com/cawzkf) | Suíte de testes xUnit do `WorkspaceService`, testes de integração da API com `WebApplicationFactory` e execução do `dotnet test` na pipeline. Regra de exclusão de projeto liberada apenas com todas as tarefas concluídas, com remoção em cascata. Ordenação manual do quadro, com campo de posição, endpoint de reposicionamento e agrupamento por prioridade. Arraste de tarefas por eventos de ponteiro, com card flutuante e indicador do ponto de queda. Modal de confirmação próprio no lugar do `window.confirm`. Cadastro, edição e exclusão de colaboradores, com bloqueio por vínculo e equipe real no seed. Evidências E15 a E22 e E27 a E30. | MRs [#6](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/6), [#7](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/7), [#14](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/14), [#16](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/16), [#17](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/17), [#18](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/18), [#19](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/19), [#21](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/21), [#22](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/22), [#23](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/23), [#24](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/24), [#25](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/25), [#28](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/28) e [#30](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/30) |
| Fernanda de Oliveira da Costa | [@nanda-costa](https://github.com/nanda-costa) | Endpoint `GET /api/tasks/{id}/history` de histórico de status, testes de cobertura do comportamento do histórico, documentação do contrato da API, organização inicial das evidências de captura, e validação de enums e do prazo da tarefa contra o intervalo do projeto. | MRs [#8](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/8), [#9](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/9) e [#11](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/11) |
| Pedro Henrique Oliveira Dias | [@pedroddias-oss](https://github.com/pedroddias-oss) | Modal de histórico de status no frontend, integração na tabela e na página de tarefas, configuração do Vitest e Testing Library, testes automatizados unitários e de integração do frontend, correção de dependências (`jsdom`), pipeline de testes do frontend, evidência E14, revisão dos READMEs e preservação de cargos personalizados no formulário de colaboradores. | MRs [#10](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/10), [#31](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/31), [#32](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/32) e [#33](https://github.com/JulianaBallin/orbit-board-equipe-01/pull/33) |

## Como contribuir

1. Atualize a branch `develop` local.
2. Crie a partir dela uma branch como `feature/nome-da-atividade`, `fix/nome-da-correcao` ou `docs/nome-do-documento`.
3. Faça uma alteração pequena e validável.
4. Use uma mensagem convencional em inglês.
5. Envie a branch e abra um MR para `develop`.
6. Peça revisão a outro integrante.
7. Após integrar e validar as features, abra um MR de `develop` para `main`.
8. Registre os links na tabela acima.

## Exemplos de commits

```text
feat(tasks): improve status feedback
fix(api): validate task due date
docs(testing): add integration screenshots
test(api): cover project conflicts
```

Não faça commits diretamente em `main` ou `develop`. Não registre uma contribuição em nome de outra pessoa. O histórico final precisa refletir o trabalho realmente executado por cada integrante.
