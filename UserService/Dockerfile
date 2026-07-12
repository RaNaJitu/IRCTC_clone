FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN corepack enable

RUN pnpm install

COPY . .

RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm","dev"]