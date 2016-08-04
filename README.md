# pmkr/nginx

[![pmkr/nginx on Docker Hub](https://img.shields.io/badge/Docker%20Hub-Hosted-blue.svg)](https://hub.docker.com/r/pmkr/nginx/)

nginx docker image with dynamic conf support via [ejs](https://github.com/mde/ejs)

## example

```sh
docker run -it       \
--net=host           \
-v $PWD/your.conf:/nginx/nginx.conf \
-v $PWD/data.yaml:/nginx/nginx.yaml \
pmkr/nginx
```

## volumes

### /nginx

nginx configuration that will be prepared and moved to /etc/nginx

## environment variables

### `WATCH`

Glob pattern(s) of files to watch, separated by ` -- ` (space, dash, dash, space). When a watched file changes, conf files will be recompiled and nginx will reload.

```sh
-e WATCH="/nginx/*.conf"
```

```sh
-e WATCH="/nginx/*.conf -- /nginx/data.*"
```

## signals

### SIGHUP

If you signal `SIGHUP` to the container, conf files will be re-compiled and nginx will reload.

## .conf templates

`.conf` files under /nginx will be compiled with ejs.

### data file

The following files can be used to pass data to conf templates, having this priority:
- `/nginx/data.js` export data as a module
- `/nginx/data.yaml`
- `/nginx/data.json`

The data will be available in conf templates as `data`.

These files will be reloaded on each conf compile.

```
// data.js
module.exports = {port: 1234}

# .conf template
<%= data.port %>
```

### env

Environment variables are available in conf templates as `env`.

```
# docker environment
-e port=1234

# .conf template
<%= env.port %>
```
