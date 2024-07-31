import { join } from "@std/path";
import { emptyDirSync } from "@std/fs";

function resetScreenshotDir() {
  return emptyDirSync(ScreenshotManager.screenshotDir);
}

function screenshotWin(path: string) {
  // Script taken from https://github.com/npocmaka/batch.scripts/blob/master/hybrids/.net/c/screenCapture.bat
  const exePath = join(import.meta.dirname!, "screenshot.bat");

  const command = new Deno.Command(exePath, {
    args: [path],
  });

  return command.output();
}

function screenshotLinux(path: string) {
  const command = new Deno.Command("flameshot", {
    args: ["screen", "-p", path],
  });

  return command.output();
}

class ScreenshotManager {
  private count = 0;
  static screenshotDir = join(Deno.cwd(), "screenshots");
  private static instance = new ScreenshotManager();

  private get screenshotPath() {
    return join(
      ScreenshotManager.screenshotDir,
      `screenshot-${this.count}.png`
    );
  }

  private osMap = new Map<
    typeof Deno.build.os,
    (path: string) => Promise<Deno.CommandOutput>
  >([
    ["linux", screenshotLinux],
    ["windows", screenshotWin],
  ]);

  private constructor() {
    resetScreenshotDir();
  }

  static getInstance() {
    if (!ScreenshotManager.instance)
      ScreenshotManager.instance = new ScreenshotManager();

    return ScreenshotManager.instance;
  }

  private incrementCount() {
    this.count++;
  }

  async screenshot() {
    const filePath = this.screenshotPath;
    const screenshotFn = this.osMap.get(Deno.build.os);

    if (!screenshotFn) throw new Error("Unsupported OS");

    await screenshotFn(filePath);
    this.incrementCount();

    return filePath;
  }
}

export const screenshotManager = ScreenshotManager.getInstance();
