import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { payload } from './template'

interface Env {}

const devRun = env.PRODUCTION === "false"
const webhook = env.WEBHOOK_ENDPOINT
const proxy = env.PROXY_ENDPOINT
const healtiness = new Map<string, boolean>([["status", false]])
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/health", (c) => {
  return c.text("ok");
});

const skippable = () => healtiness.get("status")!
const recover = async (time: string) => {
  const current = skippable()
  if (current == false) {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload.restore(time))
    })
  }

  healtiness.set("status", true)
}
const reset = () => healtiness.set("status", false)

const alert = async (time: string) => {
  if (skippable()) {
    return
  }

  await fetch(webhook, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload.alert(time))
  })
  return
}

// @dev see here: https://developers.cloudflare.com/workers/examples/multiple-cron-triggers/
export default {
  fetch: app.fetch,

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    switch (controller.cron) {
      // @dev healthcheck per 3 min
      case "*/3 * * * *":
        // @dev should not handle timestamp globally. see here: https://community.cloudflare.com/t/date-in-worker-is-reporting-thu-jan-01-1970-0000-gmt-0000/236503
        const unixTimestamp = Math.floor(Date.now() / 1000);
        const time = `<t:${unixTimestamp}:R>`

        if (devRun) {
          await alert(time)
          break
        }

        const response = await fetch(proxy);
        if (response.status == 200) {
          await recover(time)
        } else {
          reset()
        }
        // @dev alert an fire and ignore
        await alert(time)
        break
    }
    console.info("cron processed");
  },
};
