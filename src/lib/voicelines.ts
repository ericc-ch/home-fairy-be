import { voicelinesDir } from "@/lib/directories.ts";

const voicelines = await Array.fromAsync(Deno.readDir(voicelinesDir));

export function getRandomVoicelinesUrl() {
  const length = voicelines.length;
  if (length === 0) {
    return undefined;
  }

  const randomIndex = Math.round(Math.random() * length);

  const randomVoiceline = voicelines[randomIndex];

  return `/voicelines/${randomVoiceline.name}`;
}
