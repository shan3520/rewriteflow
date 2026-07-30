FROM node:20-alpine AS build
RUN apk add --no-cache python3 py3-pip
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY . .

FROM node:20-alpine AS runner
RUN apk add --no-cache python3
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["node", "backend/src/index.js"]
