# E-Waster: Coleta Consciente — Protótipo

Protótipo de interface web para o sistema E-Waster, projeto da cadeira de Engenharia de Software na UFRPE. Objetivo: validar os fluxos do módulo de agendamento de coleta de lixo eletrônico.

## Stack

- React 19
- Vite (bundler)
- Estilos inline com paleta definida
- Sem dependências externas de UI (implementação customizada)

## Functional Features

### 1. Agendar Coleta

- Seleção de slots de horário disponíveis
- Escolha de itens de lixo eletrônico com pontuação
- Cálculo automático de pontos totais
- Confirmação e feedback de sucesso

**Itens disponíveis:**

- Celular/Smartphone (15 pts)
- Notebook/Laptop (25 pts)
- Pilhas e Baterias (5 pts)
- Cabos e Carregadores (3 pts)
- Monitor/Tela (20 pts)
- Teclado/Mouse (5 pts)

### 2. Meus Agendamentos

- Visualização de todos os agendamentos do usuário
- Status de cada agendamento (Pendente, Realizado, Cancelado, Não Compareceu)
- Opção de cancelar agendamentos pendentes
- Listagem ordenada por data (mais recente primeiro)

## Como Executar

### 1. Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

### 2. Instalação

```bash
npm install
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

O projeto abrirá em `http://localhost:5173`

A aplicação suporta HMR (Hot Module Replacement) — qualquer alteração no código é refletida instantaneamente no navegador.

### 4. Build para Produção

```bash
npm build
```

Gera os arquivos otimizados em `dist/`

### 5. Preview da Build

```bash
npm preview
```

## Estrutura do Projeto

```
src/
  App.jsx         - Componente principal com toda a lógica da aplicação
  main.jsx        - Ponto de entrada
  App.css         - Estilos globais
  index.css       - Reset e configurações CSS
```

## Características de Design

- **Paleta de Cores:**
  - Verde primário: #2E7D32
  - Verde secundário: #4CAF50
  - Laranja (destaque): #F57C00

- **Layout:** Mobile-first (otimizado para 390px de largura)
- **Navegação:** Baseada em estado (useState), sem router
- **Dados:** Mockados localmente, sem persistência

## Regras da Aplicação

- Slots esgotados ficam desabilitados
- Mínimo 1 item deve ser selecionado por agendamento
- Visualização de pontos estimados antes de confirmar
- Apenas agendamentos "Pendente" podem ser cancelados
- Dados não persistem ao recarregar a página
