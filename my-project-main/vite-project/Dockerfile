FROM node:22-slim

WORKDIR /app

# Only what the server needs at runtime - keeps the image small and avoids
# bundling the Vite/React frontend into this container.
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY server ./server

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server/index.js"]
