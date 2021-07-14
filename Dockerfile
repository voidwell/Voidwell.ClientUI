FROM node:12-alpine AS build-env

RUN apk update \
  && apk add --update alpine-sdk python \
  && yarn global add @angular/cli@9.1.6 \
  && apk del alpine-sdk python \
  && rm -rf /tmp/* /var/cache/apk/* *.tar.gz ~/.npm \
  && npm cache clean --force \
  && yarn cache clean \
  && sed -i -e "s/bin\/ash/bin\/sh/" /etc/passwd

WORKDIR /app

COPY ./src/*.json /app/
COPY ./src/*.lock /app/
COPY ./src/src /app/src

RUN yarn install
RUN npx ngcc --properties esm5 module main --create-ivy-entry-points

RUN yarn run build:prod

FROM node:12
WORKDIR /app

RUN mkdir -p /opt && cd /opt && curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.23.3 && mv ~/.yarn /opt/yarn
ENV PATH "$PATH:/opt/yarn/bin"

ENV NODE_ENV=production

RUN yarn add express

COPY --from=build-env /app/dist ./dist
COPY ./src/server .

EXPOSE 5000

ENTRYPOINT ["node", "server.js"]