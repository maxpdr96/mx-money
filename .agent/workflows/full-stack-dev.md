---
description: Como rodar o ambiente completo de desenvolvimento do MX-Money
---

# Full Stack Development - MX-Money

## Visão Geral
Este workflow descreve como rodar tanto o backend quanto o frontend simultaneamente para desenvolvimento.

// turbo-all

## Terminal 1 - Backend

1. Abra um terminal e navegue até o backend
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/backend
```

2. Execute o Spring Boot
```bash
mvn spring-boot:run
```

## Terminal 2 - Frontend

1. Abra outro terminal e navegue até o frontend
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/frontend
```

2. Execute o Vite dev server
```bash
npm run dev
```

## URLs
- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:5173
- **Swagger UI** (se habilitado): http://localhost:8080/swagger-ui.html

## Hot Reload
- O backend com Spring Boot DevTools recarrega automaticamente ao salvar arquivos Java
- O frontend com Vite HMR atualiza automaticamente ao salvar arquivos React

## Dicas
- Use o navegador com DevTools aberto para ver requisições de rede
- O SQLite database fica em `backend/data/mxmoney.db`