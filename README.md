# E-Waster

Sistema web para gerenciamento de descarte de lixo eletrônico, desenvolvido para a cadeira de Engenharia de Software.

O repositório é um **monorepo**:

```
E-Waster/
  backend/    API REST em Java 21 + Spring Boot (porta 8080, prefixo /api/v1)
  frontend/   SPA em React + Vite (porta 5173)
```

---

## Stack

**Backend:** Java 21 · Spring Boot · Spring Web · Spring Data JPA / Hibernate · Spring Security (JWT) · PostgreSQL · Flyway · Maven Wrapper
**Frontend:** React · Vite · Material UI · Lucide React · Axios / Fetch API
**Banco:** PostgreSQL local (`ewaster_dev`)

---

## Pré-requisitos

- **PostgreSQL** instalado e rodando na porta `5432`.
- **JDK 21** configurado (`java -version` deve mostrar 21).
- **Node.js + npm** instalados.

> No Windows o `psql` normalmente **não está no PATH**. O binário fica em algo como
> `C:\Program Files\PostgreSQL\18\bin\psql.exe`. Ajuste o caminho conforme a sua versão.

---

## 1. Configuração do banco

As credenciais ficam em `backend/src/main/resources/application-dev.yml`:

| Item    | Valor          |
| ------- | -------------- |
| Host    | localhost:5432 |
| Banco   | `ewaster_dev`  |
| Usuário | `postgres`     |
| Senha   | `123456`       |

Crie o banco **vazio** (o backend cuida do schema e dos dados via Flyway):

```bash
# Git Bash / Linux / Mac
createdb -h localhost -U postgres ewaster_dev

# ou via psql
psql -h localhost -U postgres -c "CREATE DATABASE ewaster_dev;"
```

```powershell
# Windows PowerShell
$env:PGPASSWORD="123456"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE ewaster_dev;"
```

> **Não precisa criar tabelas nem rodar SQL na mão.** Ao subir o backend pela primeira
> vez, o Flyway aplica as migrations (schema + dados de exemplo) automaticamente.

---

## 2. Rodando o backend

```bash
cd backend

# Git Bash / Linux / Mac
./mvnw spring-boot:run
```

```powershell
# Windows PowerShell
cd backend
.\mvnw.cmd spring-boot:run
```

- Sobe em **http://localhost:8080**, com tudo sob o prefixo `/api/v1`.
- No primeiro boot, o Flyway executa as migrations `V1` (schema) e `V2` (seed inicial).
- Um **usuário admin** é criado automaticamente (ver credenciais abaixo).

Teste rápido de que está no ar:

```bash
curl http://localhost:8080/api/v1/health
```

---

## 3. Rodando o frontend

```bash
cd frontend
npm install
npm run dev
```

- Sobe em **http://localhost:5173** (porta esperada pelo CORS do backend).
- O front conversa com `http://localhost:8080/api/v1`.

---

## 4. Credenciais

**Admin** (semeado automaticamente pelo backend — `AdminSeeder`):

```
email: admin@ewaster.com
senha: admin123
```

**Usuário comum:** cadastre-se na própria tela de cadastro do front, ou via API:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Fulano","email":"fulano@teste.com","senha":"123456"}'
```

---

## 5. Migrations e dados de exemplo (Flyway)

As migrations ficam em `backend/src/main/resources/db/migration/`:

| Migration               | O que faz                                                                 |
| ----------------------- | ------------------------------------------------------------------------- |
| `V1__schema.sql`        | Cria todo o schema (usuário, slot_coleta, agendamento, descarte, etc.)    |
| `V2__seed_inicial.sql`  | Insere 9 tipos de resíduo e **6 vagas de coleta** (datas 02–04/06/2026)   |

> ⚠️ **Não edite uma migration que já foi aplicada** — isso quebra o checksum do Flyway.
> Mudanças de schema/dados entram em uma migration nova (próxima seria `V3`).

---

## 6. Como fazer as VAGAS (slots) aparecerem

As vagas que aparecem na tela **"Agendar Coleta"** vêm da tabela `slot_coleta`, populada
pela migration `V2`. Se a lista estiver vazia ("Nenhum horário disponível"), é porque a
tabela está sem registros. Siga o passo a passo:

### a) Conferir se existem vagas no banco

```bash
psql -h localhost -U postgres -d ewaster_dev \
  -c "SELECT id, data, horario_inicio, horario_fim, capacidade_maxima, ativo FROM slot_coleta ORDER BY data;"
