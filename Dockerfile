# Hugging Face Spaces / any free Docker host
# Listens on PORT (HF defaults to 7860)
FROM node:20-slim

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    NODE_ENV=production \
    PORT=7860

WORKDIR $HOME/app

COPY --chown=user package.json package-lock.json ./
COPY --chown=user client/package.json ./client/
COPY --chown=user server/package.json ./server/

RUN npm ci

COPY --chown=user client ./client
COPY --chown=user server ./server

RUN npm run build --workspace=client \
  && npm prune --omit=dev

EXPOSE 7860
CMD ["node", "server/index.js"]
