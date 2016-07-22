# pmkr/nginx

nginx docker image with dynamic conf support via [ejs](https://github.com/mde/ejs)

If you signal `SIGHUP` to the container process, the conf files will be re-compiled and nginx will reload.

## example

```sh
docker run -it       \
--net=host           \
-v $PWD/your.conf:/nginx/nginx.conf \
-v $PWD/data.yaml:/nginx/nginx.yaml \
pmkr/nginx
```

## `docker run`

```sh
# mount your nginx.conf to /nginx/nginx.conf
# conf files under /nginx will be compiled with ejs to /etc/nginx
-v /your-nginx:/nginx

# environment variables are available in conf files on the `env` property
# <%= env.port %>
-e port=1234
```

## data file

The following files can be used to pass data to conf templates, having this priority:
- `/nginx/data.js` export data as a module
- `/nginx/data.yaml`
- `/nginx/data.json`

These files will be reloaded on each conf compile. You can update the data file and then signal `SIGHUP` to reload nginx with the new data.
