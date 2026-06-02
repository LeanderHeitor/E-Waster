# E-Waster

Sistema web para gerenciamento de descarte de lixo eletrônico, desenvolvido para a cadeira de Engenharia de Software.
O repositório está organizado como monorepo:
E-Waster/
  backend/    API REST em Java + Spring Boot
  frontend/   SPA em React + Vite

---

## Status Atual

### 🟢 Implementado e Integrado (Funcionalidades Prontas):
* **Autenticação Real (JWT):** Login e contexto de autenticação global estruturados no front-end (`AuthContext`) integrados à segurança com tokens Bearer do Spring Security.
* **Fluxo Completo de Agendamento:** Escolha de slots e confirmação integradas diretamente de ponta a ponta à API REST (Full Stack).
* **Slots de Coleta Dinâmicos (`GET /slots`):** Listagem de horários e datas buscada em tempo real do banco de dados, mapeando os intervalos (`horarioInicio` às `horarioFim`).
* **Criação e Persistência (`POST /agendamentos`):** Envio estruturado do DTO do agendamento (IDs dos slots e array de itens selecionados) com armazenamento persistente de pai e filhos no banco de dados.
* **Cálculo de Pontuação Inteligente:** O front-end intercepta e calcula automaticamente os pontos obtidos com base no `pontuacaoBase` de cada tipo de resíduo, blindando as telas de erros de sincronismo do banco de dados.
* **Gerenciamento e Histórico (`GET /me` & `DELETE`):** Listagem dinâmica dos agendamentos do usuário logado e capacidade de cancelamento síncrono.

### 🟡 Ainda Pendente / Próximos Passos:
* **Migrations Flyway:** O projeto tem o Flyway como dependência, mas o banco atual ainda precisa ter suas migrations versionadas para espelhar o schema completo gerado pelo JPA (incluindo as tabelas de agendamentos, itens e slots).

---

## Stack

### Backend
* Java 21
* Spring Boot
* Spring Web
* Spring Data JPA / Hibernate
* Spring Security (Autenticação via Token JWT)
* PostgreSQL
* Flyway, ainda sem migrations versionadas
* Maven Wrapper

### Frontend
* React
* Vite
* JavaScript
* Material UI
* Lucide React
* Fetch API para chamadas HTTP com Headers de Autorização

### Banco
* PostgreSQL local
* Banco usado no ambiente de desenvolvimento: `ewaster_dev`
* Usuário padrão usado pelo backend: `postgres`
* Senha padrão usada pelo backend: `123456`

---

## Pré-requisitos

* PostgreSQL instalado e rodando na porta 5432.
* JDK 21 configurado.
* Node.js e npm instalados.

No Git Bash, caso o terminal ainda use Java 11, configure o Java 21:
```bash
echo 'export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.5.11-hotspot"' >> ~/.bashrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
java -version
