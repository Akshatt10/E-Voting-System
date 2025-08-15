# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
# This ensures the client is generated based on the schema in the container
RUN npx prisma generate

# Stage 3: Production Image
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
