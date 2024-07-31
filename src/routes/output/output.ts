import { downloadTTSAudio } from "@/services/tts/mod.ts";
import { Hono } from "@hono/hono";

export const outputRoutes = new Hono();

outputRoutes.get("/output/:file", async (c) => {
  const file = c.req.param("file");
  const taskId = file.split(".")[0];

  const response = await downloadTTSAudio({ taskId });

  return c.body(await response.arrayBuffer());
});
