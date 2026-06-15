# E-Waster

Sistema web para **agendamento e gerenciamento de descarte de lixo eletrônico**, desenvolvido
para a cadeira de Engenharia de Software (UFRPE).

O repositório é um **monorepo**:

```
E-Waster/
  backend/    API REST em Java 21 + Spring Boot (porta 8081, prefixo /api/v1)
  frontend/   SPA em React 19 + Vite (porta 5173)
```

---

## ⭐ Passo 0 — Use a branch certa

A branch **final**, com todas as funcionalidades integradas, é a `juntando-branches-fim`.
Logo após clonar, entre nela:

```bash
git clone <url-do-repositorio> E-Waster
cd E-Waster
git checkout juntando-branches-fim
```

---

## Stack

**Backend:** Java 21 · Spring Boot · Spring Web · Spring Data JPA / Hibernate · Spring Security (JWT) · PostgreSQL · Flyway · Maven Wrapper
**Frontend:** React 19 · Vite · Material UI · Lucide React · Axios · React Router
**Banco:** PostgreSQL local (`ewaster_dev`)

---

## Pré-requisitos

- **JDK 21** — `java -version` deve mostrar a versão 21.
- **Node.js 20+ e npm** — `node -v` / `npm -v`.
- **PostgreSQL** instalado e rodando na porta `5432`.
- **Git**.

> O **Maven não precisa estar instalado**: o projeto usa o Maven Wrapper (`mvnw`).
>
> No Windows o `psql` normalmente **não está no PATH** — o binário fica em algo como
> `C:\Program Files\PostgreSQL\18\bin\psql.exe`. Ajuste o caminho conforme a sua versão.

---

## Passo 1 — Criar o banco de dados

Crie o banco **vazio**; o backend monta o schema e semeia os dados via **Flyway** no primeiro boot.

```bash
# Git Bash / Linux / Mac
psql -h localhost -U postgres -c "CREATE DATABASE ewaster_dev;"
```

```powershell
# Windows PowerShell
$env:PGPASSWORD="123456"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE ewaster_dev;"
```

> Credenciais usadas pelo backend (em `backend/src/main/resources/application-dev.yml`):
> banco `ewaster_dev`, usuário `postgres`, senha `123456`. Se o seu PostgreSQL usar outra
> senha, edite esse arquivo.

| Item    | Valor            |
| ------- | ---------------- |
| Host    | `localhost:5432` |
| Banco   | `ewaster_dev`    |
| Usuário | `postgres`       |
| Senha   | `123456`         |

---

## Passo 2 — Subir o backend (porta 8081)

```bash
cd backend
./mvnw spring-boot:run      # Git Bash / Linux / Mac
```

```powershell
cd backend
.\mvnw.cmd spring-boot:run   # Windows PowerShell
```

- Sobe em **http://localhost:8081**, com tudo sob o prefixo `/api/v1`.
- No primeiro boot, o Flyway aplica as migrations e o **admin é criado automaticamente**
  (via `AdminSeeder`).
- Teste rápido: `curl http://localhost:8081/api/v1/health`

---

## Passo 3 — Subir o frontend (porta 5173)

Em **outro terminal**:

```bash
cd frontend
npm install
npm run dev
```

- Acesse **http://localhost:5173** (porta esperada pelo CORS do backend).
- O front conversa com `http://localhost:8081/api/v1`.

---

## Passo 4 — Rodar os testes automatizados (obrigatório ✅)

Os testes fazem parte da entrega e **devem ser executados**.

### Backend (JUnit + Spring Boot Test)

> 🔴 Os testes do backend rodam contra o banco **`ewaster_dev` real**. Para passarem: o
> PostgreSQL precisa estar no ar e o banco precisa existir e estar semeado (faça o Passo 1 e
> suba o backend ao menos uma vez — o Flyway aplica as migrations). Os testes são
> `@Transactional` (rollback automático): **não deixam resíduo** no banco.

```bash
cd backend
./mvnw test       # Git Bash / Linux / Mac
```

```powershell
cd backend
.\mvnw.cmd test    # Windows PowerShell
```

São **46 testes**, cobrindo agendamentos, slots de coleta, descartes/pontuação, relatórios
administrativos e tipos de resíduo. Ao final, espere `BUILD SUCCESS`.

### Frontend (Vitest) — não precisa de banco

```bash
cd frontend
npm install   # se ainda não instalou
npm test
```

---

## Passo 5 — Caminho feliz (demonstração ponta a ponta)

> ⚠️ **Importante:** as vagas de coleta semeadas pela migration têm **datas fixas
> (02–04/06/2026) que já venceram**, então não aparecem para agendamento. Por isso o primeiro
> passo da demonstração é o **admin criar um horário com data futura**.

### 5.1 — Login como admin e criar um horário de coleta

1. Na tela inicial, entre como **administrador**:

   ```
   email: admin@ewaster.com
   senha: admin123
   ```

2. No **Painel Administrativo**, clique em **"Criar horário de coleta (vagas)"**.
3. Preencha uma **data futura**, horário de início, fim e a capacidade, e clique em **Criar**.
   Ex.: Data = (um dia à frente de hoje), Início = `08:00`, Fim = `12:00`, Capacidade = `5`.

   > O backend bloqueia datas passadas e horários sobrepostos; com data futura, aparece
   > **"Horário criado com sucesso"** e a vaga entra na lista.

### 5.2 — Login como usuário comum e agendar a coleta

4. Saia do admin e **cadastre um usuário comum** na tela de cadastro (ou faça login se já tiver).
5. Vá em **"Agendar Coleta"** — a vaga que o admin criou aparece na lista.
6. Escolha o(s) **tipo(s) de resíduo** e a **quantidade**, selecione a vaga e **confirme**.

   > O agendamento fica com status **PENDENTE** (ainda sem pontos).

