# Backend API image. The frontend is deployed separately (Vercel) and the
# Python CLI runs locally, so neither is included here.
FROM node:20-alpine AS build
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
# The backend reads shared/steps.json and presets/*.yaml at startup.
COPY backend/src ./backend/src
COPY shared ./shared
COPY presets ./presets

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
USER node
EXPOSE 3000
CMD ["node", "backend/src/index.js"]
