import { join } from "@std/path";

export const screenshotDir = join(Deno.cwd(), "screenshots");
export const screenshotPath = join(screenshotDir, "screenshot.png");
