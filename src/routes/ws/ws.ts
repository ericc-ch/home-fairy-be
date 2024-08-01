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
        websocketManager.connections.push(ws);
      },
      onClose: () => {
        console.log("Websocket connection closed!");
        // Cleanup every closed connection whenever a connection is closed
        websocketManager.connections = websocketManager.connections.filter(
          (connection) => connection.readyState !== 3
        );

        console.log(
          "Remaining connections: ",
          websocketManager.connections.length
        );
      },
    };
  })
);