### 5.3 — Admin valida o agendamento e credita os pontos

7. Volte a entrar como **admin** → **"Visualizar usuários e validar agendamentos"**.
8. Selecione o usuário e clique em **Aprovar** no agendamento pendente.

   > O agendamento vira **REALIZADO** e os **pontos são creditados** ao usuário (já com o
   > bônus da campanha ativa, se houver).

### 5.4 — Conferir o resultado

9. Como usuário comum, veja a pontuação no **perfil** e a posição no **ranking**.

Pronto — esse é o fluxo principal do E-Waster:
**admin abre horário → usuário agenda → admin valida → usuário ganha pontos**.

---

## Credenciais

**Admin** (semeado automaticamente pelo backend — `AdminSeeder`):

```
email: admin@ewaster.com
senha: admin123
```

**Usuário comum:** cadastre-se na própria tela de cadastro do front, ou via API:

```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Fulano","email":"fulano@teste.com","senha":"123456"}'
```

---

## Migrations e dados de exemplo (Flyway)

As migrations ficam em `backend/src/main/resources/db/migration/`:

| Migration                                       | O que faz                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `V1__schema.sql`                                | Cria todo o schema (usuário, slot_coleta, agendamento, descarte, campanha, etc.)|
| `V2__seed_inicial.sql`                          | Insere 9 tipos de resíduo e **6 vagas de coleta** (datas 02–04/06/2026)         |
| `V3__adiciona_multiplicador_campanha.sql`       | Adiciona o multiplicador de pontos das campanhas                                |
| `V4__adiciona_tipo_residuo_campanha.sql`        | Vincula campanhas a um tipo de resíduo                                          |
| `V5__adiciona_total_pontos_agendamento.sql`     | Congela o total de pontos creditado na aprovação do agendamento                 |
| `V6__adiciona_campanha_aplicada_agendamento.sql`| Guarda snapshot da campanha aplicada (multiplicador + nome) no agendamento      |

> ⚠️ **Não edite uma migration que já foi aplicada** — isso quebra o checksum do Flyway.
> Mudanças de schema/dados entram em uma migration **nova** (próxima seria `V7`).

---

## Principais endpoints

Tudo sob o prefixo `/api/v1`.

| Método & rota                            | Acesso        | Descrição                                  |
| ---------------------------------------- | ------------- | ------------------------------------------ |
| `POST /auth/register`                    | público       | Cadastro de usuário comum                  |
| `POST /auth/login`                       | público       | Login (devolve `{ token, ... }`)           |
| `GET  /health`                           | público       | Healthcheck                                |
| `GET  /usuarios/ranking`                 | público       | Ranking (nome + pontos)                    |
| `GET  /usuarios/me`                      | autenticado   | Dados do usuário logado                    |
| `PUT  /usuarios/me`                      | autenticado   | Atualiza o perfil do usuário logado        |
| `GET  /usuarios`                         | **ADMIN**     | Lista usuários                             |
| `GET  /tipos-residuo`                    | autenticado   | Lista os tipos de resíduo                  |
| `GET  /slots`                            | autenticado   | Lista as vagas de coleta com vagas livres  |
| `POST /slots`                            | **ADMIN**     | Cria uma nova vaga de coleta               |
| `PATCH /slots/{id}/desativar`            | autenticado   | Desativa uma vaga de coleta                |
| `POST /agendamentos`                     | autenticado   | Cria um agendamento                        |
| `GET  /agendamentos/me`                  | autenticado   | Agendamentos do usuário logado             |
| `DELETE /agendamentos/{id}`              | autenticado   | Cancela um agendamento                     |
| `GET  /agendamentos/pendentes`           | **ADMIN**     | Agendamentos pendentes de validação        |
| `PATCH /agendamentos/{id}/recusar`       | **ADMIN**     | Recusa um agendamento pendente             |
| `POST /descartes`                        | **ADMIN**     | Aprova agendamento e credita pontos        |
| `GET  /campanhas`                        | autenticado   | Lista todas as campanhas                   |
| `GET  /campanhas/ativas`                 | autenticado   | Lista as campanhas ativas                  |
| `POST /campanhas`                        | **ADMIN**     | Cria uma campanha                          |
| `PUT  /campanhas/{id}`                   | **ADMIN**     | Edita uma campanha                         |
| `DELETE /campanhas/{id}`                 | **ADMIN**     | Remove uma campanha                        |
| `GET  /relatorios/engajamento`           | **ADMIN**     | Relatório de engajamento por período       |
| `GET  /relatorios/residuos`              | **ADMIN**     | Relatório de resíduos por período          |
| `GET  /relatorios/descartes`             | **ADMIN**     | Relatório de descartes por período         |

> Rota protegida sem token (ou com papel insuficiente) devolve **403**.

---

## Resumo dos comandos

```bash
# 0. Branch final
git clone <url> E-Waster && cd E-Waster && git checkout juntando-branches-fim

# 1. Banco
psql -h localhost -U postgres -c "CREATE DATABASE ewaster_dev;"

# 2. Backend (porta 8081)
cd backend && ./mvnw spring-boot:run

# 3. Frontend (porta 5173) — em outro terminal
cd frontend && npm install && npm run dev

# 4. Testes (obrigatório)
cd backend && ./mvnw test    # precisa do PostgreSQL no ar e ewaster_dev semeado
cd frontend && npm test      # não precisa de banco

# 5. Demonstrar: admin cria horário (data futura) → usuário agenda → admin aprova → pontos
#    admin: admin@ewaster.com / admin123
```
