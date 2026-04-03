# SideKick — Frontend

React 18 frontend for the SideKick companion-matching platform.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and point REACT_APP_API_URL to your backend URL
npm start
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

## Backend Required

This frontend expects a Node.js/Express backend running on port 5000 with these API routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/verify-id`
- `POST /api/auth/verify-face`
- `GET  /api/auth/me`
- `PUT  /api/users/profile`
- `GET  /api/matches/suggestions`
- `GET  /api/matches/pending`
- `GET  /api/matches/active`
- `POST /api/matches/request`
- `PUT  /api/matches/respond`
- `GET  /api/events`
- `GET  /api/events/mine`
- `POST /api/events`
- `POST /api/events/:id/join`
- `GET  /api/chats/rooms`
- `GET  /api/chats/:roomId`
- `POST /api/reports`

Socket.io events: `join_room`, `send_message`, `new_message`, `typing`, `user_typing`

## Tech Stack

- React 18, React Router v6
- Framer Motion, GSAP, Lenis
- Axios, Socket.io-client
- TailwindCSS, Lucide React
- react-hot-toast
