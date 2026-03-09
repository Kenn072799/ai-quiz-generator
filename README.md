# AI Quiz Generator

An AI-powered study platform that generates quizzes from uploaded documents. Students upload study materials, the AI extracts topics, generates multiple-choice questions, and tracks learning progress over time.

---

## Features

- **Document Upload** — Upload PDF, DOCX, or TXT files and extract text automatically
- **AI Topic Extraction** — Automatically detect major topics from document content
- **Quiz Generation** — Generate up to 10 multiple-choice questions per topic using Groq AI (Llama 3)
- **Adaptive Difficulty** — Questions and explanations adjust based on education level (Elementary / High School / College)
- **Language Support** — Generate quizzes in English or Tagalog
- **Flashcard Mode** — Review topics using flippable flashcards
- **Quiz Results & Review** — View score, correct/incorrect answers, and AI explanations
- **Progress Tracking** — Track quiz history, scores, and improvement over time
- **Forgot / Reset Password** — Secure password reset via email (Gmail SMTP)
- **JWT Authentication** — Secure register, login, and protected routes
- **Focus Study Mode** — Pomodoro-style timer with study summary before quiz unlock
- **Admin Dashboard** — Monitor students, documents, and platform analytics

---

## Tech Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion                   |
| Backend  | ASP.NET Core (.NET 10) Web API                                   |
| Database | PostgreSQL via [Neon](https://neon.tech) (free tier)             |
| AI       | [Groq API](https://console.groq.com) — `llama-3.3-70b-versatile` |
| Email    | MailKit — Gmail SMTP with App Password                           |
| Auth     | JWT Bearer tokens + BCrypt password hashing                      |
| ORM      | Entity Framework Core 10 + Npgsql                                |

---

## Project Structure

```
project03_ai_quiz_generator_project/
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # Auth, Documents, Topics, Quiz, Flashcards, Dashboard
│   ├── DTOs/                 # Request/response data transfer objects
│   ├── Data/                 # EF Core DbContext
│   ├── Migrations/           # EF Core database migrations
│   ├── Models/               # Entity models (User, Document, Topic, Quiz, etc.)
│   ├── Services/             # JwtService, GroqService, DocumentService, SmtpEmailService
│   ├── Uploads/              # Uploaded document storage (gitignored at runtime)
│   ├── appsettings.json      # Safe config with placeholders (committed)
│   └── appsettings.Development.json  # Real secrets (gitignored — never committed)
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── components/       # Layout, Sidebar
    │   ├── context/          # AuthContext (JWT decode + user state)
    │   ├── pages/            # Auth, Dashboard, Documents, Topics, Quiz, Flashcards, Progress, Settings
    │   └── services/         # Axios API client
    ├── .env.example          # Template for environment variables
    └── .env                  # Real env vars (gitignored — never committed)
```

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [Neon PostgreSQL](https://neon.tech) account (free)
- [Groq API key](https://console.groq.com) (free)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

### 2. Backend setup

**Create your local secrets file:**

```bash
cp backend/appsettings.json backend/appsettings.Development.json
```

**Edit `backend/appsettings.Development.json`** and fill in your real values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your_neon_postgres_connection_string"
  },
  "Jwt": {
    "Key": "your_random_secret_min_32_characters"
  },
  "Groq": {
    "ApiKey": "your_groq_api_key"
  },
  "Smtp": {
    "Username": "your_gmail@gmail.com",
    "Password": "your_gmail_app_password",
    "FromEmail": "your_gmail@gmail.com"
  },
  "App": {
    "FrontendUrl": "http://localhost:5174"
  }
}
```

**Run database migrations:**

```bash
cd backend
dotnet ef database update
```

**Start the backend:**

```bash
dotnet run
# Runs on http://localhost:5196
```

---

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5196/api
```

Install dependencies and start:

```bash
npm install
npm run dev
# Runs on http://localhost:5174
```

---

## Environment Variables

### Backend — `appsettings.Development.json` (gitignored)

| Key                                   | Description                              |
| ------------------------------------- | ---------------------------------------- |
| `ConnectionStrings:DefaultConnection` | Neon PostgreSQL connection string        |
| `Jwt:Key`                             | Random secret key (min 32 chars)         |
| `Groq:ApiKey`                         | Groq API key                             |
| `Smtp:Username`                       | Gmail address                            |
| `Smtp:Password`                       | Gmail App Password (16 chars)            |
| `App:FrontendUrl`                     | Frontend origin for reset password links |

### Frontend — `.env` (gitignored)

| Key            | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

---

## API Endpoints

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | `/api/auth/register`        | Register new student            |
| POST   | `/api/auth/login`           | Login                           |
| POST   | `/api/auth/forgot-password` | Send password reset email       |
| POST   | `/api/auth/reset-password`  | Reset password with token       |
| PUT    | `/api/auth/settings`        | Update profile settings         |
| POST   | `/api/documents/upload`     | Upload study document           |
| GET    | `/api/documents`            | List user's documents           |
| DELETE | `/api/documents/{id}`       | Delete document                 |
| POST   | `/api/topics/extract`       | Extract topics from document    |
| GET    | `/api/topics/{documentId}`  | Get topics for a document       |
| POST   | `/api/quizzes/generate`     | Generate quiz questions         |
| POST   | `/api/quizzes/submit`       | Submit quiz and calculate score |
| GET    | `/api/quizzes/history`      | Get quiz attempt history        |
| GET    | `/api/flashcards/{topicId}` | Get flashcards for a topic      |
| GET    | `/api/dashboard`            | Get student dashboard stats     |

---

## Database Schema

| Table           | Description                        |
| --------------- | ---------------------------------- |
| `Users`         | Student and admin accounts         |
| `Documents`     | Uploaded study files               |
| `Topics`        | Extracted topics per document      |
| `Quizzes`       | Generated quizzes per topic        |
| `Questions`     | Multiple-choice questions per quiz |
| `QuizAttempts`  | Student quiz attempts and scores   |
| `Flashcards`    | Flashcard pairs per topic          |
| `StudySessions` | Focus mode study session records   |

---

## Gmail App Password Setup

1. Go to [myaccount.google.com](https://myaccount.google.com) → **Security**
2. Enable **2-Step Verification**
3. Go to **App passwords** → select **Mail** → **Generate**
4. Copy the 16-character password into `Smtp:Password` in your Development config

---

## Security

- Passwords hashed with **BCrypt**
- JWT tokens signed with HMAC-SHA256
- All secret keys stored in `appsettings.Development.json` (gitignored)
- File uploads validated for type (PDF/DOCX/TXT) and size
- CORS restricted to known frontend origins
- Reset password tokens expire in 60 minutes

---

## Deployment

### Backend — Render (free tier)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service** → connect your repo
3. Render will auto-detect the `render.yaml` and configure the service
4. In the Render dashboard, go to **Environment** and set these secret values:

| Key                                    | Value                                                         |
| -------------------------------------- | ------------------------------------------------------------- |
| `ConnectionStrings__DefaultConnection` | Your Neon PostgreSQL connection string                        |
| `Jwt__Key`                             | Your random JWT secret (min 32 chars)                         |
| `Groq__ApiKey`                         | Your Groq API key                                             |
| `Smtp__Username`                       | Your Gmail address                                            |
| `Smtp__Password`                       | Your Gmail App Password                                       |
| `Smtp__FromEmail`                      | Your Gmail address                                            |
| `App__FrontendUrl`                     | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |
| `AllowedOrigins__0`                    | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |

5. Deploy — your API will be available at `https://ai-quiz-generator-api.onrender.com`

> **Note:** Free tier Render services spin down after 15 minutes of inactivity and take ~30s to wake up on the next request.

---

### Frontend — Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add this **Environment Variable** in the Vercel dashboard:

| Key            | Value                                            |
| -------------- | ------------------------------------------------ |
| `VITE_API_URL` | `https://ai-quiz-generator-api.onrender.com/api` |

4. Deploy — Vercel auto-detects Vite and builds it
5. The `vercel.json` in the frontend folder handles SPA routing automatically

---

## License

This project is for educational purposes.
