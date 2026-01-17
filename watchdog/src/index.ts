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
const recover = async () => {
  const current = skippable()
  if (current == false) {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload.restore)
    })
  }

  healtiness.set("status", true)
}
const reset = () => healtiness.set("status", false)

const alert = async () => {
  if (skippable()) {
    return
  }

  await fetch(webhook, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload.alert)
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
        if (devRun) {
          await alert()
          break
        }

        const response = await fetch(proxy);
        if (response.status == 200) {
          await recover()
        } else {
          reset()
        }
        // @dev alert an fire and ignore
        await alert()
        break
    }
    console.info("cron processed");
  },
};
