import { uploadAudioBlob, uploadImage } from "@/lib/files.ts";
import { screenshotManager } from "@/lib/screenshot/mod.ts";
import { chatSession } from "@/services/ai/ai_services.ts";
import { generateTTS, waitForTTS } from "@/services/tts/mod.ts";
import { Part } from "@google/generative-ai";
import { Hono } from "@hono/hono";
import { websocketManager } from "@/lib/websocket.ts";

export const commandRoutes = new Hono();

interface ProcessCommandOptions {
  audio: Blob;
  sendScreenshot?: boolean;
}

const TIME_LABEL = "processCommand";

async function processCommand({
  audio,
  sendScreenshot = false,
}: ProcessCommandOptions) {
  console.log("Processing command...");
  console.time(TIME_LABEL);
  if (!websocketManager.instance) return console.log("Websocket not connected");

  console.log("Uploading audio...");
  const uploadedAudio = await uploadAudioBlob(audio);
  console.timeLog(TIME_LABEL, "Audio uploaded");

  let uploadedScreenshot: Awaited<ReturnType<typeof uploadImage>> | undefined;
  if (sendScreenshot) {
    console.log("Taking screenshot...");
    const screenshotPath = await screenshotManager.screenshot();
    console.timeLog(TIME_LABEL, "Screenshot taken");

    console.log("Uploading screenshot...");
    uploadedScreenshot = await uploadImage(screenshotPath);
    console.timeLog(TIME_LABEL, "Screenshot uploaded");
  }

  const parts: Array<Part> = [uploadedScreenshot, uploadedAudio]
    .filter((part) => Boolean(part))
    .map((part) => ({
      fileData: {
        fileUri: part!.file.uri,
        mimeType: part!.file.mimeType,
      },
    }));

  console.log(
    `Sending message: ${parts.map((part) => part.fileData?.fileUri).join(", ")}`
  );
  const result = await chatSession.sendMessage(parts);
  console.timeLog(TIME_LABEL, "Message sent");

  console.log("Converting text to audio...");
  const ttsRequest = await generateTTS({
    body: {
      text: result.response.text(),
      voice: "en-US-AriaNeural",
    },
  });

  const ttsStatus = await waitForTTS({ taskId: ttsRequest.taskId });
  console.timeLog(TIME_LABEL, "Text converted to audio");

  websocketManager.instance.send(JSON.stringify(ttsStatus));
  console.log("Command processed!");
  console.timeEnd(TIME_LABEL);
}

const megabytes = (size: number) => size * 1024 * 1024;

commandRoutes.post("/command", async (c) => {
  const body = await c.req.parseBody();

  const audio = body["audio"];
  if (!(audio instanceof Blob))
    return c.json({ message: "Audio file must be a File" }, 400);

  if (audio.size > megabytes(100))
    return c.json({ message: "Audio file is too large" }, 400);

  const sendScreenshot = body["sendScreenshot"] === "true";

  processCommand({
    audio,
    sendScreenshot,
  }).catch((err) => {
    console.error("Error processing command:", err);
    if (websocketManager.instance)
      websocketManager.instance.send(JSON.stringify(err));
  });

  return c.json({ message: "Command received" }, 200);
});
