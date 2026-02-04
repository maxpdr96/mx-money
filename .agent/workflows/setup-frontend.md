---
description: Como configurar e rodar o frontend React do MX-Money
---

# Setup Frontend - MX-Money

## Pré-requisitos
- Node.js 20+ (LTS)
- npm 10+

## Passos

// turbo-all

1. Navegue até o diretório do frontend
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/frontend
```

2. Instale as dependências
```bash
npm install
```

3. Rode a aplicação em modo de desenvolvimento
```bash
npm run dev
```

4. A aplicação estará disponível em `http://localhost:5173`

## Build para produção
```bash
npm run build
```

## Estrutura de componentes principais
- `src/components/TransactionForm` - Formulário para adicionar transações
- `src/components/TransactionList` - Lista de transações
- `src/components/BalanceCard` - Card com saldo atual
- `src/components/ProjectionChart` - Gráfico de projeção de saldo
- `src/components/Calendar` - Calendário com entradas e saídas
