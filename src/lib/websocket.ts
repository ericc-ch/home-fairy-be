import { WSContext } from "@hono/hono/ws";

interface WebsocketManager {
  connections: Array<WSContext>;
  sendToAll(payload: string): void;
}

export const websocketManager: WebsocketManager = {
  connections: [],
  sendToAll: (payload: string) => {
    websocketManager.connections.forEach((connection) => {
      connection.send(payload);
    });
  },
};
