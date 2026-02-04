---
description: Como fazer build e rodar o projeto integrado ou separado
---

# Build do MX-Money

## Opção 1: Build Integrado (Produção)

Um único comando compila backend + frontend e gera um JAR executável:

// turbo-all

1. Faça o build completo
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/backend
mvn clean package -DskipTests
```

2. Execute o JAR gerado
```bash
java -jar target/money-0.0.1-SNAPSHOT.jar
```

3. Acesse `http://localhost:8080` - o frontend é servido pelo Spring Boot

### O que acontece no build integrado:
- Maven baixa Node.js 20.11 e npm automaticamente
- Executa `npm install` no frontend
- Executa `npm run build` (gera pasta dist)
- Copia conteúdo de `frontend/dist` para `backend/target/classes/static`
- Empacota tudo em um único JAR

---

## Opção 2: Desenvolvimento Separado (Recomendado para dev)

Rodar backend e frontend separados com hot reload:

// turbo-all

### Terminal 1 - Backend
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Terminal 2 - Frontend
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/frontend
npm run dev
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173` (com HMR - Hot Module Replacement)

O proxy no `vite.config.ts` redireciona `/api/*` para o backend.

---

## Pular build do frontend (apenas backend)

Se quiser compilar apenas o backend sem o frontend:

```bash
mvn clean package -DskipTests -Dskip.npm
```
