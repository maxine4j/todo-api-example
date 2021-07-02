FROM node:14.15.3-alpine as builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile --network-timeout 600000
COPY tsconfig.json /app
COPY ./src /app/src
RUN yarn build

FROM node:14.15.3-alpine as installer
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --prod --pure-lockfile --network-timeout 600000

FROM node:14.15.3-alpine as prod
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules/
COPY --from=builder /app/dist/ ./dist/
EXPOSE 3000
CMD ["node", "--unhandled-rejections=strict", "/app/dist/app.js"]
