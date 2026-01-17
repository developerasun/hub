# hub_watchdog

a `hono` based http server with cron scheduler.

run a local worker with testing

```sh
./dev.run.sh
```

update secrets.

```sh
pnpm exec wrangler secret put <KEY>
```

deploy the worker.

```sh
pnpm run deploy
```


