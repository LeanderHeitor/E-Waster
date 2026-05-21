# E-Waster

Sistema web para gerenciamento de descarte de lixo eletronico, desenvolvido para a cadeira de Engenharia de Software.

O repositorio esta organizado como monorepo:

```text
E-Waster/
  backend/    API REST em Java + Spring Boot
  frontend/   SPA em React + Vite
```

## Status Atual

Implementado e integrado:

- Backend Spring Boot conectado ao PostgreSQL local.
- Endpoint publico de saude: `GET /api/v1/health`.
- Cadastro real de usuario: `POST /api/v1/auth/register`.
- Frontend chamando o backend no cadastro.
- Frontend exibindo status da API na Home.

Ainda mockado ou pendente:

- Login real/JWT.
- Slots de coleta vindos do backend.
- Agendamentos persistidos no banco.
- Tipos de residuo, descarte, ranking e pontuacao real.
- Migrations Flyway. O projeto tem Flyway como dependencia, mas o banco atual foi criado manualmente no pgAdmin.

## Stack

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- PostgreSQL
- Flyway, ainda sem migrations versionadas
- Maven Wrapper

### Frontend

- React
- Vite
- JavaScript
- Material UI
- Lucide React
- Fetch API para chamadas HTTP

### Banco

- PostgreSQL local
- Banco usado no ambiente de desenvolvimento: `ewaster_dev`
- Usuario padrao usado pelo backend: `postgres`
- Senha padrao usada pelo backend: `123456`

## Pre-requisitos

- PostgreSQL instalado e rodando na porta `5432`.
- JDK 21 configurado.
- Node.js e npm instalados.

No Git Bash, caso o terminal ainda use Java 11, configure o Java 21:

```bash
echo 'export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.5.11-hotspot"' >> ~/.bashrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
java -version
```

O `java -version` deve mostrar Java 21.

## Configuracao do Banco

Crie o banco no pgAdmin 4:

```sql
CREATE DATABASE ewaster_dev;
```

Depois, conectado ao banco `ewaster_dev`, crie a tabela usada pelo backend atual:

```sql
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    pontuacao_total INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

O arquivo `Banco de Dados` contem uma modelagem maior planejada para o sistema completo, mas o backend atual ainda usa apenas a tabela `usuario`.

## Configuracao do Backend

As configuracoes estao em:

```text
backend/src/main/resources/application-dev.yml
```

Valores atuais:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ewaster_dev
    username: postgres
    password: 123456
```

Como o banco foi criado manualmente e ainda nao existem migrations, rode o backend desativando o Flyway nesta execucao:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.flyway.enabled=false
```

Quando subir corretamente, o log deve conter:

```text
Database JDBC URL [jdbc:postgresql://localhost:5432/ewaster_dev]
Tomcat started on port 8080
Started EwasterApplication
```

Para parar o backend, use `Ctrl + C`.

Se a porta `8080` estiver ocupada:

```bash
netstat -ano | grep ':8080'
taskkill //PID NUMERO_DO_PID //F
```

## Configuracao do Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O Vite abre em:

```text
http://localhost:5173
```

O frontend chama a API em:

```text
http://localhost:8080/api/v1
```

Se precisar apontar para outro backend, use a variavel:

```bash
VITE_API_URL=http://localhost:8080/api/v1 npm run dev
```

## Rotas Disponiveis Agora

### Health

```http
GET /api/v1/health
```

Resposta esperada:

```text
API online
```

### Cadastro

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Body:

```json
{
  "nome": "Teste",
  "email": "teste@email.com",
  "senha": "123456"
}
```

Resposta esperada:

```text
Usuario cadastrado
```

Se o email ja existir:

```text
E-mail ja cadastrado
```

## Teste Manual da Integracao

1. Suba o PostgreSQL.
2. Suba o backend:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.flyway.enabled=false
```

3. Suba o frontend em outro terminal:

```bash
cd frontend
npm run dev
```

4. Acesse `http://localhost:5173`.
5. Clique em cadastro e crie um usuario novo.
6. Confira no pgAdmin:

```text
ewaster_dev > Schemas > public > Tables > usuario > View/Edit Data > All Rows
```

O usuario cadastrado pelo frontend deve aparecer na tabela.

Tambem da para testar por terminal:

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com","senha":"123456"}'
```

## Comandos de Verificacao

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
./mvnw -q -DskipTests compile
./mvnw -q test -Dspring.flyway.enabled=false
```

No PowerShell, se `npm` for bloqueado por politica de scripts, use:

```powershell
npm.cmd run build
```

## Estrutura Importante

```text
frontend/src/api/http.js        Cliente HTTP base
frontend/src/api/authApi.js     Chamadas de autenticacao/cadastro
frontend/src/api/healthApi.js   Chamada de health check
frontend/src/pages/             Telas da aplicacao

backend/src/main/java/br/ufrpe/ewaster/auth/
backend/src/main/java/br/ufrpe/ewaster/config/
backend/src/main/java/br/ufrpe/ewaster/user/
backend/src/main/resources/
```

## Proximas Funcionalidades

Ordem recomendada conforme a proposta tecnica:

1. Login real no backend.
2. JWT e contexto de autenticacao no frontend.
3. Rotas privadas no frontend.
4. Migrations Flyway para versionar o schema.
5. Slots de coleta vindos do backend.
6. Agendamento persistido no banco.
7. Tipos de residuo, descarte, pontuacao e ranking.

## Checklist Antes de Abrir PR

- `git status` revisado.
- Nao incluir `node_modules/`, `dist/`, `target/` ou arquivos locais.
- `frontend/src/api` atualizado se alguma rota do backend mudar.
- `npm run build` passando no frontend.
- `./mvnw -q -DskipTests compile` passando no backend.
- `./mvnw -q test -Dspring.flyway.enabled=false` passando no backend enquanto Flyway nao tiver migrations.
- Cadastro testado pelo frontend e usuario confirmado no pgAdmin.
- README atualizado quando mudar comando, rota, banco ou fluxo de setup.

