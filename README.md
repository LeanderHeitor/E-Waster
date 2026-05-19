# 🗄️ E-Waster — Banco de Dados (PostgreSQL)

Este repositório contém a modelagem e script SQL do banco de dados do sistema **E-Waster**, uma plataforma de gerenciamento de descarte de lixo eletrônico.

---

## 📌 SGBD Utilizado

* PostgreSQL

---

## 🧱 Visão Geral do Banco

O banco foi projetado para suportar:

* 👤 Gestão de usuários com perfis
* 📅 Agendamento de coletas em slots
* ♻️ Registro de descarte de resíduos
* 🏆 Sistema de conquistas (gamificação)
* 📢 Campanhas ambientais
* 🌍 Participação de usuários em campanhas

---

## 📊 Modelo Relacional

### Entidades principais:

* **USUARIO** → usuários do sistema
* **SLOT_COLETA** → horários disponíveis de coleta
* **TIPO_RESIDUO** → tipos de lixo eletrônico
* **AGENDAMENTO** → reservas de coleta
* **DESCARTE** → registros de descarte
* **CAMPANHA** → campanhas ambientais
* **CONQUISTA** → sistema de gamificação

### Relacionamentos:

* USUARIO ↔ AGENDAMENTO (1:N)
* USUARIO ↔ DESCARTE (1:N)
* USUARIO ↔ CONQUISTA (N:N)
* USUARIO ↔ CAMPANHA (N:N)
* SLOT_COLETA ↔ AGENDAMENTO (1:N)
* TIPO_RESIDUO ↔ DESCARTE (1:N)

---

## 🗄️ Estrutura do Banco

### 👤 USUARIO

Armazena os dados dos usuários do sistema.

* Tipos: `ADMIN`, `USUARIO`, `OPERADOR`
* Controle de pontuação

---

### 📅 SLOT_COLETA

Define os horários disponíveis para coleta.

* Data e horário de início/fim
* Capacidade máxima
* Status de ativação

---

### ♻️ TIPO_RESIDUO

Catálogo de resíduos eletrônicos.

* Nome do resíduo
* Pontuação base por descarte

---

### 📆 AGENDAMENTO

Controle de reservas de coleta.

* Usuário + Slot
* Status: `PENDENTE`, `CONFIRMADO`, `CANCELADO`, `CONCLUIDO`

---

### 🗑️ DESCARTE

Registro de descarte realizado.

* Relaciona usuário, tipo de resíduo e opcionalmente agendamento/campanha
* Data de registro automática

---

### 📢 CAMPANHA

Campanhas ambientais.

* Nome
* Período de início e fim

---

### 🏆 CONQUISTA

Sistema de gamificação.

* Nome da conquista
* Tipo de regra
* Valor necessário

---

### 🔗 TABELAS DE RELACIONAMENTO

#### USUARIO_CONQUISTA

Registra conquistas desbloqueadas por usuários.

#### USUARIO_CAMPANHA

Registra participação de usuários em campanhas.

---

## ⚙️ Tecnologias de Banco

* PostgreSQL
* SQL padrão ANSI
* ENUM Types
* Constraints (PK, FK, UNIQUE, CHECK)

---

## 🚀 Como Executar no pgAdmin 4

### 1. Criar banco

```sql
CREATE DATABASE ewaster_dev;
```

---

### 2. Criar ENUMs

```sql
CREATE TYPE tipo_usuario AS ENUM ('ADMIN', 'USUARIO', 'OPERADOR');

CREATE TYPE status_agendamento AS ENUM (
  'PENDENTE',
  'CONFIRMADO',
  'CANCELADO',
  'CONCLUIDO'
);
```

---

### 3. Executar script completo

Abra o **Query Tool** no pgAdmin 4 e execute o script SQL completo do projeto.

---

## 🔐 Regras de Integridade

* Exclusão em cascata para usuários
* Restrição de slots ocupados
* Histórico preservado via tabelas relacionais
* Consistência entre agendamento e descarte

---

## 📌 Observações Técnicas

* O modelo segue padrão relacional normalizado (3FN)
* Utiliza ENUMs para controle de estados
* Estrutura preparada para expansão (API + frontend)

---

## 📎 Status

🚧 Em evolução (integração com backend)
