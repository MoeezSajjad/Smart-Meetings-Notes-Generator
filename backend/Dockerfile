FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY src/ ./src/
RUN mkdir -p uploads && chown node:node uploads
USER node
CMD ["node", "src/index.js"]
