FROM node:20.12.2-alpine3.18 AS base

# # Production only deps stage
# FROM base AS production-deps
# WORKDIR /app
# ADD package.json package-lock.json ./
# # RUN npm install --force

# Build stage
FROM base AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN yarn install
COPY . .
RUN yarn build
# COPY --from=deps /app/node_modules /app/node_modules
# RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE 8080
CMD ["node", "./bin/server.js"]
