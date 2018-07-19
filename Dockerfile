FROM alexsuch/angular-cli:6.0.5 AS build-env
WORKDIR /app

COPY ./src/ClientApp/package.json /app/package.json
RUN npm install

COPY ./src/ClientApp/*.json /app/

COPY ./src/ClientApp/src /app/src

RUN npm run build:prod

FROM node:6.10.2
WORKDIR /app

RUN mkdir -p /opt && cd /opt && curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.23.3 && mv ~/.yarn /opt/yarn
ENV PATH "$PATH:/opt/yarn/bin"

ENV NODE_ENV=production

RUN yarn add express

COPY --from=build-env /app/dist ./dist
COPY ./src/ClientApp/server .

EXPOSE 5000

ENTRYPOINT ["node", "server.js"]