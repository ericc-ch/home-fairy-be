import { websocketManager } from "@/lib/websocket.ts";
import { Hono } from "@hono/hono";
import { upgradeWebSocket } from "@hono/hono/deno";

const app = new Hono();

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onOpen: (_, ws) => {
        console.log("Websocket connection opened!");
        websocketManager.instance = ws;
      },
    };
  })
);

Deno.serve(app.fetch);
