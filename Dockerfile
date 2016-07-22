FROM nginx:1.11.1

#RUN apk add --update nginx>1.8.1-r1

# RUN apt-get update && apt-get install -y nginx

RUN \
  apt-get update && apt-get install -y curl && \
  curl -sL https://deb.nodesource.com/setup_6.x | bash && \
  apt-get install -y nodejs

ENV NODE_ENV=production

WORKDIR /usr/lib/docker-nginx

COPY package.json /usr/lib/docker-nginx
RUN npm install

COPY README.md /usr/lib/docker-nginx/
COPY lib       /usr/lib/docker-nginx/lib
COPY bin       /usr/lib/docker-nginx/bin
RUN npm link

CMD ["startup"]
