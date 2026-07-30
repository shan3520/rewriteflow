FROM node:20-alpine AS base
RUN apk add --no-cache python3 py3-pip
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY . .
EXPOSE 3000
CMD ["node", "backend/src/index.js"]
