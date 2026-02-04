# 💰 MX Money

<div align="center">

![Java](https://img.shields.io/badge/Java-25-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4%2B-green?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Spring AI](https://img.shields.io/badge/Spring_AI-2.0-6DB33F?style=for-the-badge&logo=spring)
![Ollama](https://img.shields.io/badge/Ollama-LLaMA%203.2-black?style=for-the-badge&logo=ollama)

Look at your finances from a new perspective. | Olhe para suas finanças de uma nova perspectiva.

[Features](#-key-features) • [Installation](#-installation) • [AI Setup](#-ai-setup) • [Technologies](#-technologies)

</div>

---

## 🌎 Overview

**MX Money** is a powerful personal finance application that combines a robust **Spring Boot** backend with a modern **React** frontend. It goes beyond simple tracking by integrating **Local AI (Ollama)** to provide personalized financial insights without your data ever leaving your machine.

**MX Money** é uma aplicação poderosa de finanças pessoais que combina um backend robusto em **Spring Boot** com um frontend moderno em **React**. Ele vai além do simples rastreamento, integrando **IA Local (Ollama)** para fornecer insights financeiros personalizados sem que seus dados saiam da sua máquina.

## ✨ Key Features

- **💸 Transaction Management**: Effortlessly track income and expenses.
- **🤖 AI-Powered Analysis**: Get intelligent feedback on your spending habits using local LLMs (Llama 3.2).
- **📈 Projections**: Visualize future balances based on recurring transactions.
- **🔄 Recurring Transactions**: Set up daily, weekly, monthly, or yearly repeats with auto-generation.
- **📊 Interactive Charts**: Beautiful visualization of spending by category and timeline.
- **🌍 Internationalization**: Full support for English (EN) and Portuguese (PT-BR).
- **💾 Local Backup**: Export/Import your database and auto-backup functionality.
- **🌓 Dark/Light Mode**: Sleek UI tailored for day or night.

## 🚀 Installation

### Prerequisites | Pré-requisitos
- Java 25
- Node.js 20+
- Maven
- [Ollama](https://ollama.com/) (for AI features)

### 1. Clone & Build

```bash
git clone https://github.com/your-username/mx-money.git
cd mx-money

# Build Backend & Frontend (Integrated)
cd backend
mvn clean install
```

### 2. Run Application

```bash
# Run using Spring Boot Maven plugin
mvn spring-boot:run
```

Access the application at | Acesse a aplicação em: `http://localhost:8080`

## 🧠 AI Setup (Ollama)

To enable the "AI Reports" tab, you need to have Ollama running locally.
Para habilitar a aba "Relatórios IA", você precisa do Ollama rodando localmente.

1. **Install Ollama | Instale o Ollama**: [ollama.com](https://ollama.com)
2. **Pull the Model | Baixe o Modelo**:
   ```bash
   ollama pull llama3.2
   ```
3. **Start Server | Inicie o Servidor**:
   ```bash
   ollama serve
   ```

The application is configured to connect to `http://localhost:11434`.

## 🛠️ Technologies

### Backend
- **Framework**: Spring Boot 4.X
- **Language**: Java 25
- **Database**: SQLite (Zero config excellence)
- **AI Integration**: Spring AI 2.0 (Ollama Support)
- **ORM**: Hibernate/JPA
- **Mapping**: MapStruct & Lombok

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Modern Variables & Animations)
- **State Management**: TanStack Query
- **Icons**: Lucide React
- **Markdown**: React Markdown

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by Max
</div>
