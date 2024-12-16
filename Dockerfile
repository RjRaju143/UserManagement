ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION} AS base

FROM base AS build
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

FROM node:${NODE_VERSION} AS final
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build .
CMD ["node", "./bin/server.js"]
