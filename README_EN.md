# Soul Oasis

<img src="/Users/nick/Downloads/WechatIMG212.jpg" alt="WechatIMG212" style="zoom:120%;" />

Soul Oasis: An AI-powered mental health ecosystem mobile app.

Soul Oasis: An AI mental health support app designed for students and people under high pressure, providing a low-barrier way to express emotions and practice self-regulation.

## Features

- 🤖 **AI Chat**: supports multi-turn conversations and uses a stress score (0–10) as part of the chat context.
- 📝 **Community Notes**: publish notes, browse lists, view details, and interact via comments.
- 🔐 **Accounts & Authentication**: access protected APIs with a token after login.

## Supported Platforms

- **iOS**: supports iOS Simulator / physical devices (recommended to run on iOS Simulator).

## Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Expo (required components will be installed automatically on first run)
- For iOS development: Xcode (macOS)
- Backend runtime: Java 11+, Maven, MySQL

(Optional) The backend uses Redis by default (see `application.yml`). For local development, it is recommended to have a Redis service available.

### Start Frontend (React Native + Expo)

Run in the project root:

```bash
npm install
npm run start
```

#### Using Expo Go (Recommended)

1. Install Expo Go on your phone
2. Run `npm run start` and scan the QR code shown in the terminal

#### Using Simulator / Development Build (Optional)

If you want to run directly on the simulator (requires Xcode / Android Studio environment on your machine):

```bash
npm run ios
```

### Start Backend (Spring Boot)

Backend code is located at:

- `src/services/team_project_backend_1219/`

The backend default port is `8080`. Database and AI proxy parameters can be configured via environment variables (see “Configuration” below).

Start with Maven Wrapper (recommended to avoid local Maven version differences):

```bash
cd src/services/team_project_backend_1219
./mvnw spring-boot:run
```

After startup, the service is available at: `http://127.0.0.1:8080`

## Configuration

### Frontend (`.env`, optional)

- **API base URL**: `EXPO_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8080`)
- **Auth mode**: `EXPO_PUBLIC_AUTH_MODE` (`auto`/`backend`/`mock`)
- **Dev auth bypass**: `EXPO_PUBLIC_AUTH_BYPASS=true` (for development/demo only)

Example:

```env
EXPO_PUBLIC_AUTH_MODE=backend
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
EXPO_PUBLIC_AUTH_BYPASS=true
```

Note: if the frontend runs on a physical device (not a simulator), `127.0.0.1` must be replaced with your computer’s LAN IP.

### Backend (key environment variables)

- **MySQL**: `MYSQL_HOST` `MYSQL_PORT` `MYSQL_DB` `MYSQL_USER` `MYSQL_PASSWORD`
- **Redis**: `REDIS_HOST` `REDIS_PORT` `REDIS_PASSWORD`
- **AI proxy**: `SOUL_AI_API_KEY` `SOUL_AI_BASE_URL` `SOUL_AI_MODEL`
- **Optional auth bypass**: `SOUL_AUTH_BYPASS=true`

The backend default database name is `sosd_blogs` (can be overridden via `MYSQL_DB`). Make sure MySQL is running and the database is created.

## Project Structure (excerpt)

```text
SoulOasisExpo/
├── README.md
├── README_EN.md
├── src/
│   ├── app/                           # navigation and global providers
│   ├── features/                      # feature modules/screens
│   ├── services/                      # API clients and backend project
│   │   └── team_project_backend_1219/ # Spring Boot backend
│   └── ui/                            # UI components and theme
└── docs/screenshots/                  # README screenshots
```

## Development Guide

- **Main screens/features**: `src/features/` (Auth, Chat, Community, etc.)
- **API base URL resolver**: `src/services/apiBaseUrl.ts`
- **AI chat call**: frontend `src/services/chat/chatApi.ts`, backend `POST /ai/chat`
- **Switch auth modes**: via `.env` `EXPO_PUBLIC_AUTH_MODE` / `EXPO_PUBLIC_AUTH_BYPASS`

## Common Issues

- **Frontend cannot reach backend**: confirm the backend is running at `http://127.0.0.1:8080`; when debugging on a physical device, set `EXPO_PUBLIC_API_BASE_URL` to your computer’s LAN IP.
- **Database connection failure**: confirm MySQL is running, the database exists (default `sosd_blogs`), and check `MYSQL_*` environment variables.
- **AI chat no response / errors**: confirm the backend has `SOUL_AI_API_KEY` configured (and `SOUL_AI_BASE_URL`/`SOUL_AI_MODEL` if needed).

## License

This project is for coursework purposes. If you need an open-source license statement, add a `LICENSE` file to the repository root and update this section.

## Contributing

Feel free to submit issues and improvement suggestions via Issues.

## Screenshots

### Login / Register

<img src="docs/login.png.jpg" alt="Login" style="zoom:30%;" />

### Home / Stress Input

<img src="docs/home.png" alt="Home" style="zoom:30%;" />

### AI Chat

<img src="docs/chat.png" alt="Chat" style="zoom:30%;" />

### Community (Feed / Post / Details)

<img src="docs/community1.png" alt="Community" style="zoom:30%;" />

<img src="docs/community2.png" alt="Community" style="zoom:30%;" />
