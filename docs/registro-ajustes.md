# Registro de ajustes técnicos

Este registro relaciona o estado inicial, as alterações da equipe e as evidências que deverão ser apresentadas.

| Item | Situação inicial | Ajuste realizado | Como validar |
|---|---|---|---|
| Execução do backend | Apenas execução local documentada | Dockerfile em múltiplos estágios com health check | `docker compose ps` e `/health` |
| Execução do frontend | Apenas execução local com Vite | Build Node e publicação estática com Nginx | Abrir a porta `5173` e consultar `/health` |
| Integração dos serviços | Sem arquivo Compose | Compose com build, portas, dependência e verificações de saúde | `docker compose up --build` |
| CORS | Origem do frontend fixa no código | Lista de origens carregada da configuração | Alterar `CORS_ALLOWED_ORIGIN` e testar |
| Configuração local | Variável apenas no frontend | `.env.example` centraliza portas, URL pública da API e origem permitida | `docker compose config` |
| Documentação | READMEs separados da base | Arquitetura, contrato, testes, apresentação e contribuições organizados em `docs/` | Revisar os links no README principal |

## Ajustes ainda reservados para a equipe

- Executar todos os cenários manuais e anexar capturas reais.
- Registrar problemas encontrados em computadores diferentes.
- Aplicar ao menos uma melhoria técnica ou de usabilidade definida pelos integrantes.
- Confirmar a divisão da apresentação e ensaiar entre 8 e 12 minutos.
- Atualizar a contribuição real de cada pessoa com links para commits ou Pull Requests.
