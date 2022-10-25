FROM node:16.18.0-alpine3.16

RUN apk add --no-cache \
  ca-certificates \
  dumb-init \
  nginx=1.22.1-r0

ENV APP_DIR="/usr/local/lib/pmkr_nginx"

RUN mkdir "${APP_DIR}"

WORKDIR "${APP_DIR}"

COPY package.json "${APP_DIR}"
COPY package-lock.json "${APP_DIR}"

RUN npm ci

COPY src/. "${APP_DIR}/"

RUN ln -s "${APP_DIR}/bin/startup" /usr/local/bin/startup

ENTRYPOINT [ "dumb-init", "--" ]

CMD [ "startup" ]
