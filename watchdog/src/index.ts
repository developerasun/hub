import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { payload } from './template'
import { getConnection, HUMAN_BOOLEAN, tHealthiness } from "./database/schema";
import { lt } from "drizzle-orm";

const devRun = env.PRODUCTION === "false"
const webhook = env.WEBHOOK_ENDPOINT
const proxy = env.PROXY_ENDPOINT
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/health", (c) => {
  return c.text("ok");
});

const skippable = async () => {
  const { connection } = await getConnection(env.DB)
  const { status } = (await connection.select({ status: tHealthiness.status }).from(tHealthiness).limit(1).get())!
  return status
}
const recover= async (time: string) => {
  const { connection } = await getConnection(env.DB)
  const { status } = (await connection.select({ status: tHealthiness.status }).from(tHealthiness).limit(1).get())!
  if (status == HUMAN_BOOLEAN.false) {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload.restore(time))
    })
    await connection.update(tHealthiness).set({ status: HUMAN_BOOLEAN.true }).where(lt(tHealthiness.id, 10))
  }
}
const reset = async () => {
  const { connection } = await getConnection(env.DB)
  await connection.update(tHealthiness).set({ status: HUMAN_BOOLEAN.false }).where(lt(tHealthiness.id, 10))
}

const alert = async (time: string) => {
  if (await skippable()) {
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
    env: Cloudflare.Env,
    ctx: ExecutionContext,
  ) {
    const {connection} = await getConnection(env.DB)
    const rows = await connection.run("select 1 from healthiness") 
    const invalidRowCount = rows.results.length >= 2 || rows.results.length == 0

    if (invalidRowCount) {
      await connection.run("drop table healthiness")
      await connection.run(`
        CREATE TABLE healthiness (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          status integer DEFAULT 0 NOT NULL
        );
      `)
      await connection.insert(tHealthiness).values({ status: HUMAN_BOOLEAN.false })
      console.info("scheduled: Healthness table row sync fixed.")
    }
    
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
          await reset()
        }
        // @dev alert an fire and ignore
        await alert(time)
        break
    }
    console.info("cron processed");
  },
};
