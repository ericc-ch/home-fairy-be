import { websocketManager } from "@/lib/websocket.ts";
import { Hono } from "@hono/hono";
import { upgradeWebSocket } from "@hono/hono/deno";

export const wsRoutes = new Hono();

wsRoutes.get(
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
