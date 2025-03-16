"## Chronos API

### Overview
The **Chronos API** is a backend system designed to support user-generated content, including endpoints for managing posts, comments, tags, and user authentication. It enables post creation with attachments, user comments, reactions, and includes JWT-based authentication. The system uses **MySQL** for persistent storage, **Multer** for file uploads, and is built with **Node.js** and **TypeScript** for scalability and maintainability.

---

### Features
- **User Authentication**: JWT-based auth with access, refresh, and email verification tokens.
- **CRUD Operations**: Manage posts, comments, and tags.
- **File Uploads**: Support for post images and user avatars.
- **Pagination, Sorting, Filtering**: Flexible data retrieval via query parameters.
- **Reactions**: Like/dislike system for posts and comments.
- **Email Notifications**: Email service for verification and notifications.

---

### Database Schema

The database follows a relational structure using MySQL with the following key tables:
- **User**: Stores user information and authentication data.
- **Post**: Contains posts created by users.
- **Comment**: Linked to posts for user comments.
- **Tag**: Categorizes posts.
- **Reactions**: Tracks likes/dislikes on posts and comments.

<!-- <p align=\"center\">
  <br>
  <img src=\"https://i.ibb.co/5jGzR50/Screenshot-12.png\" alt=\"Database Schema\">
</p> -->

---

### Environment Variables

Copy `.env.example` to `.env` and set the following:

- `NODE_ENV` — development | production
- `PORT` — Port for server
- `HOST` — Server host
- `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `JWT_EMAIL_TOKEN_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRES_IN`, `JWT_REFRESH_TOKEN_EXPIRES_IN`, `JWT_EMAIL_TOKEN_EXPIRES_IN`
- `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_HOST`, `DB_PORT` — MySQL credentials
- `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` — SMTP server
- `MYSQLDB_LOCAL_PORT`, `MYSQLDB_DOCKER_PORT`
- `NODE_LOCAL_PORT`, `NODE_DOCKER_PORT`
- `DATABASE_URL` — MySQL connection string

---

### Installation and Setup

#### Manual Setup
1. Clone the repo: `git clone https://github.com/chronos-project/chronos-api.git`
2. Navigate to project folder: `cd chronos-api`
3. Install dependencies: `npm install`
4. Configure `.env` as described above
5. Run DB migrations: `npm run db:migrate`
6. Seed database: `npm run seed`
7. Build project: `npm run build`
8. Start server: `npm run start`

#### Docker Setup
1. Clone the repo
2. Create `.env` file and set `DB_HOST=mysqldb`
3. Start with Docker: `docker-compose up --build`

---

### Available Scripts

- `npm run build` — Compile TypeScript
- `npm run start` — Start production server
- `npm run typeorm` — TypeORM CLI
- `npm run db:drop` — Drop all tables
- `npm run migration:generate` — Generate migration
- `npm run db:migrate` — Apply migrations
- `npm run db:revert` — Revert last migration
- `npm run db:sync` — Sync schema and run migrations
- `npm run format` — Format code with Prettier
- `npm run seed` — Seed database with test data

---

### API Documentation

API is available at `/api-docs` (Swagger UI) when the server is running.

---

### Troubleshooting

- Ensure environment variables are set
- MySQL service is running
- Verify JWT secrets and token settings
- Check server logs
- Review GitHub issues if needed"
