import { screenshotPath } from "@/lib/directories.ts";
import { join } from "@std/path";

function screenshotWin() {
  const exePath = join(import.meta.dirname!, "screenshot.bat");

  const command = new Deno.Command(exePath, {
    args: [screenshotPath],
  });

  return command.output();
}

function screenshotLinux() {
  const command = new Deno.Command("flameshot", {
    args: ["screen", "-p", screenshotPath],
  });

  return command.output();
}

const screenshotFns = new Map<
  typeof Deno.build.os,
  () => Promise<Deno.CommandOutput>
>([
  ["linux", screenshotLinux],
  ["windows", screenshotWin],
]);

export function screenshot() {
  const screenshotFn = screenshotFns.get(Deno.build.os);
  if (!screenshotFn) throw new Error("Unsupported OS");

  return screenshotFn();
}

export function getScreenshot() {
  return Deno.readFile(screenshotPath);
}
