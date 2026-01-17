import { Hono } from "hono";
import { env } from "cloudflare:workers";

interface Env {}

const devRun = env.PRODUCTION === "false"
const webhook = env.WEBHOOK_ENDPOINT
const proxy = env.PROXY_ENDPOINT
const healtiness = new Map<string, boolean>([["status", false]])
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/health", (c) => {
  return c.text("ok");
});

const recover = () => healtiness.set("status", true)
const reset = () => healtiness.set("status", false)
const skippable = () => healtiness.get("status")!

const alert = async () => {
  if (skippable()) {
    return
  }

  await fetch(webhook, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({    
      embeds: [{
        title: "🚨 Server Offline Alert",
        color: 15158332, // 빨간색 (Hex: #E74C3C)
        fields: [
          { name: "Server Name", value: "hub_proxy", inline: true },
          { name: "Status", value: "DOWN", inline: true },
          { name: "Last Heartbeat", value: new Date().toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul"
          }), inline: false },
          { name: "Description", value: "The deadman's switch was triggered. No ping received in the last 3 minutes." }
        ],
      }]})
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
          recover()
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
