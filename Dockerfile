ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION} as base

FROM base as build
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

FROM node:${NODE_VERSION} as final
WORKDIR /usr/src/app
ENV NODE_ENV production
ENV PORT 3000
ENV HOST 0.0.0.0
ENV LOG_LEVEL info
ENV APP_KEY PSrLFnX1TyHSO9a_SlA37U0ZZ0BWJIlv
ENV DEBUG false
ENV DB_HOST 192.168.1.108
ENV DB_PORT 5432
ENV DB_USER postgres
ENV DB_PASS postgres
ENV DB_NAME UserManagement
ENV JWT_SECRET weirgf3w45vtgwsdfq3bhbggfurtieytgv
ENV SESSION_DRIVER cookie
# USER node
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build .
CMD ["node", "./bin/server.js"]
