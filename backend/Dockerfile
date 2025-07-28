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

# Copy dependencies and built code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose the port the app runs on
EXPOSE 3000

# The command to run the application
# It first applies any pending migrations and then starts the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
