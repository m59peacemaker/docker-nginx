FROM node:16.14.2-alpine3.15

RUN apk add --no-cache \
  ca-certificates \
  dumb-init \
  nginx=1.20.2-r0

# alpine nginx build needs this to exist
RUN mkdir /run/nginx

ENV NODE_ENV=production

WORKDIR /usr/lib/docker-nginx

COPY package.json /usr/lib/docker-nginx
RUN npm install

COPY README.md /usr/lib/docker-nginx/
COPY lib       /usr/lib/docker-nginx/lib
COPY bin       /usr/lib/docker-nginx/bin
RUN npm link

ENTRYPOINT [ "dumb-init", "--" ]

CMD [ "startup" ]
