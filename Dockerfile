FROM node:6.10.2

ENV NODE_ENV=production

WORKDIR /src/ClientApp

RUN npm run build

COPY /dist /app
WORKDIR /app

EXPOSE 5000

ENTRYPOINT ["npm", "run", "start:prod"]
