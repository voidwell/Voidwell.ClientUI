FROM pivotalpa/angular-cli:1.4.2 AS build-env
WORKDIR /app

# Copy and restore as distinct layers
COPY ./src/ClientApp/src /app/src
COPY ./src/ClientApp/*.json /app/

RUN npm install

RUN npm run build:prod

# Build runtime image
FROM node:6.10.2
WORKDIR /app

RUN mkdir -p /opt && cd /opt && curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.23.3 && mv ~/.yarn /opt/yarn
ENV PATH "$PATH:/opt/yarn/bin"

ENV NODE_ENV=production

RUN yarn add express

COPY --from=build-env /app/dist ./dist
COPY ./src/ClientApp/server .

RUN yarn add oidc-client@1.2.0 helmet@3.3.0

EXPOSE 5000

ENTRYPOINT ["node", "server.js"]