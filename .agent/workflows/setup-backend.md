---
description: Como configurar e rodar o backend Spring Boot do MX-Money
---

# Setup Backend - MX-Money

## Pré-requisitos
- Java 25 (JDK 25)
- Maven 3.9+
- Spring Boot 4.X+

## Passos

// turbo-all

1. Navegue até o diretório do backend
```bash
cd /home/maxpdr/Documents/programming/java/mx-money/backend
```

2. Compile o projeto
```bash
mvn clean compile
```

3. Execute os testes
```bash
mvn test
```

4. Rode a aplicação
```bash
mvn spring-boot:run
```

5. A aplicação estará disponível em `http://localhost:8080`

## Endpoints principais
- `GET /api/transactions` - Lista todas as transações
- `POST /api/transactions` - Cria nova transação
- `GET /api/balance` - Retorna saldo atual
- `GET /api/balance/projection?days=30` - Projeção de saldo futuro

## Configurações
O arquivo `application.properties` ou `application.yml` contém as configurações do banco SQLite.