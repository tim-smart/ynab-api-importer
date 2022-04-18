FROM node:16-alpine AS devdeps

WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=false


FROM node:16-alpine AS deps

WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production


FROM node:16-alpine AS build

WORKDIR /app

COPY --from=devdeps /app/node_modules ./node_modules
COPY . ./

RUN yarn build


FROM node:16-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ./bin ./bin

CMD [ "./bin/run", "config.js" ]
