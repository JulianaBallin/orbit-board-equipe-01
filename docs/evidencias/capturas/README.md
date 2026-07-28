<p align="center">
  <img src="../../assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Catálogo de capturas

Adicione nesta pasta as evidências visuais da execução final. O relatório LaTeX procura automaticamente os arquivos abaixo. Quando uma imagem ainda não existe, o PDF mostra um espaço reservado com seu nome.

| Arquivo | Conteúdo esperado |
|---|---|
| `E01-containers-saudaveis.png` | Saída de `docker compose ps` com backend e frontend saudáveis |
| `E02-dashboard.png` | Dashboard carregado com métricas e tarefas recentes |
| `E03-swagger.png` | Swagger com os grupos de endpoints visíveis |
| `E04-health.png` | Resposta JSON do endpoint `/health` |
| `E05-criar-projeto.png` | Projeto criado pela interface e exibido na listagem |
| `E06-projeto-duplicado.png` | Mensagem de conflito ao repetir o nome de um projeto |
| `E07-criar-tarefa.png` | Tarefa criada e exibida no quadro |
| `E08-filtrar-tarefas.png` | Filtros aplicados ao quadro de tarefas |
| `E09-alterar-status.png` | Tarefa após alteração de status |
| `E10-bloqueio-exclusao.png` | Bloqueio ao excluir projeto que possui tarefas não concluídas |
| `E11-backend-indisponivel.png` | Tratamento de erro do frontend sem acesso à API |
| `E12-logs-containers.png` | Logs de inicialização dos dois containers |
| `E13-backend-task-history.png` | Histórico de transição de status das tarefas |
| `E14-historico-tarefa-frontend.png` | Modal de histórico de status da tarefa exibido na interface (quadro/tabela) |
| `E15-exclusao-permitida.png` | Confirmação de exclusão liberada em projeto com todas as tarefas concluídas, com os demais projetos bloqueados |
| `E16-exclusao-concluida.png` | Listagem após a exclusão, sem o projeto e com o aviso de sucesso |
| `E17-arrastar-tarefa.png` | Card sendo arrastado entre colunas do quadro, com a coluna de destino destacada |
| `E18-ordem-por-prioridade.png` | Coluna agrupando as tarefas por prioridade, da mais alta para a mais baixa |
| `E19-ordem-manual-persistida.png` | Tarefas de mesma prioridade em ordem definida manualmente pelo arraste |

## Regras

- Use PNG ou substitua a extensão no arquivo LaTeX.
- Prefira imagens em resolução igual ou superior a 1366 por 768 pixels.
- Corte áreas sem relação com a evidência.
- Não mostre senhas, tokens, cookies, emails pessoais ou dados de autenticação.
- Mantenha o nome exatamente como indicado na tabela.
- Recompile o relatório com `make report` depois de adicionar ou substituir imagens.
