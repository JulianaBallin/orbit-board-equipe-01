# Roteiro da apresentação técnica

Tempo alvo: 10 minutos.

## Divisão sugerida

| Tempo | Tema | Conteúdo | Responsável |
|---|---|---|---|
| 0:00 a 1:00 | Abertura | Nome, objetivo didático e integrantes | Definir |
| 1:00 a 2:30 | Arquitetura | Frontend, API, dados em memória e Docker | Definir |
| 2:30 a 4:30 | Demonstração | Dashboard, projeto, tarefa, filtro e mudança de status | Definir |
| 4:30 a 5:45 | API | Swagger, JSON, endpoint de saúde e erros | Definir |
| 5:45 a 7:00 | Infraestrutura | Dockerfiles, Compose, portas, variáveis, rede e logs | Definir |
| 7:00 a 8:30 | Testes | Cenários positivos, erro `409` e indisponibilidade do backend | Definir |
| 8:30 a 9:30 | Ajustes | Melhorias realizadas e justificativas | Definir |
| 9:30 a 10:00 | Encerramento | Contribuições, limitações e próximos passos | Definir |

## Sequência da demonstração

1. Mostrar `docker compose ps` com os serviços saudáveis.
2. Abrir o dashboard e explicar que os dados iniciais vêm da API.
3. Criar um projeto e mostrar a chamada HTTP no DevTools.
4. Criar uma tarefa associada ao projeto.
5. Filtrar e alterar o status da tarefa.
6. Abrir o Swagger e executar uma consulta.
7. Demonstrar um conflito ao repetir o nome do projeto.
8. Mostrar logs curtos dos containers.

## Pontos que todos devem saber explicar

- Por que o frontend e o backend usam portas diferentes.
- Como `VITE_API_URL` conecta o navegador à API.
- Por que CORS é necessário nesse cenário.
- Como JSON representa as requisições e respostas.
- O papel dos controllers, DTOs, serviço e middleware.
- O que cada estágio dos Dockerfiles faz.
- Por que os dados desaparecem ao reiniciar a API.

## Plano de contingência

- Manter as capturas em `docs/evidencias/` para demonstrar a execução anterior.
- Deixar as imagens Docker prontas antes da apresentação.
- Fechar serviços que ocupem as portas `5173` e `5200`.
- Verificar `docker compose ps` e `/health` antes de compartilhar a tela.
- Preparar um terminal com os comandos principais no histórico.

## Checklist do ensaio

- [ ] Todos os integrantes possuem uma parte de fala.
- [ ] O tempo total ficou entre 8 e 12 minutos.
- [ ] Nenhum segredo aparece na tela.
- [ ] A criação de projeto e tarefa foi testada.
- [ ] O cenário de erro foi testado.
- [ ] Swagger, logs e health check estão acessíveis.
- [ ] As contribuições reais foram atualizadas no README.
