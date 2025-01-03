ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION} AS base

FROM base AS build
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

FROM node:${NODE_VERSION} AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build .
RUN chown -R node:node /usr/src/app
USER node
CMD ["pm2","start", "ecosystem.confg.cjs"]
