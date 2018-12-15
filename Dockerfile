FROM alexsuch/angular-cli:base AS build-env

RUN apk update \
  && npm install -g @angular/cli@7.1.3 \
  && rm -rf /tmp/* /var/cache/apk/* *.tar.gz ~/.npm \
  && npm cache clear --force \
  && yarn cache clean \
  && sed -i -e "s/bin\/ash/bin\/sh/" /etc/passwd

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