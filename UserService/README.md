#### Tack Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Runtime          | Node.js + TypeScript             |
| Framework        | Fastify                          |
| Package Manager  | pnpm                             |
| Database         | PostgreSQL                       |
| ORM              | Prisma                           |
| Validation       | Zod                              |
| Authentication   | JWT                              |
| Authorization    | RBAC (Role Based Access Control) |
| Password Hashing | bcrypt                           |
| API Docs         | Swagger                          |
| Logging          | Pino (Fastify Logger)            |
| Error Handling   | Global Error Handler             |
| Testing          | Vitest                           |
| Containerization | Docker + Docker Compose          |
| Environment      | dotenv + Zod Validation          |



#### Final Project Structure module-based structure

UserService
│
├── prisma
│   ├── migrations
│   ├── schema.prisma
│   └── seed.ts
│
├── src
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── auth.types.ts
│   │
│   └── user/
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       ├── user.routes.ts
│       ├── user.schema.ts
│       └── user.types.ts
│   ├── configs
│   │
│   ├── constants
│   │
│   ├── controllers
│   │
│   ├── middleware
│   │
│   ├── plugins
│   │
│   ├── repositories
│   │
│   ├── routes
│   │
│   ├── services
│   │
│   ├── tests
│   │
│   ├── types
│   │
│   ├── utils
│   │
│   ├── validators
│   │
│   ├── server.ts
│   └── index.ts
│
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md