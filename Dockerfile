FROM node:lts AS runtime

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 4321

# Default dev command (bind to all interfaces for container access).
CMD ["npm","run","astro","dev","--","--host","0.0.0.0"]