```

```powershell
# Windows PowerShell
$env:PGPASSWORD="123456"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d ewaster_dev `
  -c "SELECT id, data, horario_inicio, horario_fim, capacidade_maxima, ativo FROM slot_coleta ORDER BY data;"
```

- **Se retornar 6 linhas (`ativo = t`):** os dados estão lá. A lista vazia no front, nesse
  caso, costuma ser **falta de login/token** — o `GET /api/v1/slots` exige um JWT válido.
  Faça login no front (ou via API) e recarregue.
- **Se retornar 0 linhas:** o seed não foi aplicado neste banco. Use uma das opções abaixo.

### b) Opção recomendada — recriar o banco do zero

A causa mais comum de "0 vagas" é o Flyway ter feito *baseline* de um banco que já existia
(com `baseline-on-migrate: true`) e ter **pulado o seed**. A forma limpa de resolver é
recriar o banco vazio e deixar o Flyway aplicar `V1` + `V2` de novo:

```bash
psql -h localhost -U postgres -c "DROP DATABASE ewaster_dev;"
psql -h localhost -U postgres -c "CREATE DATABASE ewaster_dev;"
# suba o backend de novo: o Flyway recria o schema e semeia as 6 vagas
```

> ⚠️ Isso apaga **todos** os dados de dev (usuários, agendamentos…). Em desenvolvimento,
> tudo bem — o admin e as vagas são re-semeados no próximo boot.

### c) Opção rápida — inserir vagas manualmente

Se não quiser recriar o banco, insira vagas direto (ajuste as datas para o futuro):

```sql
INSERT INTO slot_coleta (data, horario_inicio, horario_fim, capacidade_maxima, ativo) VALUES
  ('2026-06-10', '08:00', '12:00', 5, TRUE),
  ('2026-06-10', '13:00', '17:00', 5, TRUE),
  ('2026-06-11', '08:00', '12:00', 5, TRUE);
```

---

## 7. Criando vagas pela API (admin)

Como o seed `V2` é **fixo** (3 dias, datas que vencem), existe um endpoint para o **admin**
criar novas vagas sem mexer em migration nem em SQL:

```bash
# 1) Logar como admin e capturar o token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ewaster.com","senha":"admin123"}' | jq -r .token)

# 2) Criar uma vaga (somente ADMIN)
curl -X POST http://localhost:8080/api/v1/slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"data":"2026-06-20","horarioInicio":"08:00","horarioFim":"12:00","capacidadeMaxima":5}'
```

Validações do endpoint: `data`, `horarioInicio`, `horarioFim` e `capacidadeMaxima`
são obrigatórios; `horarioFim` deve ser maior que `horarioInicio`; capacidade ≥ 1.

---

## 8. Principais endpoints

| Método & rota                          | Acesso        | Descrição                                  |
| -------------------------------------- | ------------- | ------------------------------------------ |
| `POST /api/v1/auth/register`           | público       | Cadastro de usuário comum                  |
| `POST /api/v1/auth/login`              | público       | Login (devolve `{ token, ... }`)           |
| `GET  /api/v1/slots`                   | autenticado   | Lista as vagas de coleta com vagas livres  |
| `POST /api/v1/slots`                   | **ADMIN**     | Cria uma nova vaga de coleta               |
| `POST /api/v1/agendamentos`            | autenticado   | Cria um agendamento                        |
| `GET  /api/v1/agendamentos/me`         | autenticado   | Agendamentos do usuário logado             |
| `DELETE /api/v1/agendamentos/{id}`     | autenticado   | Cancela um agendamento                     |
| `GET  /api/v1/agendamentos/pendentes`  | **ADMIN**     | Agendamentos pendentes de validação        |
| `POST /api/v1/descartes`               | **ADMIN**     | Aprova agendamento e credita pontos        |
| `GET  /api/v1/usuarios`                | **ADMIN**     | Lista usuários                             |
| `GET  /api/v1/usuarios/ranking`        | público       | Ranking (nome + pontos)                    |

> Rota protegida sem token devolve **403** (não 401).

---

## 9. Verificação local rápida

```bash
# Backend: valida entidades + aplica migrations sem subir o servidor
cd backend && ./mvnw test

# Frontend
cd frontend && npm test
```

Fluxo manual ponta a ponta:
1. Banco `ewaster_dev` criado e backend no ar (porta 8080).
2. Confirmar as 6 vagas (seção 6a) ou criar novas (seções 6c / 7).
3. Frontend no ar (porta 5173) → login → tela **Agendar Coleta** deve listar as vagas.
