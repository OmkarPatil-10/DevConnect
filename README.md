# 🚀 DevConnect - Developer Collaboration Platform


Live Demo: [click here](https://devconnect-10.vercel.app/)
---

**DevConnect is a full-stack collaboration platform that helps developers find teammates, join sprint-based projects, manage tasks, and communicate in real-time with AI-powered matching.**

[Features](#-key-features) • [Setup](#-setup) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [API Overview](#-api-overview)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Setup](#-setup)
- [Project Structure](#-project-structure)
- [API Overview](#-api-overview)
- [Real-time Features](#-real-time-features)
- [AI Matching](#-ai-matching)
- [Known Notes](#-known-notes)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Overview

**DevConnect** is a developer collaboration platform built to help developers discover like-minded teammates, organize sprint-based work, collaborate on tasks, and communicate in real time.

It includes:
- Profile-based matching (filter + AI recommendations)
- Sprint rooms with chat + task board
- Direct messaging
- Connection management and network building

---

## ✨ Key Features

- **Authentication & Profiles** – Register/login, complete profiles, and manage user data.
- **Developer Matching** – Search for devs by skills/experience and get AI-powered match suggestions.
- **Sprint Management** – Create/join sprints, manage teams, and run time-boxed collaborations.
- **Task Board** – Drag & drop tasks, assign teammates, and track progress.
- **Real-time Chat** – Team chat per sprint and 1:1 direct messages using Socket.IO.
- **Network & Connections** – Send/receive connection requests and view your network.

---

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time chat)
- JWT authentication
- Gemini embeddings via `@google/generative-ai`

### Frontend
- React (Vite)
- Tailwind CSS
- React Router (routing)
- Socket.IO Client (real-time)
- `react-beautiful-dnd` (task board)

---

## ✅ Setup

### Prerequisites

- Node.js (v16+)
- npm (or yarn)
- MongoDB (local or Atlas)
- Google Gemini API key (for AI matching)

### 1) Clone Repository

```bash
git clone <repo-url>
cd DevConnect
```

### 2) Backend Setup

```bash
cd Backend
npm install
cp .env.sample .env
```

Update `Backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017/devconnect
CLIENT_BASE_URL=http://localhost:5173
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=3000
NODE_ENV=development
```

> ⚠️ The JWT signing secret is currently hard-coded as `CLIENT_SECRET_KEY` in `Backend/controllers/auth/auth-controller.js` and `Backend/server.js`. Replace it with a secure value for production.

Start the backend:

```bash
npm run dev
```

By default the backend runs on: `http://localhost:3000`

### 3) Frontend Setup

```bash
cd ../Frontend
npm install
cp .env.sample .env
```

Update `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

By default the frontend runs at: `http://localhost:5173`

---

## 🗂 Project Structure

### Backend (`/Backend`)

- `server.js` – Express server + Socket.IO
- `controllers/` – API logic (auth, match, sprint, message, tasks)
- `routes/` – Express route definitions
- `models/` – Mongoose schemas (User, Sprint, Task, Message, etc.)
- `services/` – AI match/embedding logic
- `lib/` – helper utilities (Gemini, embeddings, similarity)

### Frontend (`/Frontend`)

- `src/pages/` – Page components (Dashboard, Search, Sprint, Chat, etc.)
- `src/components/` – Shared UI components (Navbar, ProtectedRoute, etc.)
- `src/context/` – React context providers (User, Theme)
- `src/lib/` – Utility helpers

---

## 🔌 API Overview

### Auth

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login (returns JWT)
- `POST /api/auth/logout` – Logout
- `GET /api/auth/check-auth` – Verify token and fetch user data
- `PUT /api/auth/complete-profile` – Update user profile
- `GET /api/auth/user/:userId` – Get user profile

### Matching

- `GET /api/match/search-developers` – Search developers via filters
- `GET /api/match/ai-developer-matches` – AI-powered developer recommendations
- `GET /api/match/ai-sprint-matches` – AI-powered sprint recommendations

### Sprint / Task / Message

- `POST /api/sprint` – Create a sprint
- `GET /api/sprint` – List sprints
- `POST /api/tasks` – Create/update tasks
- `POST /api/message` – Send sprint chat messages

### Real-time (Socket.IO)

- `authenticate` – Authenticate socket using JWT
- `joinSprint` – Join a sprint chat room
- `sendMessage` – Send sprint chat messages
- `joinUserRoom` – Join a personal DM room
- `sendDirectMessage` – Send a direct message

---

## ⚡ Real-time Features

- Sprint chat and direct messages use Socket.IO
- Chat messages are persisted in MongoDB
- Rooms are used to segregate sprint chats and direct messages

---

## 🤖 AI Matching

AI matching is built using Gemini embeddings:

- `services/ai-match-service.js` generates embeddings for user profiles and sprints
- Endpoints supply AI-based recommendations for developers and sprints

> Note: Requires a valid Google Gemini API key set in `GEMINI_API_KEY`.

---

## 📝 Known Notes

- JWT secret is hard-coded (`CLIENT_SECRET_KEY`) — replace in production.
- There is no automated test suite configured yet.
- CORS is configured for localhost and `.vercel.app` origins.

---

## 🌱 Future Enhancements

- Add unit/integration tests (Jest + React Testing Library)
- Improve validation and error handling
- Add onboarding/walkthrough flows
- Add file sharing and code snippet support in chat

---



