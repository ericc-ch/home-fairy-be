import { join } from "@std/path";

export const assetsDir = join(Deno.cwd(), "assets");
export const screenshotDir = join(assetsDir, "screenshots");
export const voicelinesDir = join(assetsDir, "voicelines");
