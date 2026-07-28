<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Fluxo Git da equipe

## Branches permanentes e de trabalho

| Branch | Finalidade | Recebe commits diretos |
|---|---|---|
| `main` | Versão estável apresentada e entregue | Não |
| `develop` | Integração e validação das contribuições | Não |
| `feature/project-foundation` | Preparação inicial do trabalho final | Sim, enquanto o MR estiver aberto |

Durante a preparação inicial, o repositório terá somente essas três branches. Depois que `feature/project-foundation` for integrada, novas branches de trabalho devem nascer de `develop` e ser removidas após a integração.

## Primeiro MR

```text
feature/project-foundation
          |
          v
       develop
```

O primeiro MR reúne a infraestrutura Docker, a documentação, o logo, o README, a atualização do frontend, a pipeline e os resultados técnicos iniciais.

## Segundo MR

```text
develop
   |
   v
 main
```

O segundo MR deve ser aberto somente depois que o primeiro estiver integrado, a pipeline estiver aprovada e a equipe tiver revisado a versão em `develop`.

## Criar uma nova contribuição

```bash
git switch develop
git pull origin develop
git switch -c feature/nome-da-atividade
```

Depois de alterar e testar:

```bash
git add .
git commit -m "feat(scope): describe the change"
git push -u origin feature/nome-da-atividade
```

Abra o MR com origem na branch de trabalho e destino em `develop`.

## Regras

- Não fazer commits diretamente em `main`.
- Não fazer commits diretamente em `develop`.
- Usar mensagens convencionais em inglês.
- Manter commits pequenos e relacionados a uma única finalidade.
- Executar os testes descritos no MR antes de solicitar revisão.
- Solicitar revisão de outro integrante.
- Remover a branch de trabalho depois da integração.
- Atualizar a contribuição real no README e em `docs/contribuicoes.md`.
