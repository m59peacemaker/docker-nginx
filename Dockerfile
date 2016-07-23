FROM mhart/alpine-node:6.3.1

RUN apk add --update wget ca-certificates nginx=1.10.1-r1

# alpine nginx build needs this to exist
RUN mkdir /run/nginx

RUN \
  wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 && \
  chmod +x /usr/local/bin/dumb-init

# cleanup
RUN apk del --purge wget

ENV NODE_ENV=production

WORKDIR /usr/lib/docker-nginx

COPY package.json /usr/lib/docker-nginx
RUN npm install

COPY README.md /usr/lib/docker-nginx/
COPY lib       /usr/lib/docker-nginx/lib
COPY bin       /usr/lib/docker-nginx/bin
RUN npm link

# signals like p.kill() in node don't work without dumb-init
ENTRYPOINT ["dumb-init"]

CMD ["startup"]
