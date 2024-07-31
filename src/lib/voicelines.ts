import { voicelinesDir } from "@/lib/directories.ts";

const voicelines = await Array.fromAsync(Deno.readDir(voicelinesDir));

export function getRandomVoicelinesUrl() {
  const length = voicelines.length;
  if (length === 0) {
    return undefined;
  }

  const randomIndex = Math.round(Math.random() * (length - 1));

  const randomVoiceline = voicelines[randomIndex];

  console.log({ randomIndex, randomVoiceline });

  return `/voicelines/${randomVoiceline.name}`;
}
