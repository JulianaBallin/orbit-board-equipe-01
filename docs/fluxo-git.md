<p align="center">
  <img src="assets/orbitboard-logo.png" alt="OrbitBoard" width="220" />
</p>

# Fluxo Git da equipe

## Branches permanentes e de trabalho

| Branch | Finalidade | Recebe commits diretos |
|---|---|---|
| `main` | Versão estável apresentada e entregue | Não |
| `develop` | Integração e validação das contribuições | Não |
| `feature/*` | Nova funcionalidade criada a partir de `develop` | Sim |
| `fix/*` | Correção criada a partir de `develop` | Sim |
| `docs/*` | Atualização documental criada a partir de `develop` | Sim |
| `chore/*` | Manutenção e auditoria criadas a partir de `develop` | Sim |

As branches de trabalho devem ser removidas depois da integração. Toda nova atividade parte da versão atualizada de `develop`.

## Fluxo de integração

```text
branch de trabalho
        |
        v
     develop
        |
        v
      main
```

O primeiro MR de cada atividade tem como destino `develop`. A promoção para `main` acontece somente depois da revisão, da pipeline aprovada e da validação conjunta da versão integrada.

## Situação verificada em 28 de julho de 2026

O histórico mostra que o PR 12 foi integrado em `main` e revertido no commit seguinte. O mesmo conteúdo entrou corretamente em `develop` pelo PR 13, e as funcionalidades posteriores também foram integradas nessa branch. Por isso, `develop` é a fonte atual da entrega, enquanto `main` precisa receber uma nova promoção depois da auditoria final.

## Criar uma nova contribuição

```bash
git switch develop
git pull origin develop
git switch -c tipo/nome-da-atividade
```

Depois de alterar e testar:

```bash
git add .
git commit -m "feat(scope): describe the change"
git push -u origin tipo/nome-da-atividade
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
