# E-Waster: Coleta Consciente

Sistema web para gerenciamento de coleta consciente de lixo eletrônico, desenvolvido para a disciplina de Engenharia de Software da UFRPE.

O projeto evoluiu de um protótipo React para uma arquitetura full stack baseada em React + Spring Boot + PostgreSQL, seguindo uma abordagem de MVP incremental.

---

# Tecnologias

## Frontend

- React 19
- Vite
- React Router DOM
- Axios

## Backend

- Java 21
- Spring Boot 3
- Spring Data JPA
- Spring Security
- Flyway
- Swagger/OpenAPI

## Banco de Dados

- PostgreSQL 16

---

# Funcionalidades do Protótipo

## 1. Agendar Coleta

- Seleção de slots de horário disponíveis
- Escolha de itens de lixo eletrônico com pontuação
- Cálculo automático de pontos totais
- Confirmação e feedback de sucesso

### Itens disponíveis

- Celular/Smartphone (15 pts)
- Notebook/Laptop (25 pts)
- Pilhas e Baterias (5 pts)
- Cabos e Carregadores (3 pts)
- Monitor/Tela (20 pts)
- Teclado/Mouse (5 pts)

---

## 2. Meus Agendamentos

- Visualização de todos os agendamentos do usuário
- Status de cada agendamento:
  - Pendente
  - Realizado
  - Cancelado
  - Não Compareceu
- Opção de cancelar agendamentos pendentes
- Listagem ordenada por data

---

# Arquitetura Atual

```text
Frontend React (Vite)
        ↓ HTTP/JSON
Backend Spring Boot REST API
        ↓ JDBC
PostgreSQL 16
```

---

# Estrutura do Projeto

```text
E-Waster/
 ├── frontend/
 │    ├── src/
 │    ├── public/
 │    ├── package.json
 │    └── vite.config.js
 │
 ├── backend/
 │    ├── src/
 │    ├── pom.xml
 │    └── mvnw.cmd
 │
 ├── scripts/
 └── README.md
```

---

# Como Executar

# Pré-requisitos

Instalar:

- Node.js 18+
- Java 21
- PostgreSQL 16
- Git

---

# Configuração do Banco de Dados

## 1. Criar banco local

Abrir PostgreSQL e executar:

```sql
CREATE DATABASE ewaster_dev;
```

---

# Configuração do Backend

## 1. Entrar na pasta backend

```bash
cd backend
```

---

## 2. Configurar application.yml

Arquivo:

```text
backend/src/main/resources/application.yml
```

Exemplo:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ewaster_dev
    username: postgres
    password: SUA_SENHA

  jpa:
    hibernate:
      ddl-auto: validate

    show-sql: true

    properties:
      hibernate:
        format_sql: true

  flyway:
    enabled: true

server:
  port: 8080
```

---

## 3. Executar backend

### Windows PowerShell

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux/macOS

```bash
./mvnw spring-boot:run
```

---

# Configuração do Frontend

## 1. Entrar na pasta frontend

```bash
cd frontend
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Executar frontend

```bash
npm run dev
```

Frontend disponível em:

```text
http://localhost:5173
```

---

# Endpoints Iniciais

## Health Check

```http
GET /api/v1/health
```

URL:

```text
http://localhost:8080/api/v1/health
```

Resposta esperada:

```text
API OK
```

---

# Swagger

Documentação automática da API:

```text
http://localhost:8080/swagger-ui.html
```

---

# Flyway

As migrations do banco ficam em:

```text
backend/src/main/resources/db/migration
```

Exemplo:

```text
V1__init.sql
```

---

# Segurança

Atualmente o Spring Security está configurado apenas para liberar os endpoints durante a Sprint 1.

Autenticação JWT será implementada na Sprint 2.

---

# Características de Design

## Paleta de Cores

- Verde primário: #2E7D32
- Verde secundário: #4CAF50
- Laranja destaque: #F57C00

## Layout

- Mobile-first
- Responsivo
- Interface otimizada inicialmente para 390px

---

# Regras da Aplicação

- Slots esgotados ficam desabilitados
- Mínimo 1 item deve ser selecionado por agendamento
- Visualização de pontos antes da confirmação
- Apenas agendamentos pendentes podem ser cancelados
- Dados mockados localmente no protótipo inicial

---

# Status Atual

## Sprint 1 — Em andamento

### Concluído

- Estrutura monorepo
- Separação frontend/backend
- Backend Spring Boot inicializado
- Integração PostgreSQL
- Configuração Flyway
- Endpoint `/api/v1/health`
- Swagger/OpenAPI
- Configuração inicial do Spring Security

### Próximos passos

- Entidade Usuario
- JWT
- AuthController
- Login/Register
- Slots de coleta

---

# Equipe

- Otávio Olímpio
- Hilana
- Heitor
- Alan Pessoa

---

# Licença

Projeto acadêmico desenvolvido para fins educacionais na UFRPE.