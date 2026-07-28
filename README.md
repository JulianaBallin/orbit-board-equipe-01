# OrbitBoard — Instruções para iniciar o trabalho da equipe

Este documento descreve como obter o código-fonte base do projeto **OrbitBoard**, criar um repositório próprio da equipe no GitHub e realizar todo o desenvolvimento nesse novo repositório.

> **Importante:** o repositório fornecido pelo docente deve ser utilizado apenas como fonte inicial. Cada equipe deverá trabalhar exclusivamente em seu próprio repositório.

---

## 1. Clonar o repositório base

Abra um terminal e execute:

```bash
git clone https://github.com/denkencapacitacao/orbit-board-project.git
```

Acesse a pasta criada:

```bash
cd orbit-board-project
```

Confirme o estado do projeto:

```bash
git status
```

---

## 2. Criar o repositório remoto da equipe no GitHub

No GitHub:

1. Clique em **New repository**.
2. Defina um nome para o repositório da equipe, por exemplo:

   ```text
   orbit-board-equipe-01
   ```

3. Escolha a visibilidade solicitada pelo docente.
4. Não marque as opções de criação automática de `README`, `.gitignore` ou licença.
5. Clique em **Create repository**.
6. Adicione os demais integrantes da equipe como colaboradores.

Copie a URL HTTPS do repositório criado. Exemplo:

```text
https://github.com/NOME-DO-USUARIO/orbit-board-equipe-01.git
```

---

## 3. Subir o código-fonte para o repositório próprio

Verifique o remoto atual:

```bash
git remote -v
```

Renomeie o repositório do docente para `upstream`:

```bash
git remote rename origin upstream
```

Adicione o repositório da equipe como novo `origin`:

```bash
git remote add origin https://github.com/NOME-DO-USUARIO/orbit-board-equipe-01.git
```

Substitua a URL acima pela URL real do repositório da equipe.

Verifique:

```bash
git remote -v
```

O resultado deverá ser semelhante a:

```text
origin    https://github.com/NOME-DO-USUARIO/orbit-board-equipe-01.git (fetch)
origin    https://github.com/NOME-DO-USUARIO/orbit-board-equipe-01.git (push)
upstream  https://github.com/denkencapacitacao/orbit-board-project.git (fetch)
upstream  https://github.com/denkencapacitacao/orbit-board-project.git (push)
```

Envie o código inicial:

```bash
git branch -M main
git push -u origin main
```

Depois, confirme no GitHub se todos os arquivos foram publicados corretamente.

---

## 4. Trabalhar somente no repositório da equipe

A partir desse momento, todos os integrantes deverão clonar o repositório próprio da equipe:

```bash
git clone https://github.com/NOME-DO-USUARIO/orbit-board-equipe-01.git
```

Acesse a pasta:

```bash
cd orbit-board-equipe-01
```

Antes de iniciar uma nova atividade:

```bash
git switch main
git pull origin main
```

Crie uma branch específica:

```bash
git switch -c feature/nome-da-atividade
```

Exemplo:

```bash
git switch -c feature/melhoria-tela-projetos
```

Após realizar as alterações:

```bash
git status
git add .
git commit -m "feat: descreve objetivamente a alteração"
git push -u origin feature/nome-da-atividade
```

Depois, abra um **Pull Request** no GitHub para integrar a branch à branch principal definida pela equipe.

---

## Fluxo resumido

```text
Repositório do docente
        ↓ git clone
Cópia local inicial
        ↓ novo origin
Repositório da equipe
        ↓ branches e pull requests
Desenvolvimento colaborativo
```

---

## Regras importantes

- Não trabalhar diretamente no repositório do docente.
- Não enviar alterações para o remoto `upstream`.
- Utilizar o repositório da equipe como `origin`.
- Criar branches para funcionalidades, correções e documentação.
- Fazer commits pequenos e com mensagens claras.
- Atualizar a branch principal antes de iniciar uma nova atividade.
- Utilizar Pull Requests para revisar e integrar alterações.
- Garantir que todos os integrantes tenham acesso ao repositório próprio.

---

## Comandos principais

```bash
# Clonar o projeto base
git clone https://github.com/denkencapacitacao/orbit-board-project.git
cd orbit-board-project

# Manter o repositório do docente como referência
git remote rename origin upstream

# Conectar o repositório da equipe
git remote add origin https://github.com/NOME-DO-USUARIO/orbit-board-equipe-01.git

# Enviar o código inicial
git branch -M main
git push -u origin main

# Criar uma branch de trabalho
git switch -c feature/nome-da-atividade

# Registrar e enviar alterações
git add .
git commit -m "feat: descreve objetivamente a alteração"
git push -u origin feature/nome-da-atividade
```
