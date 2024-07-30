import { join } from "@std/path";
import { screenshotPath } from "@/lib/directories.ts";

function screenshotWin() {
  const exePath = join(import.meta.dirname!, "screenshot.bat");

  const command = new Deno.Command(exePath, {
    args: [screenshotPath],
  });

  return command.output();
}

export function screenshot() {
  if (Deno.build.os === "windows") {
    return screenshotWin();
  } else {
    throw new Error("Unsupported OS");
  }
}

export function getScreenshot() {
  return Deno.readFile(screenshotPath);
}

setTimeout(async () => {
  await screenshot();
}, 10000);
