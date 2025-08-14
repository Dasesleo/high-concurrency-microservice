
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --only=production

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
EXPOSE 8080
USER node
CMD ["node", "src/server.js"]
