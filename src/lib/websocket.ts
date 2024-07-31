import { WSContext } from "@hono/hono/ws";

interface WebsocketManager {
  instance: WSContext | undefined;
}

export const websocketManager: WebsocketManager = {
  instance: undefined,
};
