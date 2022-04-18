FROM node:16-alpine AS devdeps

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=false


FROM node:16-alpine AS deps

WORKDIR /app

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

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ./bin ./bin

CMD [ "./bin/run", "config.js" ]
