import { getStt } from "@/services/stt/mod.ts";
import { generateTTS, waitForTTS } from "@/services/tts/mod.ts";
import { Hono } from "@hono/hono";
import { upgradeWebSocket } from "@hono/hono/deno";
import { logger } from "@hono/hono/logger";
import { WSContext } from "@hono/hono/ws";

const app = new Hono();

app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const megabytes = (size: number) => size * 1024 * 1024;

let websocket: WSContext | undefined;

const processStt = async (blob: Blob) => {
  if (!websocket) return console.log("Websocket not connected");

  console.log("Converting audio to text...");
  const sttResponse = await getStt({ body: { audio: blob } });

  console.log("Converting text to audio...");
  const ttsRequest = await generateTTS({
    body: { text: sttResponse.text },
  });

  const ttsStatus = await waitForTTS({ taskId: ttsRequest.taskId });
  websocket.send(JSON.stringify(ttsStatus));
};

app.post("/command", async (c) => {
  const body = await c.req.parseBody();

  const file = body["audio"];
  if (!(file instanceof Blob))
    return c.json({ message: "Audio file must be a File" }, 400);

  if (file.size > megabytes(100))
    return c.json({ message: "Audio file is too large" }, 400);

  processStt(file).catch((err) => {
    console.error("Error processing STT request:", err);
    if (websocket) websocket.send(JSON.stringify(err));
  });

  return c.json({ message: "Command received" }, 200);
});

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onOpen: (_, ws) => {
        console.log("Websocket connection opened!");
        websocket = ws;
      },
    };
  })
);

Deno.serve(app.fetch);
