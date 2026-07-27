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
| `E10-bloqueio-exclusao.png` | Bloqueio ao excluir projeto que possui tarefas | ||TODO precisa implementar no back e front
| `E11-backend-indisponivel.png` | Tratamento de erro do frontend sem acesso à API |
| `E12-logs-containers.png` | Logs de inicialização dos dois containers |
| `E13-backend-task-history.png` | Histórico de transição de status das tarefas |

## Regras

- Use PNG ou substitua a extensão no arquivo LaTeX.
- Prefira imagens em resolução igual ou superior a 1366 por 768 pixels.
- Corte áreas sem relação com a evidência.
- Não mostre senhas, tokens, cookies, emails pessoais ou dados de autenticação.
- Mantenha o nome exatamente como indicado na tabela.
- Recompile o relatório com `make report` depois de adicionar ou substituir imagens.
