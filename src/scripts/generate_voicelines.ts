import { generateTTS, waitForTTS } from "@/services/tts/mod.ts";
import { downloadTTSAudio } from "@/services/tts/tts_services.ts";
import { emptyDir } from "@std/fs";
import { join } from "@std/path";

const chunk = <T>(input: Array<T>, size: number): Array<Array<T>> => {
  return input.reduce(
    (arr: Array<Array<T>>, item: T, idx: number): Array<Array<T>> => {
      return idx % size === 0
        ? [...arr, [item]]
        : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
    },
    []
  );
};

const sanitizeFileName = (input: string) => {
  const filteredCharacters = /[,.'"\\/:*?"<>|]/g;
  return input.replaceAll(filteredCharacters, "");
};

const assetsDir = join(Deno.cwd(), "assets");
const voicelinesDir = join(assetsDir, "voicelines");
const voicelinesFile = join(assetsDir, "voicelines.txt");

await emptyDir(voicelinesDir);

const voicelines = await Deno.readTextFile(voicelinesFile);
const voicelinesArr = voicelines.split("\n");

const chunked = chunk(voicelinesArr, 10);

for (const chunk of chunked) {
  const requestPromises = chunk.map(async (voiceline) => {
    try {
      const genRequest = await generateTTS({
        body: {
          text: voiceline,
          voice: "en-US-AriaNeural",
        },
      });

      await waitForTTS({ taskId: genRequest.taskId }, 200);
      const audioBlob = await downloadTTSAudio({ taskId: genRequest.taskId });

      const fileName =
        sanitizeFileName(
          voiceline.split(" ").slice(0, 2).join("_").toLocaleLowerCase()
        ) + ".mp3";

      const filePath = join(voicelinesDir, fileName);

      await Deno.writeFile(
        filePath,
        new Uint8Array(await audioBlob.arrayBuffer())
      );

      console.log(`Generated voiceline: ${fileName}`);
    } catch (e) {
      console.error(e);
    }
  });

  await Promise.allSettled(requestPromises);
}
